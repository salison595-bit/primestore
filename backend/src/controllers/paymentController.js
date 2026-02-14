/**
 * Controller de pagamentos
 * Endpoints para processar pagamentos
 */

import PaymentService from '../services/paymentService.js';
import OrderService from '../services/orderService.js';
import { FormatterUtil } from '../utils/formatters.js';
import { ValidationError } from '../utils/errors.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('PaymentController');

export class PaymentController {
  /**
   * POST /api/payments/create-preference
   * Cria preferência de pagamento no Mercado Pago
   */
  static async createMercadoPagoPreference(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId } = req.body;

      // Busca pedido
      const order = await OrderService.getOrder(orderId);

      if (order.userId !== userId) {
        throw new ValidationError('Acesso negado a este pedido');
      }

      // Cria preferência
      const preference = await PaymentService.createMercadoPagoPreference({
        orderId,
        items: order.items,
        total: order.total,
        email: req.user.email,
        customerName: req.user.name
      });

      res.json(
        FormatterUtil.successResponse(preference, 'Preferência de pagamento criada')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/process
   * Processa um pagamento
   */
  static async processPayment(req, res, next) {
    try {
      const userId = req.user.id;
      const { orderId, method, installments = 1, cardData = null } = req.body;

      // Valida método
      if (!PaymentService.validatePaymentMethod(method)) {
        throw new ValidationError('Método de pagamento inválido');
      }

      // Busca pedido
      const order = await OrderService.getOrder(orderId);

      if (order.userId !== userId) {
        throw new ValidationError('Acesso negado a este pedido');
      }

      // Cria pagamento
      const payment = await PaymentService.createPayment({
        orderId,
        userId,
        method,
        amount: order.total,
        installments,
        cardData
      });

      res.status(201).json(
        FormatterUtil.successResponse(payment, 'Pagamento processado')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/:paymentId
   * Obtém detalhes de um pagamento
   */
  static async getPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const userId = req.user.id;

      const payment = await PaymentService.getPayment(paymentId);

      // Verifica se usuário é o proprietário
      if (payment.userId !== userId) {
        throw new ValidationError('Acesso negado a este pagamento');
      }

      res.json(
        FormatterUtil.successResponse(payment, 'Pagamento obtido')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments
   * Lista pagamentos do usuário
   */
  static async getUserPayments(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const payments = await PaymentService.getUserPayments(userId, parseInt(page), parseInt(limit));

      res.json(
        FormatterUtil.successResponse(payments, 'Pagamentos obtidos')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/:paymentId/refund
   * Reembolsa um pagamento (admin)
   */
  static async refundPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      await PaymentService.refundPayment(paymentId, amount, reason);

      res.json(
        FormatterUtil.successResponse(null, 'Pagamento reembolsado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/:paymentId/cancel
   * Cancela um pagamento
   */
  static async cancelPayment(req, res, next) {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      await PaymentService.cancelPayment(paymentId, reason);

      res.json(
        FormatterUtil.successResponse(null, 'Pagamento cancelado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }
}

export default PaymentController;
