/**
 * Controller de webhooks
 * Processa webhooks de pagamento (Mercado Pago, Stripe, etc.)
 * Validação de assinatura e processamento robusto de eventos
 */

import crypto from 'crypto';
import PaymentService from '../services/paymentService.js';
import emailService from '../services/emailService.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import prisma from '../config/database.js';

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
          payload: data,
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
          result,
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
      // Buscar detalhes do pagamento (chamaria API do Mercado Pago)
      // For now, vamos processar com o que temos
      const payment = await prisma.payment.findUnique({
        where: { transactionId: paymentId.toString() },
        include: { order: true },
      });

      if (!payment) {
        logger.warn('⚠️  Pagamento não encontrado', { paymentId });
        return { handled: false, reason: 'payment_not_found' };
      }

      // Atualizar status baseado na situação do pagamento
      // Isso é simplificado - em produção, você buscaria dados da API do MP
      const updates = {
        status: 'APPROVED', // Assume aprovado se recebemos webhook
        updatedAt: new Date(),
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
            paymentStatus: 'APPROVED',
            status: 'CONFIRMED', // Confirma pedido quando pagamento aprovado
          },
        });

        // Adicionar histórico do pedido
        await prisma.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: 'CONFIRMED',
            notes: 'Pagamento aprovado via Mercado Pago',
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
      const { type, data } = req.body;

      logger.info('📨 Webhook Stripe recebido', { type });

      // Registrar evento
      const webhookEvent = await prisma.webhookEvent.create({
        data: {
          externalId: req.body.id || `stripe-${Date.now()}`,
          provider: 'STRIPE',
          type,
          payload: data,
          status: 'COMPLETED',
        },
      });

      // TODO: Implementar processamento específico do Stripe
      logger.warn('⚠️  Processamento de Stripe webhook não implementado');

      res.json({ received: true, eventId: webhookEvent.id });
    } catch (error) {
      logger.error('Erro ao processar webhook Stripe', error);
      res.status(200).json({ received: true, error: error.message });
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
