/**
 * PRIME STORE - API BACKEND
 * Servidor Express com arquitetura modular profissional
 * 
 * Stack: Node.js + Express + Prisma + PostgreSQL + JWT
 * Segurança: bcrypt + JWT + Rate Limiting + Headers de Segurança
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import compression from 'compression';
import * as Sentry from '@sentry/node';

// Imports de configuração
import { validateEnv, config } from './src/config/env.js';
import { corsOptions } from './src/config/corsOptions.js';
import prisma from './src/config/database.js';
import { createLogger } from './src/utils/logger.js';

// Imports de middlewares
import { requestLogger } from './src/middlewares/requestLogger.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';
import { 
  authMiddleware, 
  authorizeRoles, 
  optionalAuth 
} from './src/middlewares/auth.js';
import {
  securityHeaders,
  sanitizeInputs,
  preventPathTraversal,
  verifyOrigin
} from './src/middlewares/security.js';
import { rateLimiter, publicApiRateLimiter } from './src/middlewares/rateLimiter.js';
import { cacheMiddleware, invalidateCache, getCacheMetrics, getRedisStatus } from './src/middlewares/cache.js';
import axios from 'axios';

// Imports de rotas
import apiRoutes from './src/routes/index.js';

// Métricas de rotas
const routeMetrics = {
  counters: new Map(),
  latencies: new Map(),
  statusCounters: new Map()
};
const pushLatency = (key, ms) => {
  const arr = routeMetrics.latencies.get(key) || [];
  arr.push(ms);
  if (arr.length > 200) arr.shift();
  routeMetrics.latencies.set(key, arr);
};
const incCounter = (key) => {
  routeMetrics.counters.set(key, (routeMetrics.counters.get(key) || 0) + 1);
};
const quantile = (arr, q) => {
  if (!arr?.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(q * (s.length - 1));
  return s[idx];
};
const businessMetrics = {
  lastUpdate: 0,
  productActiveCount: 0,
  categoryCount: 0
};
const refreshBusinessMetrics = async () => {
  try {
    const now = Date.now();
    if (now - businessMetrics.lastUpdate < 10 * 60 * 1000) return;
    const [pCount, cCount] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.category.count()
    ]);
    businessMetrics.productActiveCount = pCount;
    businessMetrics.categoryCount = cCount;
    businessMetrics.lastUpdate = now;
  } catch {}
};

// Configuração de variáveis de ambiente
if ((process.env.NODE_ENV || '').toLowerCase() === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}
validateEnv();

// Logger da aplicação
const logger = createLogger('Server');

// Inicialização do Express
const app = express();

// Sentry (opcional via SENTRY_DSN - ignora DSN inválido)
const sentryDsn = process.env.SENTRY_DSN;
const isValidSentryDsn = sentryDsn && typeof sentryDsn === 'string' && sentryDsn.includes('sentry.io') && sentryDsn.startsWith('https://');
if (isValidSentryDsn) {
  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: config.NODE_ENV
    });
    if (Sentry?.Handlers?.requestHandler) {
      app.use(Sentry.Handlers.requestHandler());
    }
  } catch {}
} else if (sentryDsn) {
  createLogger('Server').warn('SENTRY_DSN configurado mas inválido (deve conter sentry.io) - Sentry desabilitado');
}

// Importar Mercado Pago
const mp = new MercadoPagoConfig({
  accessToken: config.MP_ACCESS_TOKEN || ''
});

// ============================================================================
// MIDDLEWARES GLOBAIS
// ============================================================================

// Ordem importa: segurança primeiro
app.use(securityHeaders); // Headers de segurança
app.use(preventPathTraversal); // Previne path traversal
app.use(verifyOrigin); // Verifica origem
app.use(cors(corsOptions)); // CORS com configuração
// Stripe webhook precisa de raw body para verificação de assinatura
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(compression({ threshold: 1024 }));
app.use(express.json({ limit: '50mb' })); // Parser JSON
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Parser URL encoded
app.use(sanitizeInputs); // Sanitiza inputs
app.use(requestLogger); // Logger de requisições
app.use(publicApiRateLimiter); // Rate limiting global
app.use(cacheMiddleware()); // Cache de respostas para GET
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    try {
      const key = `${req.method} ${req.path}`;
      const durationMs = Number((process.hrtime.bigint() - start) / BigInt(1e6));
      incCounter(key);
      pushLatency(key, durationMs);
      const statusKey = `${req.method} ${req.path} ${res.statusCode}`;
      routeMetrics.statusCounters.set(statusKey, (routeMetrics.statusCounters.get(statusKey) || 0) + 1);
    } catch {}
  });
  next();
});

// ============================================================================
// ROTAS DE SAÚDE (sem autenticação)
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: '1.0.0'
    }
  });
});
app.get('/ready', async (req, res) => {
  try {
    const redis = await getRedisStatus();
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      data: {
        db: 'OK',
        redis: redis.connected ? 'OK' : (redis.enabled ? 'DISCONNECTED' : 'DISABLED'),
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: {
        message: 'Service not ready',
        details: String(err?.message || err)
      }
    });
  }
});

app.get('/api/metrics', async (req, res) => {
  const mem = process.memoryUsage();
  const uptime = process.uptime();
  const redis = await getRedisStatus();
  const cache = getCacheMetrics();
  await refreshBusinessMetrics();
  res.json({
    success: true,
    data: {
      uptime,
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external
      },
      cache,
      redis,
      business: {
        productActiveCount: businessMetrics.productActiveCount,
        categoryCount: businessMetrics.categoryCount,
        lastUpdate: new Date(businessMetrics.lastUpdate || Date.now()).toISOString()
      }
    }
  });
});
app.get('/metrics', async (req, res) => {
  const mem = process.memoryUsage();
  const uptime = process.uptime();
  const cache = getCacheMetrics();
  const redis = await getRedisStatus();
  await refreshBusinessMetrics();
  const lines = [
    `process_uptime_seconds ${uptime.toFixed(0)}`,
    `process_memory_rss_bytes ${mem.rss}`,
    `process_memory_heap_total_bytes ${mem.heapTotal}`,
    `process_memory_heap_used_bytes ${mem.heapUsed}`,
    `cache_hits_mem ${cache.hitsMem || 0}`,
    `cache_hits_redis ${cache.hitsRedis || 0}`,
    `cache_misses ${cache.misses || 0}`,
    `redis_enabled ${redis.enabled ? 1 : 0}`,
    `redis_connected ${redis.connected ? 1 : 0}`,
    `product_active_count ${businessMetrics.productActiveCount}`,
    `category_count ${businessMetrics.categoryCount}`
  ];
  for (const [key, count] of routeMetrics.counters.entries()) {
    const [method, path] = key.split(' ');
    const arr = routeMetrics.latencies.get(key) || [];
    const p95 = quantile(arr, 0.95);
    const p99 = quantile(arr, 0.99);
    lines.push(`route_requests_total{method="${method}",path="${path}"} ${count}`);
    lines.push(`route_latency_ms_p95{method="${method}",path="${path}"} ${p95}`);
    lines.push(`route_latency_ms_p99{method="${method}",path="${path}"} ${p99}`);
  }
  for (const [key, count] of routeMetrics.statusCounters.entries()) {
    const [method, path, status] = key.split(' ');
    lines.push(`route_status_total{method="${method}",path="${path}",status="${status}"} ${count}`);
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(lines.join('\n') + '\n');
});
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    data: {
      message: 'PRIME STORE API 🚀',
      version: '1.0.0',
      docs: '/api/docs'
    }
  });
});

// Limite específico para Assets Proxy
app.use('/api/assets', rateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 500,
  keyGenerator: (req) => req.ip || 'unknown',
  message: 'Limite de requisições de assets atingido'
}));
// ============================================================================
// ROTAS TEMPORÁRIAS (para retrocompatibilidade)
// TODO: Remover quando migrations estiverem completas
// ============================================================================

app.get('/products', async (req, res, next) => {
  try {
    // Compatibilidade com cliente existente
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      },
      where: { isActive: true }
    });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

app.post('/products', async (req, res, next) => {
  try {
    // Validação básica
    if (!req.body.name) {
      throw new Error('Nome é obrigatório');
    }

    const pricingByCategory = {
      'camisetas': 0.40,
      'eletronicos': 0.25,
      'acessorios': 0.50,
      'calcados': 0.35,
    };

    const psychologicalRound = (value) => {
      if (value < 50) return 59.90;
      const rounded = Math.ceil(value / 10) * 10 - 0.10;
      return parseFloat(rounded.toFixed(2));
    };

    const computeFinalPrice = (supplierPrice = 0, shippingCost = 0, margin = 0.30) => {
      let effectiveMargin = margin;
      const base = (supplierPrice + shippingCost);
      let computed = base * (1 + effectiveMargin);
      if (computed > 300) {
        effectiveMargin = Math.max(effectiveMargin - 0.05, 0);
        computed = base * (1 + effectiveMargin);
      }
      return psychologicalRound(computed);
    };

    const category = req.body.categoryId
      ? await prisma.category.findUnique({ where: { id: req.body.categoryId } })
      : null;
    const margin = req.body.marginPercent ?? category?.defaultMargin ?? pricingByCategory[(category?.slug || '').toLowerCase()] ?? 0.30;
    const supplierPrice = req.body.supplierPrice ?? req.body.costPrice ?? req.body.price ?? 0;
    const shippingCost = req.body.shippingCost ?? 0;
    const finalPrice = computeFinalPrice(supplierPrice, shippingCost, margin);

    const product = await prisma.product.create({
      data: {
        name: req.body.name,
        slug: req.body.name.toLowerCase().replace(/\s+/g, '-'),
        description: req.body.description || '',
        price: finalPrice,
        stock: parseInt(req.body.stock || 0),
        categoryId: req.body.categoryId || null,
        supplierPrice,
        marginPercent: margin,
        finalPrice,
        shippingCost,
        supplierName: req.body.supplierName,
        supplierLink: req.body.supplierLink,
        primaryImage: req.body.primaryImage,
        extraImages: req.body.extraImages,
        images: {
          create: req.body.image ? [{
            imageUrl: req.body.image,
            isPrimary: true
          }] : []
        }
      },
      include: {
        images: true,
        category: true
      }
    });

    res.status(201).json({
      success: true,
      data: product
    });
    try {
      invalidateCache('/api/products');
      invalidateCache('/products');
    } catch {}
  } catch (error) {
    next(error);
  }
});

app.post('/create-payment', async (req, res, next) => {
  try {
    const { id, title, price, items } = req.body;

    let product = null;
    if (id) {
      product = await prisma.product.findUnique({
        where: { id }
      });
    }

    if (!product && (!title || typeof price !== "number")) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Dados insuficientes para criar pagamento'
        }
      });
    }

    const preference = {
      items: items && Array.isArray(items) && items.length > 0 ? items : [
        {
          title: product ? product.name : title,
          unit_price: product ? product.price : price,
          quantity: 1
        }
      ],
      back_urls: {
        success: `${config.FRONT_URL}/success`,
        failure: `${config.FRONT_URL}/error`
      },
      auto_return: 'approved'
    };

    const prefClient = new Preference(mp);
    const response = await prefClient.create({ body: preference });
    
    res.json({ 
      success: true,
      data: {
        url: response.init_point, 
        id: response.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ROTAS DA API
// ============================================================================

/**
 * Registra todas as rotas sob prefixo /api
 * Inclui:
 * - /api/auth - Autenticação (login, register, etc)
 * - /api/users - Gerenciamento de usuários
 * - /api/products - Gestão de produtos
 * - /api/orders - Pedidos
 * - /api/cart - Carrinho de compras
 * - /api/payments - Pagamentos
 * - /api/coupons - Cupons de desconto
 * - /api/addresses - Endereços de usuário
 * - /api/categories - Categorias de produtos
 * - /api/reviews - Avaliações
 * - /api/admin - Painel administrativo
 * - /api/webhooks - Webhooks de pagamento
 */
