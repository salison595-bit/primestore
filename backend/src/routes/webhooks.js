/**
 * Rotas de webhooks
 * POST /api/webhooks/mercadopago - Receber webhook Mercado Pago
 * POST /api/webhooks/stripe     - Receber webhook Stripe
 * POST /api/webhooks/test       - Teste de webhook
 * GET  /api/webhooks/events     - Listar eventos (ADMIN only)
 * GET  /api/webhooks/events/:id - Detalhes do evento (ADMIN only)
 */

import express from 'express';
import WebhookController from '../controllers/webhookController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

/**
 * POST /api/webhooks/mercadopago
 * Recebe webhook do Mercado Pago com validação de assinatura HMAC-SHA256
 * Public - Não requer autenticação
 *
 * Headers esperados:
 * - x-signature: HMAC SHA256(id|timestamp|secret)
 * - x-signature-ts: timestamp
 *
 * Body:
 * {
 *   "id": "notification_id",
 *   "type": "payment|payment_intent|merchant_order",
 *   "data": { ... }
 * }
 */
router.post(
  '/mercadopago',
  WebhookController.handleMercadoPagoWebhook.bind(WebhookController)
);

/**
 * POST /api/webhooks/stripe
 * Recebe webhook do Stripe
 * Public - Não requer autenticação
 */
router.post(
  '/stripe',
  WebhookController.handleStripeWebhook.bind(WebhookController)
);

/**
 * POST /api/webhooks/test
 * Webhook de teste para verificar conectividade
 * Public
 *
 * Body (exemplo):
 * { "test": true, "message": "Teste webhook" }
 */
router.post(
  '/test',
  WebhookController.testWebhook.bind(WebhookController)
);

/**
 * GET /api/webhooks/events
 * Listar eventos de webhook (para debug/monitoring)
 * ADMIN only
 *
 * Query params:
 * - provider: "MERCADO_PAGO" | "STRIPE"
 * - status: "PROCESSING" | "COMPLETED" | "FAILED"
 * - limit: 20 (padrão)
 * - offset: 0 (padrão)
 */
router.get(
  '/events',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  WebhookController.listWebhookEvents.bind(WebhookController)
);

/**
 * GET /api/webhooks/events/:id
 * Detalhes de um evento específico
 * ADMIN only
 */
router.get(
  '/events/:id',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  WebhookController.getWebhookEvent.bind(WebhookController)
);

export default router;
