/**
 * Rotas de pagamento
 * POST /api/payments/create-preference
 * POST /api/payments/process
 * GET  /api/payments/:paymentId
 * GET  /api/payments
 * POST /api/payments/:paymentId/refund
 * POST /api/payments/:paymentId/cancel
 */

import express from 'express';
import PaymentController from '../controllers/paymentController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';

const router = express.Router();

/**
 * POST /api/payments/create-preference
 * Cria preferência no Mercado Pago
 * Protected - Cliente ou Admin
 */
router.post(
  '/create-preference',
  authMiddleware,
  PaymentController.createMercadoPagoPreference
);

/**
 * POST /api/payments/process
 * Processa pagamento
 * Protected - Cliente
 */
router.post(
  '/process',
  authMiddleware,
  PaymentController.processPayment
);

/**
 * GET /api/payments/:paymentId
 * Obtém um pagamento
 * Protected - Cliente (pode ver seu próprio)
 */
router.get(
  '/:paymentId',
  authMiddleware,
  PaymentController.getPayment
);

/**
 * GET /api/payments
 * Lista pagamentos do usuário
 * Protected - Cliente
 */
router.get(
  '/',
  authMiddleware,
  PaymentController.getUserPayments
);

/**
 * POST /api/payments/:paymentId/refund
 * Reembolsa um pagamento
 * Protected - Admin
 */
router.post(
  '/:paymentId/refund',
  authMiddleware,
  authorizeRoles(['ADMIN']),
  PaymentController.refundPayment
);

/**
 * POST /api/payments/:paymentId/cancel
 * Cancela um pagamento
 * Protected - Admin
 */
router.post(
  '/:paymentId/cancel',
  authMiddleware,
  authorizeRoles(['ADMIN']),
  PaymentController.cancelPayment
);

export default router;
