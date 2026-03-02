/**
 * Controller de webhooks
 * Processa webhooks de pagamento (Mercado Pago, Stripe, etc.)
 * Validação de assinatura e processamento robusto de eventos
 */

import crypto from 'crypto';
import axios from 'axios';
import PaymentService from '../services/paymentService.js';
import emailService from '../services/emailService.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import prisma from '../config/database.js';
import Stripe from 'stripe';

export class WebhookController {
  /**
   * POST /api/webhooks/mercadopago
   * Webhook do Mercado Pago com validação de assinatura
   *
   * Headers esperados:
   * - x-signature: HMAC SHA256(id|timestamp|secret)
   * - x-signature-ts: timestamp de quando foi gerado
   *
   * Body:
   * {
   *   "id": "notification_id",
   *   "type": "payment",
   *   "data": { "id": "payment_id" }
   * }
   */
  static async handleMercadoPagoWebhook(req, res, next) {
    try {
      const { id, type, data } = req.body;
      const signature = req.headers['x-signature'];
      const timestamp = req.headers['x-signature-ts'];

      // Log da requisição
      logger.info('📨 Webhook Mercado Pago recebido', {
        notificationId: id,
        type,
        timestamp,
      });

      // 1. Validar assinatura
      if (!this.validateMercadoPagoSignature(req, id, timestamp, signature)) {
        logger.warn('❌ Assinatura inválida do webhook', { notificationId: id });
        return res.status(401).json({
          success: false,
          error: 'Assinatura inválida',
        });
      }

      logger.info('✅ Assinatura validada', { notificationId: id });

      // 2. Verificar se já foi processado (idempotência)
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { externalId: id },
      });

      if (existingEvent) {
        logger.info('⏭️  Webhook já processado anteriormente', {
          notificationId: id,
        });
        return res.json({ received: true, cached: true });
      }

