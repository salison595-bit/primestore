/**
 * Service de pedidos
 * Lógica de negócio para pedidos
 */

import prisma from '../config/database.js';
import { createLogger } from '../utils/logger.js';
import {
  NotFoundError,
  ValidationError,
  InsufficientStockError
} from '../utils/errors.js';
import { ORDER_STATUS } from '../config/constants.js';

const logger = createLogger('OrderService');

export class OrderService {
  /**
   * Cria um novo pedido
   * @param {Object} data - Dados do pedido
   * @returns {Promise<Object>} - Pedido criado
   */
  static async createOrder(data) {
    try {
      const {
        userId,
        items,
        subtotal,
        discountAmount = 0,
        couponId = null,
        shippingCost = 0,
        taxAmount = 0,
        shippingAddressId,
        billingAddressId,
        notes = '',
        adminNotes = ''
      } = data;

      // Valida itens
      if (!items || items.length === 0) {
        throw new ValidationError('Pedido deve ter pelo menos um item');
      }

      // Verifica estoque
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          throw new NotFoundError('Produto');
        }

        if (product.stock < item.quantity && !product.isDropshipping) {
          throw new InsufficientStockError(
            product.name,
            product.stock,
            item.quantity
          );
        }
      }

      // Calcula total
      const total = subtotal - discountAmount + shippingCost + taxAmount;

      // Gera número de pedido único
      const orderNumber = `PRIME-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      // Cria pedido
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          discountAmount,
          couponId,
          shippingCost,
          taxAmount,
          total,
          status: ORDER_STATUS.PENDING,
          paymentStatus: 'PENDING',
          shippingAddressId,
          billingAddressId,
          notes,
          adminNotes,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtOrder: item.price,
              subtotal: item.price * item.quantity
            }))
          }
        },
        include: {
          items: {
            include: { product: true }
          },
          coupon: true
        }
      });

      // Reduz estoque para produtos não dropshipping
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product.isDropshipping) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      // Usa cupom se fornecido
      if (couponId) {
        await prisma.coupon.update({
          where: { id: couponId },
          data: {
            usageCount: {
              increment: 1
            }
          }
        });
      }

      logger.info('Pedido criado', { orderId: order.id, orderNumber, userId });

      return order;
    } catch (error) {
      logger.error('Erro ao criar pedido', error);
      throw error;
    }
  }

  /**
   * Obtém um pedido
   */
  static async getOrder(orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        coupon: true,
        payments: true
      }
    });

    if (!order) {
      throw new NotFoundError('Pedido');
    }

    return order;
  }

  /**
   * Lista pedidos do usuário
   */
  static async getUserOrders(userId, page = 1, limit = 10) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        coupon: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });
  }

  /**
   * Atualiza status do pedido
   */
  static async updateOrderStatus(orderId, newStatus) {
    if (!Object.values(ORDER_STATUS).includes(newStatus)) {
      throw new ValidationError('Status de pedido inválido');
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: {
          create: {
            status: newStatus,
            notes: `Status atualizado para ${newStatus}`
          }
        }
      },
      include: {
        items: { include: { product: true } },
        user: true
      }
    });

    logger.info('Status do pedido atualizado', { orderId, newStatus });

    // TODO: Enviar notificação ao usuário sobre mudança de status

    return order;
  }

  /**
   * Cancela um pedido
   */
  static async cancelOrder(orderId, reason = '') {
    const order = await this.getOrder(orderId);

    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new ValidationError('Pedido já estava cancelado');
    }

    if (order.paymentStatus === 'APPROVED' && !order.payments.some(p => p.status === 'REFUNDED')) {
      throw new ValidationError('Reembolse o pagamento antes de cancelar o pedido');
    }

    // Retorna estoque
    for (const item of order.items) {
      if (!item.product.isDropshipping) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    }

    // Cancela pedido
    const updatedOrder = await this.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);

    if (order.couponId) {
      await prisma.coupon.update({
        where: { id: order.couponId },
        data: {
          usageCount: {
            decrement: 1
          }
        }
      });
    }

    logger.info('Pedido cancelado', { orderId, reason });

    return updatedOrder;
  }

  /**
   * Retorna estoque do pedido
   */
  static async returnOrder(orderId) {
    const order = await this.getOrder(orderId);

    // Retorna estoque
    for (const item of order.items) {
      if (!item.product.isDropshipping) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }
    }

    const updatedOrder = await this.updateOrderStatus(orderId, ORDER_STATUS.RETURNED);

    logger.info('Pedido retornado', { orderId });

    return updatedOrder;
  }
}

export default OrderService;
