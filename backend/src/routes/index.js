/**
 * Agregador de rotas
 * Importa e registra todas as rotas da aplicação
 */

import express from 'express';
import { config } from '../config/env.js';
import authRoutes from './auth.js';
import paymentRoutes from './payments.js';
import webhookRoutes from './webhooks.js';
import adminRoutes from './admin.js';
import supplierRoutes from './suppliers.js';
import emailRoutes from './email.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import wishlistRoutes from './wishlist.js';
import assetsRoutes from './assets.js';
import { cacheManager, getRedisStatus, getCacheMetrics, clearAllCache, invalidateCache } from '../middlewares/cache.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';
import { optionalAuth } from '../middlewares/auth.js';
// TODO: Importar outras rotas conforme forem criadas
// import userRoutes from './users.js';
// import productRoutes from './products.js';
// import orderRoutes from './orders.js';
// import cartRoutes from './cart.js';
// import couponRoutes from './coupons.js';
// import addressRoutes from './addresses.js';
// import categoryRoutes from './categories.js';
// import reviewRoutes from './reviews.js';

const router = express.Router();

/**
 * Healthcheck
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/cache/health', async (req, res) => {
  const redis = await getRedisStatus();
  const mem = { size: cacheManager.size() };
  const metrics = getCacheMetrics();
  res.json({ status: 'ok', redis, mem, metrics, timestamp: new Date().toISOString() });
});

// Proteção leve para rotas de cache
const adminToken = process.env.CACHE_ADMIN_TOKEN || '';
const allowedIps = (process.env.ALLOWED_CACHE_ADMIN_IPS || '').split(',').map(s => s.trim()).filter(Boolean);
const adminEnabled = (process.env.CACHE_ADMIN_ENABLED || 'true') === 'true';
const cacheAdminGuard = (req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!adminEnabled && !isDev) {
    return res.status(403).json({ status: 'error', message: 'cache admin desabilitado' });
  }
  const ipOk = allowedIps.length === 0 || allowedIps.includes(req.ip);
  const tokenOk = adminToken && req.headers['x-cache-admin-token'] === adminToken;
  const userAdmin = !!(req.user && (String(req.user.role).toLowerCase() === 'admin' || (Array.isArray(req.user.roles) && req.user.roles.includes('ADMIN'))));
  if ((isDev && ipOk) || tokenOk || userAdmin) return next();
  return res.status(403).json({ status: 'error', message: 'forbidden' });
};

// Middlewares para rotas de cache
router.use('/cache', optionalAuth);
router.use('/cache/invalidate', rateLimiter({ windowMs: 60 * 1000, maxRequests: 10, message: 'Limite de invalidações atingido' }));
router.use('/cache/clear', rateLimiter({ windowMs: 60 * 1000, maxRequests: 5, message: 'Limite de limpeza de cache atingido' }));
router.use('/cache/prewarm', rateLimiter({ windowMs: 60 * 1000, maxRequests: 3, message: 'Limite de prewarm atingido' }));

const handleCacheInvalidate = (req, res) => {
  const pattern = req.query.pattern || req.body?.pattern;
  if (!pattern) {
    return res.status(400).json({ status: 'error', message: 'pattern requerido' });
  }
  const invalidated = invalidateCache(String(pattern));
  res.json({ status: 'ok', invalidated, pattern });
};

router.get('/cache/invalidate', cacheAdminGuard, handleCacheInvalidate);
router.post('/cache/invalidate', cacheAdminGuard, handleCacheInvalidate);

router.post('/cache/clear', cacheAdminGuard, async (req, res) => {
  const result = await clearAllCache();
  res.json({ status: 'ok', ...result });
});

router.post('/cache/prewarm', cacheAdminGuard, async (req, res) => {
  const targets = [
    '/api/products?limit=12&page=1',
    '/api/products?limit=12&page=1&q=camiseta'
  ];
  const warmed = [];
  for (const path of targets) {
    try {
      const r = await fetch(`${config.API_URL}${path}`);
      warmed.push({ path, ok: r.ok, status: r.status });
    } catch (err) {
      warmed.push({ path, ok: false, error: String(err) });
    }
  }
  res.json({ status: 'ok', warmed });
});

/**
 * Assets
 */
router.use('/assets', assetsRoutes);

/**
 * Registra rotas de autenticação
 */
router.use('/auth', rateLimiter({ windowMs: 60 * 1000, maxRequests: 60 }));
router.use('/auth', authRoutes);

/**
 * Registra rotas de pagamento
 */
router.use('/payments', paymentRoutes);

/**
 * Registra rotas de webhooks
 */
router.use('/webhooks', rateLimiter({ windowMs: 60 * 1000, maxRequests: 120 }));
router.use('/webhooks', webhookRoutes);

/**
 * Registra rotas administrativas
 */
router.use('/admin', adminRoutes);

/**
 * Registra rotas de fornecedores (dropshipping)
 */
router.use('/suppliers', supplierRoutes);

/**
 * Registra rotas de email e notificações
 */
router.use('/email', emailRoutes);

/**
 * Placeholder para outras rotas
 * TODO: Descomentar e implementar conforme necessário
 */
// router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/wishlist', wishlistRoutes);
// router.use('/cart', cartRoutes);
// router.use('/coupons', couponRoutes);
// router.use('/addresses', addressRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/admin', adminRoutes);

export default router;