app.use('/api', apiRoutes);

// ============================================================================
// TRATAMENTO DE ERROS
// ============================================================================

// 404 - Rota não encontrada
app.use(notFoundHandler);

// Handler global de erros (DEVE ser o último)
app.use(errorHandler);

// ============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

const PORT = process.env.PORT || 3333;

const startServer = async () => {
  try {
    // Testa conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Conexão com banco de dados estabelecida');

    // Inicia servidor
    app.listen(PORT, async () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📝 Ambiente: ${config.NODE_ENV}`);
      logger.info(`🔐 CORS habilitado para: ${config.FRONT_URL}`);
      logger.info(`📊 Banco de dados: PostgreSQL`);
      console.log('\n' + '='.repeat(50));
      console.log('  PRIME STORE - API ONLINE 🚀');
      console.log(`  URL: http://localhost:${PORT}`);
      console.log('='.repeat(50) + '\n');
      try {
        if ((process.env.PREWARM_ON_START || 'false') === 'true') {
          const base = `http://localhost:${PORT}`;
          logger.info('Prewarm de cache iniciado');
          const targets = [
            `${base}/api/products?limit=12&page=1`,
            `${base}/api/products/featured?limit=12`,
            `${base}/api/products?limit=12&page=1&sort=createdAt&order=desc`,
            `${base}/api/products?limit=12&page=1&sort=price&order=asc`
          ];
          const queries = String(process.env.PREWARM_QUERIES || '').split(',').map(q => q.trim()).filter(Boolean);
          for (const q of queries) {
            targets.push(`${base}/api/products?limit=12&page=1&q=${encodeURIComponent(q)}`);
          }
          for (const url of targets) {
            try {
              await axios.get(url, { timeout: 8000 });
              logger.debug('Prewarm fetch concluído', { url });
            } catch (err) {
              logger.warn('Prewarm fetch falhou', { url, err: String(err?.message || err) });
            }
          }
          logger.info('Prewarm de cache finalizado');
        }
      } catch (err) {
        logger.warn('Falha ao realizar prewarm', { err: String(err) });
      }
    try {
      const minutes = parseInt(process.env.PREWARM_SCHEDULE_MINUTES || '0', 10);
      if (minutes > 0) {
        const base = `http://localhost:${PORT}`;
        setInterval(async () => {
          try {
            logger.info('Prewarm de cache agendado iniciado');
            const targets = [
              `${base}/api/products?limit=12&page=1`,
              `${base}/api/products/featured?limit=12`,
              `${base}/api/products?limit=12&page=1&sort=createdAt&order=desc`,
              `${base}/api/products?limit=12&page=1&sort=price&order=asc`
            ];
            const queries = String(process.env.PREWARM_QUERIES || '').split(',').map(q => q.trim()).filter(Boolean);
            for (const q of queries) {
              targets.push(`${base}/api/products?limit=12&page=1&q=${encodeURIComponent(q)}`);
            }
            for (const url of targets) {
              try {
                await axios.get(url, { timeout: 8000 });
                logger.debug('Prewarm fetch concluído', { url });
              } catch (err) {
                logger.warn('Prewarm fetch falhou', { url, err: String(err?.message || err) });
              }
            }
            logger.info('Prewarm de cache agendado finalizado');
          } catch (err) {
            logger.warn('Falha no prewarm agendado', { err: String(err) });
          }
        }, minutes * 60 * 1000);
        logger.info(`Prewarm agendado a cada ${minutes} minutos`);
      }
    } catch {}
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Encerrando servidor...');
  await prisma.$disconnect();
  logger.info('✅ Conexão com banco encerrada');
  process.exit(0);
});

// Inicia o servidor
if ((process.env.NODE_ENV || '').toLowerCase() !== 'test') {
  startServer();
}

export { app, startServer };
