/**
 * Service de pagamento
 * Lógica de integração com gateways de pagamento
 */

import prisma from '../config/database.js';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { config } from '../config/env.js';
import { createLogger } from '../utils/logger.js';
import {
  ValidationError,
  PaymentError,
  NotFoundError,
  InsufficientStockError
} from '../utils/errors.js';

const logger = createLogger('PaymentService');

// Inicializa Mercado Pago
const mpConfig = new MercadoPagoConfig({
  accessToken: config.MP_ACCESS_TOKEN
});

export class PaymentService {
  /**
   * Cria preferência de pagamento no Mercado Pago
   * @param {Object} data - { orderId, items, total }
   * @returns {Promise<Object>} - { initPoint, preferenceId }
   */
  static async createMercadoPagoPreference(data) {
    try {
      const { orderId, items, total } = data;

      // Formata itens para Mercado Pago
      const mpItems = items.map(item => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price
      }));

      const preference = {
        items: mpItems,
        payer: {
          email: data.email,
          name: data.customerName
        },
        back_urls: {
          success: `${config.FRONT_URL}/success?order=${orderId}`,
          pending: `${config.FRONT_URL}/pending?order=${orderId}`,
          failure: `${config.FRONT_URL}/error?order=${orderId}`
        },
        auto_return: 'approved',
        external_reference: orderId,
        notification_url: `${config.API_URL}/webhooks/mercadopago`,
        statement_descriptor: 'PRIME STORE'
      };

      const prefClient = new Preference(mpConfig);
      const response = await prefClient.create({ body: preference });

      logger.info('Preferência de pagamento criada', {
        orderId,
        preferenceId: response.id,
        total
      });

      return {
        initPoint: response.init_point,
        preferenceId: response.id
      };
    } catch (error) {
      logger.error('Erro ao criar preferência de pagamento', error);
      throw new PaymentError('Erro ao criar preferência de pagamento');
    }
  }

  /**
   * Valida tipo de pagamento
   * @param {string} paymentMethod - 'CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO'
   * @returns {boolean}
   */
  static validatePaymentMethod(paymentMethod) {
    const validMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO', 'WALLET'];
    return validMethods.includes(paymentMethod);
  }

  /**
   * Processa webhook do Mercado Pago
   * @param {Object} data - Dados do webhook
   * @returns {Promise<void>}
   */
  static async processMercadoPagoWebhook(data) {
    try {
      const { id, type } = data;

      if (type !== 'payment') {
        logger.info('Webhook ignorado - tipo não é payment', { type });
        return;
      }

      // Busca detalhes do pagamento
      const paymentClient = new Payment(mpConfig);
      const payment = await paymentClient.get({ id });

      const { status, external_reference: orderId, payer } = payment;

      logger.info('Webhook de pagamento recebido', { orderId, status, paymentId: id });

      // Busca o pedido
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order) {
        logger.warn('Pedido não encontrado para webhook', { orderId });
        return;
      }

      // Converte status do MP para nosso status
      const paymentStatus = this.convertMercadoPagoStatus(status);

      // Atualiza pagamento no banco
      await prisma.payment.update({
        where: { transactionId: id.toString() },
        data: {
          status: paymentStatus,
          paidAt: paymentStatus === 'APPROVED' ? new Date() : null
        }
      });

      // Atualiza status do pedido
      if (paymentStatus === 'APPROVED') {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'APPROVED',
            status: 'CONFIRMED'
          }
        });

        logger.info('Pagamento aprovado - Pedido confirmado', { orderId });
        // TODO: Enviar email de confirmação
      } else if (paymentStatus === 'DECLINED') {
        // TODO: Enviar email de pagamento recusado
        logger.warn('Pagamento recusado', { orderId });
      }
    } catch (error) {
      logger.error('Erro ao processar webhook de pagamento', error);
      throw error;
    }
  }

  /**
   * Converte status do Mercado Pago para nosso padrão
   */
  static convertMercadoPagoStatus(mpStatus) {
    const statusMap = {
      'approved': 'APPROVED',
      'pending': 'PROCESSING',
      'authorized': 'PROCESSING',
      'in_process': 'PROCESSING',
      'in_mediation': 'PROCESSING',
      'rejected': 'DECLINED',
      'cancelled': 'CANCELLED',
      'refunded': 'REFUNDED',
      'charged_back': 'REFUNDED'
    };

    return statusMap[mpStatus] || 'PROCESSING';
  }

  /**
   * Cria registro de pagamento
   * @param {Object} data - Dados do pagamento
   * @returns {Promise<Object>} - Pagamento criado
   */
  static async createPayment(data) {
    try {
      const {
        orderId,
        userId,
        method,
        amount,
        installments = 1,
        cardData = null
      } = data;

      // Valida método de pagamento
      if (!this.validatePaymentMethod(method)) {
        throw new ValidationError('Método de pagamento inválido');
      }

      // Cria registro de pagamento
      const payment = await prisma.payment.create({
        data: {
          orderId,
          userId,
          method,
          amount,
          status: 'PENDING',
          installments,
          installmentValue: installments > 1 ? amount / installments : null,
          cardLastFour: cardData?.lastFour || null,
          cardBrand: cardData?.brand || null
        }
      });

      logger.info('Pagamento criado', { orderId, method, amount });

      return payment;
    } catch (error) {
      logger.error('Erro ao criar pagamento', error);
      throw error;
    }
  }

  /**
   * Obtém histórico de pagamentos de um usuário
   */
  static async getUserPayments(userId, page = 1, limit = 10) {
    return prisma.payment.findMany({
      where: { userId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
  }

  /**
   * Obtém um pagamento específico
   */
  static async getPayment(paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true }
    });

    if (!payment) {
      throw new NotFoundError('Pagamento');
    }

    return payment;
  }

  /**
   * Reembolsa um pagamento
   */
  static async refundPayment(paymentId, amount = null, reason = '') {
    try {
      const payment = await this.getPayment(paymentId);

      const refundAmount = amount || payment.amount;

      if (refundAmount > payment.amount) {
        throw new ValidationError('Valor de reembolso não pode ser maior que o pagamento');
      }

      // Atualiza status do pagamento
      const isFullRefund = refundAmount === payment.amount;
      const newStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          metadata: JSON.stringify({
            refundAmount,
            refundReason: reason,
            refundedAt: new Date().toISOString()
          })
        }
      });

      // Atualiza pedido se reembolso total
      if (isFullRefund) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'REFUNDED' }
        });
      }

      logger.info('Pagamento reembolsado', { paymentId, amount: refundAmount });

      return payment;
    } catch (error) {
      logger.error('Erro ao reembolsar pagamento', error);
      throw error;
    }
  }

  /**
   * Cancela um pagamento
   */
  static async cancelPayment(paymentId, reason = '') {
    try {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'CANCELLED',
          metadata: JSON.stringify({
            cancelReason: reason,
            cancelledAt: new Date().toISOString()
          })
        }
      });

      logger.info('Pagamento cancelado', { paymentId });

      return { success: true };
    } catch (error) {
      logger.error('Erro ao cancelar pagamento', error);
      throw error;
    }
  }
}

export default PaymentService;
