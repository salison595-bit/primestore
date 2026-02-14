/**
 * Middleware de Cache
 * Implementa estratégia de cache em memória com expiração
 * Em produção, usar Redis para cache distribuído
 */

const { logger } = require('../utils/logger');

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

const cacheManager = new CacheManager();

/**
 * Middleware para cache de resposta
 * Uso: app.use(cacheMiddleware())
 */
const cacheMiddleware = () => {
  return (req, res, next) => {
    // Apenas cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Gerar chave do cache baseado na URL e query
    const cacheKey = `${req.method}:${req.originalUrl}`;

    // Verificar se está em cache
    const cachedResponse = cacheManager.get(cacheKey);
    if (cachedResponse) {
      logger.debug('Cache hit', { url: req.originalUrl });
      return res.json(cachedResponse);
    }

    // Interceptar res.json para armazenar em cache
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Cachear apenas responses bem-sucedidas (200-299)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Determinar TTL baseado na rota
        let ttl = 300; // 5 min padrão

        if (req.path.includes('/products')) ttl = 600; // 10 min para produtos
        if (req.path.includes('/categories')) ttl = 1800; // 30 min para categorias
        if (req.path.includes('/dashboard')) ttl = 60; // 1 min para dashboard

        cacheManager.set(cacheKey, data, ttl);
        logger.debug('Response cached', { url: req.originalUrl, ttl });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Função para invalidar cache de padrões específicos
 */
const invalidateCache = (pattern) => {
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

module.exports = {
  cacheManager,
  cacheMiddleware,
  invalidateCache,
};
