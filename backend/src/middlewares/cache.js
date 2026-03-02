import { createLogger } from '../utils/logger.js';
import { createClient } from 'redis';
import { CACHE_TTLS } from '../config/constants.js';
const logger = createLogger('CacheMiddleware');

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Obter valor do cache
   */
  get(key) {
    const entry = this.cache.get(key);
    if (entry) {
      return entry.value;
    }
    return null;
  }

  /**
   * Definir valor no cache com TTL (em segundos)
   */
  set(key, value, ttl = 300) {
    // Limpar timer anterior se existir
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    this.cache.set(key, {
      value,
      createdAt: Date.now(),
    });

    // Configurar expiração
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
      logger.debug('Cache expirado', { key });
      try { metrics.expires++; } catch {}
    }, ttl * 1000);

    this.timers.set(key, timer);
  }

  /**
   * Limpar cache específico
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Obter tamanho do cache
   */
  size() {
    return this.cache.size;
  }
}

export const cacheManager = new CacheManager();

// Redis client (opcional)
let redisClient = null;
const redisUrl = process.env.REDIS_URL;
const KEY_PREFIX = process.env.CACHE_KEY_PREFIX || 'prime:';
if (redisUrl) {
  try {
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', (err) => logger.warn('Redis error', { err: String(err) }));
    // Lazy connect: conecta no primeiro uso
  } catch (err) {
    logger.warn('Falha ao inicializar Redis client', { err: String(err) });
    redisClient = null;
  }
}

export const getRedisStatus = async () => {
  const info = { enabled: Boolean(redisClient), connected: false };
  if (!redisClient) return info;
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    await redisClient.ping();
    info.connected = true;
    try {
      const scan = await redisClient.scan(0, { MATCH: 'GET:/api/products*', COUNT: 100 });
      info.sampleKeys = Array.isArray(scan) ? scan[1]?.length ?? 0 : 0;
    } catch {}
  } catch (err) {
    info.error = String(err);
  }
  return info;
};

const metrics = {
  hitsMem: 0,
  hitsRedis: 0,
  setsMem: 0,
  setsRedis: 0,
  misses: 0,
  expires: 0
};

export const getCacheMetrics = () => ({ ...metrics });

export const clearAllCache = async () => {
  const clearedMem = cacheManager.size();
  cacheManager.clear();
  let clearedRedis = 0;
  if (redisClient) {
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      const pattern = `${KEY_PREFIX}GET:*`;
      let cursor = 0;
      do {
        const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = Array.isArray(reply) ? Number(reply[0]) : 0;
        const keys = Array.isArray(reply) ? reply[1] || [] : [];
        if (keys.length) {
          await redisClient.del(keys);
          clearedRedis += keys.length;
        }
      } while (cursor !== 0);
    } catch (err) {
      logger.warn('Falha ao limpar chaves no Redis', { err: String(err) });
    }
  }
  return { clearedMem, clearedRedis };
};
/**
 * Middleware para cache de resposta
 * Uso: app.use(cacheMiddleware())
 */
export const cacheMiddleware = () => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${KEY_PREFIX}${req.method}:${req.originalUrl}`;
    const tryRedis = async () => {
      if (!redisClient) return null;
      try {
        if (!redisClient.isOpen) {
          await redisClient.connect();
        }
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          logger.debug('Cache hit (redis)', { url: req.originalUrl });
          try { metrics.hitsRedis++; } catch {}
          return JSON.parse(cached);
        }
      } catch (err) {
        logger.warn('Redis get falhou; fallback memória', { err: String(err) });
      }
      return null;
    };

    (async () => {
      try {
        const redisData = await tryRedis();
        if (redisData) {
          return res.json(redisData);
        }

        const memData = cacheManager.get(cacheKey);
        if (memData) {
          logger.debug('Cache hit (mem)', { url: req.originalUrl });
          try { metrics.hitsMem++; } catch {}
          return res.json(memData);
        }
        try { metrics.misses++; } catch {}
      } catch {
        // Ignorar erros de cache
      }

      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          let ttl = CACHE_TTLS.default;
          if (req.path.includes('/products')) ttl = CACHE_TTLS.products;
          if (req.path.includes('/categories')) ttl = CACHE_TTLS.categories;
          if (req.path.includes('/dashboard')) ttl = CACHE_TTLS.dashboard;

          // memória
          cacheManager.set(cacheKey, data, ttl);
          logger.debug('Response cached (mem)', { url: req.originalUrl, ttl });

          // redis
          if (redisClient) {
            try {
              if (!redisClient.isOpen) {
                await redisClient.connect();
              }
              await redisClient.setEx(cacheKey, ttl, JSON.stringify(data));
              logger.debug('Response cached (redis)', { url: req.originalUrl, ttl });
            } catch (err) {
              logger.warn('Redis set falhou; mantido cache em memória', { err: String(err) });
            }
          }
        }
        return originalJson(data);
      };

      next();
    })();
  };
};

/**
 * Função para invalidar cache de padrões específicos
 */
export const invalidateCache = (pattern) => {
  let count = 0;
  for (const [key] of cacheManager.cache) {
    if (key.includes(pattern)) {
      cacheManager.delete(key);
      count++;
    }
  }
  logger.info('Cache invalidated', { pattern, count });
  return count;
};

export const invalidateCacheRedis = async (pattern) => {
  let clearedRedis = 0;
  if (!redisClient) return clearedRedis;
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
    const match = `${KEY_PREFIX}GET:*${pattern}*`;
    let cursor = 0;
    do {
      const reply = await redisClient.scan(cursor, { MATCH: match, COUNT: 100 });
      cursor = Array.isArray(reply) ? Number(reply[0]) : 0;
      const keys = Array.isArray(reply) ? reply[1] || [] : [];
      if (keys.length) {
        await redisClient.del(keys);
        clearedRedis += keys.length;
      }
    } while (cursor !== 0);
    logger.info('Redis cache invalidated', { pattern, clearedRedis });
  } catch (err) {
    logger.warn('Falha ao invalidar chaves no Redis', { err: String(err), pattern });
  }
  return clearedRedis;
};