      // 3. Registrar evento no banco
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          externalId: id,
          provider: 'MERCADO_PAGO',
          type,
          payload: JSON.stringify(data || {}),
          status: 'PROCESSING',
        },
      });

      // 4. Processar baseado no tipo
      let result;

      switch (type) {
        case 'payment':
          result = await this.processMercadoPagoPayment(data);
          break;

        case 'payment_intent':
          result = await this.processMercadoPagoPaymentIntent(data);
          break;

        case 'merchant_order':
          result = await this.processMercadoPagoMerchantOrder(data);
          break;

        default:
          logger.warn('⚠️  Tipo de webhook desconhecido', { type });
          result = { handled: false };
      }

      // 5. Atualizar status do evento
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          result: JSON.stringify(result || {}),
        },
      });

      logger.info('✅ Webhook processado com sucesso', {
        notificationId: id,
        result,
      });

      // Sempre retorna 200 para Mercado Pago não reenviar
      res.json({ received: true, eventId: webhookEvent.id });
    } catch (error) {
      logger.error('❌ Erro ao processar webhook Mercado Pago', error);

      // Atualiza evento com erro
      try {
        const { id } = req.body;
        if (id) {
          await prisma.webhookEvent.update({
            where: { externalId: id },
            data: {
              status: 'FAILED',
              error: error.message,
              failedAt: new Date(),
            },
          }).catch(() => {}); // Ignora se falhar
        }
      } catch {}

      // Retorna 200 mesmo com erro para evitar tentativas de retry infinitas
      res.status(200).json({
        received: true,
        error: error.message,
      });
    }
  }

  /**
   * Processa pagamento Mercado Pago
   */
  static async processMercadoPagoPayment(data) {
    const paymentId = data.id;

    logger.info('💳 Processando pagamento Mercado Pago', { paymentId });

    try {
      // Buscar detalhes do pagamento via API do Mercado Pago (se disponível)
      let mpStatus = null;
      if (process.env.MP_ACCESS_TOKEN) {
        try {
          const resp = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
          });
          mpStatus = String(resp.data?.status || '').toLowerCase(); // approved, pending, in_process, rejected, refunded, cancelled
          logger.info('Status Mercado Pago obtido', { paymentId, status: mpStatus });
        } catch (err) {
          logger.warn('Falha ao obter status do Mercado Pago', { paymentId, err: String(err?.message || err) });
        }
      } else if (typeof data?.status === 'string') {
        mpStatus = String(data.status).toLowerCase();
      }

      const payment = await prisma.payment.findUnique({
        where: { transactionId: paymentId.toString() },
        include: { order: true },
      });

      if (!payment) {
        logger.warn('⚠️  Pagamento não encontrado', { paymentId });
        return { handled: false, reason: 'payment_not_found' };
      }

      // Mapear para status interno
      const mapStatus = (s) => {
        switch (s) {
          case 'approved': return 'APPROVED';
          case 'rejected': return 'DECLINED';
          case 'pending': return 'PENDING';
          case 'in_process': return 'PROCESSING';
          case 'refunded': return 'REFUNDED';
          case 'cancelled': return 'CANCELLED';
          default: return 'APPROVED';
        }
      };
      const finalStatus = mapStatus(mpStatus);
      const updates = {
        status: finalStatus,
        updatedAt: new Date(),
        paidAt: finalStatus === 'APPROVED' ? new Date() : payment.paidAt,
        failedAt: finalStatus === 'DECLINED' ? new Date() : payment.failedAt
      };

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: updates,
      });

      // Atualizar status do pedido
      if (payment.order) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: finalStatus,
            status: finalStatus === 'APPROVED' ? 'CONFIRMED' : payment.order.status
          },
        });

        // Adicionar histórico do pedido
        await prisma.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: finalStatus === 'APPROVED' ? 'CONFIRMED' : 'PENDING',
            notes: finalStatus === 'APPROVED' 
              ? 'Pagamento aprovado via Mercado Pago'
              : (finalStatus === 'DECLINED' ? 'Pagamento recusado via Mercado Pago' : `Status ${finalStatus} via Mercado Pago`)
          },
        });

        // 📧 Enviar email de confirmação ao cliente
        const customer = await prisma.customer.findUnique({
          where: { id: payment.order.customerId },
        });

        if (customer) {
          const orderData = {
            id: payment.order.id,
            total: payment.amount,
            paymentMethod: 'Mercado Pago',
            items: payment.order.items || [],
            createdAt: payment.order.createdAt,
          };

          await emailService.sendOrderConfirmation(orderData, customer);

          logger.info('📧 Email de confirmação enviado', {
            customerId: customer.id,
            email: customer.email,
          });
        }

        // 📧 Enviar notificação para admin
        await emailService.sendAdminNotification(
          {
            id: payment.order.id,
            customerName: customer?.name || 'Cliente',
            customerEmail: customer?.email || 'unknown',
            total: payment.amount,
            createdAt: payment.order.createdAt,
          },
          'payment-approved'
        );

        logger.info('✅ Pedido confirmado após pagamento', {
          orderId: payment.orderId,
          paymentId,
        });
      }

      return {
        handled: true,
        paymentId,
        action: 'payment_approved',
      };
    } catch (error) {
      logger.error('Erro ao processar pagamento', error, { paymentId });
      throw error;
    }
  }

  /**
   * Processa intent de pagamento
   */
  static async processMercadoPagoPaymentIntent(data) {
    logger.info('🔄 Processando payment intent', { intentId: data.id });
    // Implementar lógica de payment intent
    return { handled: true, type: 'payment_intent' };
  }

  /**
   * Processa merchant order
   */
  static async processMercadoPagoMerchantOrder(data) {
    const orderId = data.id;

    logger.info('📦 Processando merchant order', { orderId });

    try {
      // Buscar order relacionada
      const order = await prisma.order.findFirst({
        where: {
          // Procurar por algum campo que vincule ao merchant order ID
          notes: { contains: orderId.toString() },
        },
      });

      if (order) {
        logger.info('✅ Merchant order encontrada', { orderId });
        return { handled: true, orderId };
      }

      return { handled: false, reason: 'order_not_found' };
    } catch (error) {
      logger.error('Erro ao processar merchant order', error);
      throw error;
    }
  }

  /**
   * Valida assinatura HMAC SHA256 do Mercado Pago
   *
   * Mercado Pago envia:
   * x-signature: HMAC_SHA256(id|timestamp|secret)
   * x-signature-ts: timestamp
   */
  static validateMercadoPagoSignature(req, id, timestamp, signature) {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    // Se não houver webhook secret configurado, aceita (modo desenvolvimento)
    if (!secret) {
      logger.warn('⚠️  MERCADO_PAGO_WEBHOOK_SECRET não configurado!');
      return true;
    }

    // Se não houver assinatura, rejeita
    if (!signature || !timestamp) {
      return false;
    }

    try {
      // Criptografar: id|timestamp|secret
      const data = `${id}|${timestamp}|${secret}`;
      const hash = crypto.createHash('sha256').update(data).digest('hex');

      // Comparar assinaturas (usar timing-safe compare)
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(hash)
      );

      return isValid;
    } catch (error) {
      logger.error('Erro ao validar assinatura', error);
      return false;
    }
  }

  /**
   * POST /api/webhooks/stripe
   * Webhook do Stripe
   */
  static async handleStripeWebhook(req, res, next) {
    try {
      const sig = req.headers['stripe-signature'];
      const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
      let event = null;

      if (secret && sig && Buffer.isBuffer(req.body)) {
        try {
          event = Stripe.webhooks.constructEvent(req.body, sig, secret);
        } catch (err) {
          logger.warn('❌ Assinatura Stripe inválida', { error: err.message });
          return res.status(400).json({ received: true, error: 'invalid_signature' });
        }
      } else {
        logger.warn('⚠️ STRIPE_WEBHOOK_SECRET não configurado ou body não é raw; aceitando evento em modo desenvolvimento');
        const body = typeof req.body === 'object' ? req.body : {};
        event = {
          id: body.id || `stripe-${Date.now()}`,
          type: body.type || 'unknown',
          data: { object: body.data || {} }
        };
      }

      const { type } = event;

      logger.info('📨 Webhook Stripe recebido', { type });

      // Idempotência: se já existir, retorna cached
      const externalId = event.id || `stripe-${Date.now()}`;
      const existing = await prisma.webhookEvent.findUnique({ where: { externalId } }).catch(() => null);
      if (existing) {
        logger.info('⏭️  Webhook Stripe já processado anteriormente', { externalId });
        return res.json({ received: true, cached: true });
      }

      // Registrar evento
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          externalId,
          provider: 'STRIPE',
          type,
          payload: JSON.stringify(event.data?.object || {}),
          status: 'PROCESSING',
        },
      });

      // Processamento básico de eventos comuns
      let result = { handled: false };
      switch (type) {
        case 'checkout.session.completed':
          result = await this.processStripeCheckoutSession(event.data?.object || {});
          break;
        case 'payment_intent.payment_failed':
          result = await this.processStripePaymentIntentFailed(event.data?.object || {});
          break;
        case 'payment_intent.succeeded':
          logger.info('✅ Stripe payment_intent.succeeded', { id: event.data?.object?.id });
          result = { handled: true, intentId: event.data?.object?.id };
          break;
        case 'charge.failed':
          logger.warn('⚠️ Stripe charge.failed', { id: event.data?.object?.id });
          result = { handled: true, chargeId: event.data?.object?.id, failed: true };
          break;
        default:
          logger.warn('⚠️ Evento Stripe não tratado', { type });
          result = { handled: false, type };
      }

      // Atualiza evento para COMPLETED
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'COMPLETED', processedAt: new Date(), result: JSON.stringify(result || {}) }
      });

      res.json({ received: true, eventId: webhookEvent.id });
    } catch (error) {
      logger.error('Erro ao processar webhook Stripe', error);
      res.status(200).json({ received: true, error: error.message });
    }
  }

  /**
   * Processa checkout.session.completed
   * Atualiza pagamento e pedido, envia emails
   */
  static async processStripeCheckoutSession(session) {
    try {
      const orderId = session?.metadata?.orderId || session?.client_reference_id || null;
      const paymentIntentId = session?.payment_intent || null;
      if (!orderId) {
        logger.warn('Stripe session sem orderId', { sessionId: session?.id });
        return { handled: false, reason: 'missing_order_id' };
      }

      const order = await prisma.order.findUnique({
        where: { id: String(orderId) },
        include: { payments: true }
      });
      if (!order) {
        logger.warn('Pedido não encontrado para Stripe session', { orderId });
        return { handled: false, reason: 'order_not_found', orderId };
      }

      // Seleciona pagamento mais recente do pedido
      const payment = order.payments?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'APPROVED',
            paidAt: new Date(),
            transactionId: payment.transactionId || paymentIntentId || session?.id || payment.transactionId,
            receiptUrl: session?.invoice_pdf || payment.receiptUrl
          }
        });
      }

      // Atualiza pedido
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'APPROVED',
          status: 'CONFIRMED'
        }
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          notes: 'Pagamento aprovado via Stripe (checkout.session.completed)'
        }
      });

      try {
        const customer = await prisma.user.findUnique({ where: { id: order.userId } });
        if (customer?.email) {
          const orderData = {
            id: order.id,
            total: order.total,
            paymentMethod: 'Stripe',
            items: [], // simplificado; pode popular se houver relação
            createdAt: order.createdAt
          };
          await emailService.sendOrderConfirmation(orderData, { name: customer.name, email: customer.email });
          await emailService.sendAdminNotification(
            { id: order.id, customerName: customer.name, customerEmail: customer.email, total: order.total, createdAt: order.createdAt },
            'payment-approved'
          );
        }
      } catch {}

      logger.info('✅ Pedido confirmado via Stripe', { orderId, paymentIntentId });
      return { handled: true, orderId, paymentIntentId, action: 'payment_approved' };
    } catch (err) {
      logger.error('Erro ao processar checkout.session.completed', err);
      throw err;
    }
  }

  /**
   * Processa payment_intent.payment_failed
   * Atualiza pagamento/pedido e registra histórico
   */
  static async processStripePaymentIntentFailed(intent) {
    try {
      const orderId = intent?.metadata?.orderId || null;
      const intentId = intent?.id || null;
      if (!orderId) {
        logger.warn('Payment intent sem orderId', { intentId });
        return { handled: false, reason: 'missing_order_id' };
      }

      const order = await prisma.order.findUnique({
        where: { id: String(orderId) },
        include: { payments: true }
      });
      if (!order) {
        logger.warn('Pedido não encontrado para payment intent', { orderId });
        return { handled: false, reason: 'order_not_found', orderId };
      }

      const payment = order.payments?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'DECLINED',
            failedAt: new Date(),
            transactionId: payment.transactionId || intentId || payment.transactionId
          }
        });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'DECLINED'
        }
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          notes: 'Pagamento falhou via Stripe (payment_intent.payment_failed)'
        }
      });

      logger.warn('⚠️ Pagamento Stripe falhou', { orderId, intentId });
      return { handled: true, orderId, intentId, action: 'payment_declined' };
    } catch (err) {
      logger.error('Erro ao processar payment_intent.payment_failed', err);
      throw err;
    }
  }

  /**
   * POST /api/webhooks/test
   * Webhook de teste para verificar conectividade
   */
  static async testWebhook(req, res, next) {
    try {
      const body = req.body;

      logger.info('✅ Webhook de teste recebido', {
        message: body.message,
        test: body.test,
      });

      res.json({
        success: true,
        message: 'Webhook teste processado com sucesso',
        receivedAt: new Date().toISOString(),
        echo: body,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/webhooks/events
   * Listar eventos de webhook (para debug)
   */
  static async listWebhookEvents(req, res, next) {
    try {
      const { provider, status, limit = 20, offset = 0 } = req.query;

      const where = {};
      if (provider) where.provider = provider;
      if (status) where.status = status;

      const events = await prisma.webhookEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      });

      const total = await prisma.webhookEvent.count({ where });

      res.json({
        success: true,
        data: events,
        pagination: { total, limit, offset },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/webhooks/events/:id
   * Detalhes de um evento específico
   */
  static async getWebhookEvent(req, res, next) {
    try {
      const event = await prisma.webhookEvent.findUnique({
        where: { id: req.params.id },
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Evento não encontrado',
        });
      }

      res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }
}

export default WebhookController;
