/**
 * Agregador de rotas
 * Importa e registra todas as rotas da aplicação
 */

import express from 'express';
import authRoutes from './auth.js';
import paymentRoutes from './payments.js';
import webhookRoutes from './webhooks.js';
import adminRoutes from './admin.js';
import supplierRoutes from './suppliers.js';
import emailRoutes from './email.js';
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
 * Registra rotas de autenticação
 */
router.use('/auth', authRoutes);

/**
 * Registra rotas de pagamento
 */
router.use('/payments', paymentRoutes);

/**
 * Registra rotas de webhooks
 */
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
// router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);
// router.use('/cart', cartRoutes);
// router.use('/coupons', couponRoutes);
// router.use('/addresses', addressRoutes);
// router.use('/categories', categoryRoutes);
// router.use('/reviews', reviewRoutes);
// router.use('/admin', adminRoutes);

export default router;
