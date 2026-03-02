import OrderService from '../services/orderService.js';
import { syncTrackingHistory } from '../services/shippingService.js';
import { FormatterUtil } from '../utils/formatters.js';
import { createLogger } from '../utils/logger.js';
import prisma from '../config/database.js';

const logger = createLogger('OrderController');

class OrderController {
  static async syncOrderTracking(req, res, next) {
    try {
      const { id } = req.params;
      const updatedOrder = await syncTrackingHistory(String(id));
      const data = FormatterUtil.formatOrder(updatedOrder);
      return res.json(FormatterUtil.successResponse(data, 'Rastreamento do pedido sincronizado'));
    } catch (error) {
      logger.error('Erro ao sincronizar rastreamento do pedido', error);
      next(error);
    }
  }

  static async getUserOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formattedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt,
        itemCount: order.items.length,
        firstItemImage: order.items[0]?.product?.imageUrl || null
      }));

      return res.json(FormatterUtil.successResponse(formattedOrders));
    } catch (error) {
      logger.error('Erro ao buscar pedidos do usuário', error);
      next(error);
    }
  }

  static async getOrderPublic(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrder(String(id));

      const summary = {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status || order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod || null,
        estimatedDelivery: order.estimatedDelivery,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount || 0,
        shippingCost: order.shippingCost || 0,
        taxAmount: order.taxAmount || 0,
        total: order.total,
        createdAt: order.createdAt,
        trackingNumber: order.trackingNumber || null,
        shippingCarrier: order.shippingCarrier || null,
        coupon: order.coupon ? { code: order.coupon.code, type: order.coupon.type, value: order.coupon.value } : null,
        items: (order.items || []).map((it) => ({
          id: it.id,
          productId: it.productId,
          name: it.product?.name || it.name,
          quantity: it.quantity,
          price: it.priceAtOrder || it.price,
          subtotal: (it.priceAtOrder || it.price) * it.quantity
        }))
      };

      const lastPayment = await prisma.payment.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: 'desc' }
      });
      if (lastPayment) {
        summary.payment = {
          id: lastPayment.id,
          method: lastPayment.method,
          status: lastPayment.status,
          amount: lastPayment.amount,
          transactionId: lastPayment.transactionId || null,
          receiptUrl: lastPayment.receiptUrl || null,
          cardBrand: lastPayment.cardBrand || null,
          cardLastFour: lastPayment.cardLastFour || null,
          installments: lastPayment.installments || 1,
          installmentValue: lastPayment.installmentValue || null,
          pixQrCode: lastPayment.pixQrCode || null,
          pixKey: lastPayment.pixKey || null,
          boletoUrl: lastPayment.boletoUrl || null,
          boletoCode: lastPayment.boletoCode || null,
        };
      }

      if (order.shippingAddressId) {
        const addr = await prisma.address.findUnique({ where: { id: order.shippingAddressId } });
        if (addr) {
          summary.shippingAddress = {
            street: addr.street,
            number: addr.number,
            complement: addr.complement,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country
          };
        }
      }

      if (order.billingAddressId) {
        const addr = await prisma.address.findUnique({ where: { id: order.billingAddressId } });
        if (addr) {
          summary.billingAddress = {
            street: addr.street,
            number: addr.number,
            complement: addr.complement,
            neighborhood: addr.neighborhood,
            city: addr.city,
            state: addr.state,
            zipCode: addr.zipCode,
            country: addr.country
          };
        }
      }

      try {
        const history = await prisma.orderStatusHistory.findMany({
          where: { orderId: order.id },
          orderBy: { createdAt: 'asc' },
          select: { status: true, notes: true, changedBy: true, createdAt: true, description: true, location: true }
        });
        summary.statusHistory = history || [];
      } catch {}

      const data = FormatterUtil.formatOrder(summary);
      return res.json(FormatterUtil.successResponse(data, 'Resumo do pedido'));
    } catch (error) {
      logger.error('Erro ao obter resumo público do pedido', error);
      next(error);
    }
  }
}

export default OrderController;
