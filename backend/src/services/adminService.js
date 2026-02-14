import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import { AppError, NotFoundError, AuthorizationError } from '../utils/errors.js';
import { ORDER_STATUS, PAYMENT_STATUS, USER_ROLES } from '../config/constants.js';

class AdminService {
  /**
   * Obter dashboard com KPIs principais
   * @param {number} days - Dias para calcular métricas (padrão: 30)
   */
  async getDashboard(days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Total de receita
      const totalRevenue = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PAYMENT_STATUS.APPROVED,
          createdAt: { gte: startDate },
        },
      });

      // Total de pedidos
      const totalOrders = await prisma.order.count({
        where: {
          createdAt: { gte: startDate },
        },
      });

      // Pedidos pendentes
      const pendingOrders = await prisma.order.count({
        where: {
          orderStatus: { not: ORDER_STATUS.DELIVERED },
        },
      });

      // Total de usuários
      const totalUsers = await prisma.user.count({});

      // Usuários novos no período
      const newUsers = await prisma.user.count({
        where: {
          createdAt: { gte: startDate },
        },
      });

      // Produtos ao estoque
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: { lte: 10 },
          supplier: null, // Apenas produtos próprios tem estoque
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
          price: true,
        },
        take: 5,
      });

      // Pedidos pendentes
      const pendingOrdersList = await prisma.order.findMany({
        where: {
          orderStatus: { in: [ORDER_STATUS.PENDING, ORDER_STATUS.PROCESSING] },
        },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
          payment: { select: { status: true, amount: true } },
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      });

      // Produtos mais vendidos
      const topProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: true,
        where: {
          order: {
            createdAt: { gte: startDate },
          },
        },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      });

      // Fetch product details for top products
      const topProductIds = topProducts.map((tp) => tp.productId);
      const topProductDetails = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, price: true },
      });

      const topProductsWithDetails = topProducts.map((tp) => {
        const product = topProductDetails.find((p) => p.id === tp.productId);
        return {
          ...product,
          totalSold: tp._sum.quantity || 0,
          orders: tp._count,
        };
      });

      logger.info('Dashboard KPIs gerados', { days });

      return {
        metrics: {
          totalRevenue: totalRevenue._sum.amount || 0,
          totalOrders,
          pendingOrders,
          totalUsers,
          newUsers,
          period: `${days} dias`,
        },
        alerts: {
          lowStockProducts,
          pendingOrders: pendingOrdersList,
        },
        topProducts: topProductsWithDetails,
      };
    } catch (error) {
      logger.error('Erro ao gerar dashboard', error);
      throw new AppError('Erro ao gerar dashboard', 500);
    }
  }

  /**
   * Listar todos os produtos com paginação
   */
  async listProducts(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { sku: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.categoryId) {
        where.categoryId = filters.categoryId;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive === true || filters.isActive === 'true';
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: { select: { id: true, name: true } },
            images: { select: { id: true, url: true, isPrimary: true } },
            _count: { select: { reviews: true } },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ]);

      return {
        data: products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Erro ao listar produtos', error);
      throw new AppError('Erro ao listar produtos', 500);
    }
  }

  /**
   * Atualizar produto
   */
  async updateProduct(productId, data) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundError('Produto não encontrado');
      }

      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          name: data.name || product.name,
          description: data.description || product.description,
          price: data.price !== undefined ? data.price : product.price,
          originalPrice:
            data.originalPrice !== undefined
              ? data.originalPrice
              : product.originalPrice,
          stock: data.stock !== undefined ? data.stock : product.stock,
          sku: data.sku || product.sku,
          isActive:
            data.isActive !== undefined ? data.isActive : product.isActive,
          featured:
            data.featured !== undefined ? data.featured : product.featured,
          categoryId: data.categoryId || product.categoryId,
        },
        include: {
          category: { select: { id: true, name: true } },
          images: true,
        },
      });

      logger.info('Produto atualizado', { productId });
      return updated;
    } catch (error) {
      logger.error('Erro ao atualizar produto', error);
      throw error;
    }
  }

  /**
   * Deletar produto
   */
  async deleteProduct(productId) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { _count: { select: { items: true } } },
      });

      if (!product) {
        throw new NotFoundError('Produto não encontrado');
      }

      if (product._count.items > 0) {
        throw new AppError('Não é possível deletar produto com pedidos', 400);
      }

      await prisma.product.delete({
        where: { id: productId },
      });

      logger.info('Produto deletado', { productId });
      return { message: 'Produto deletado com sucesso' };
    } catch (error) {
      logger.error('Erro ao deletar produto', error);
      throw error;
    }
  }

  /**
   * Listar pedidos com filtros
   */
  async listOrders(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.status) {
        where.orderStatus = filters.status;
      }

      if (filters.paymentStatus) {
        where.paymentStatus = filters.paymentStatus;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true } },
            items: { include: { product: { select: { name: true, sku: true } } } },
            payment: { select: { status: true, amount: true, method: true } },
            coupon: { select: { code: true, discountPercentage: true, discountValue: true } },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.count({ where }),
      ]);

      return {
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Erro ao listar pedidos', error);
      throw new AppError('Erro ao listar pedidos', 500);
    }
  }

  /**
   * Atualizar status do pedido
   */
  async updateOrderStatus(orderId, newStatus) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundError('Pedido não encontrado');
      }

      // Validar transição de status
      const validTransitions = {
        [ORDER_STATUS.PENDING]: [
          ORDER_STATUS.PROCESSING,
          ORDER_STATUS.CANCELLED,
        ],
        [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.RETURNED],
        [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
        [ORDER_STATUS.CANCELLED]: [],
        [ORDER_STATUS.RETURNED]: [],
      };

      if (!validTransitions[order.orderStatus]?.includes(newStatus)) {
        throw new AppError(
          `Transição inválida de ${order.orderStatus} para ${newStatus}`,
          400
        );
      }

      const updated = await prisma.order.update({
        where: { id: orderId },
        data: {
          orderStatus: newStatus,
          statusHistory: {
            create: {
              status: newStatus,
              notes: `Status atualizado por admin`,
            },
          },
        },
        include: {
          user: { select: { email: true, name: true } },
          items: true,
        },
      });

      // TODO: Enviar notificação por email ao usuário
      logger.info('Status do pedido atualizado', { orderId, newStatus });

      return updated;
    } catch (error) {
      logger.error('Erro ao atualizar status do pedido', error);
      throw error;
    }
  }

  /**
   * Listar usuários
   */
  async listUsers(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.role) {
        where.role = filters.role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            emailVerified: true,
            createdAt: true,
            _count: { select: { orders: true } },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Erro ao listar usuários', error);
      throw new AppError('Erro ao listar usuários', 500);
    }
  }

  /**
   * Gerenciar coupons
   */
  async manageCoupons(action, couponId = null, data = {}) {
    try {
      if (action === 'list') {
        const coupons = await prisma.coupon.findMany({
          include: { _count: { select: { usages: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return coupons;
      }

      if (action === 'create') {
        const coupon = await prisma.coupon.create({
          data: {
            code: data.code.toUpperCase(),
            description: data.description,
            discountType: data.discountType,
            discountPercentage: data.discountPercentage || null,
            discountValue: data.discountValue || null,
            maxUses: data.maxUses || null,
            validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
            validUntil: new Date(data.validUntil),
            isActive: true,
          },
        });
        logger.info('Cupom criado', { code: coupon.code });
        return coupon;
      }

      if (action === 'update') {
        const coupon = await prisma.coupon.update({
          where: { id: couponId },
          data: {
            isActive: data.isActive !== undefined ? data.isActive : undefined,
            maxUses: data.maxUses !== undefined ? data.maxUses : undefined,
            validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
          },
        });
        logger.info('Cupom atualizado', { couponId });
        return coupon;
      }

      if (action === 'delete') {
        await prisma.coupon.delete({
          where: { id: couponId },
        });
        logger.info('Cupom deletado', { couponId });
        return { message: 'Cupom deletado com sucesso' };
      }

      throw new AppError('Ação de cupom inválida', 400);
    } catch (error) {
      logger.error('Erro ao gerenciar cupom', error);
      throw error;
    }
  }

  /**
   * Obter configurações da loja
   */
  async getStoreSettings() {
    try {
      let settings = await prisma.storeSetting.findFirst();

      if (!settings) {
        settings = await prisma.storeSetting.create({
          data: {
            storeName: 'Prime Store',
            storeDescription: 'E-commerce Premium com Dropshipping',
            supportEmail: 'support@primestore.com',
            supportPhone: '+55 11 99999-9999',
            taxRate: 0.1,
            shippingBaseCost: 10,
          },
        });
      }

      return settings;
    } catch (error) {
      logger.error('Erro ao obter configurações', error);
      throw new AppError('Erro ao obter configurações', 500);
    }
  }

  /**
   * Atualizar configurações da loja
   */
  async updateStoreSettings(data) {
    try {
      let settings = await prisma.storeSetting.findFirst();

      if (!settings) {
        settings = await prisma.storeSetting.create({
          data,
        });
      } else {
        settings = await prisma.storeSetting.update({
          where: { id: settings.id },
          data,
        });
      }

      logger.info('Configurações da loja atualizadas');
      return settings;
    } catch (error) {
      logger.error('Erro ao atualizar configurações', error);
      throw new AppError('Erro ao atualizar configurações', 500);
    }
  }
}

export default new AdminService();
