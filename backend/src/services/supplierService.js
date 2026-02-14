import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';
import {
  AppError,
  NotFoundError,
  ConflictError,
  InsufficientStockError,
} from '../utils/errors.js';
import { SUPPLIER_ORDER_STATUS } from '../config/constants.js';

class SupplierService {
  /**
   * Criar/registrar fornecedor
   */
  async createSupplier(data) {
    try {
      // Validar CNPJ único
      const existingSupplier = await prisma.supplier.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (existingSupplier) {
        throw new ConflictError('Fornecedor com este CNPJ já existe');
      }

      const supplier = await prisma.supplier.create({
        data: {
          companyName: data.companyName,
          cnpj: data.cnpj,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          contactPerson: data.contactPerson,
          minimumOrder: data.minimumOrder || 0,
          leadTimeDays: data.leadTimeDays || 5,
          paymentTerms: data.paymentTerms || 'NET30',
          apiEndpoint: data.apiEndpoint,
          apiKey: data.apiKey, // Em produção, criptografar
          isActive: true,
        },
      });

      logger.info('Fornecedor criado', { supplierId: supplier.id });
      return supplier;
    } catch (error) {
      logger.error('Erro ao criar fornecedor', error);
      throw error;
    }
  }

  /**
   * Listar fornecedores
   */
  async listSuppliers(page = 1, limit = 20, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      if (filters.search) {
        where.OR = [
          { companyName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { cnpj: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive === true || filters.isActive === 'true';
      }

      const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
          where,
          select: {
            id: true,
            companyName: true,
            cnpj: true,
            email: true,
            phone: true,
            isActive: true,
            _count: { select: { products: true } },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.supplier.count({ where }),
      ]);

      return {
        data: suppliers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Erro ao listar fornecedores', error);
      throw new AppError('Erro ao listar fornecedores', 500);
    }
  }

  /**
   * Obter detalhes do fornecedor
   */
  async getSupplierDetails(supplierId) {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              externalSupplierId: true,
              supplierSku: true,
              minimumOrder: true,
            },
          },
          _count: { select: { orders: true } },
        },
      });

      if (!supplier) {
        throw new NotFoundError('Fornecedor não encontrado');
      }

      return supplier;
    } catch (error) {
      logger.error('Erro ao obter detalhes do fornecedor', error);
      throw error;
    }
  }

  /**
   * Enviar pedido para fornecedor (via API ou manualmente)
   */
  async sendOrderToSupplier(orderItemId, supplierId) {
    try {
      const orderItem = await prisma.orderItem.findUnique({
        where: { id: orderItemId },
        include: {
          order: true,
          product: true,
        },
      });

      if (!orderItem) {
        throw new NotFoundError('Item do pedido não encontrado');
      }

      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });

      if (!supplier) {
        throw new NotFoundError('Fornecedor não encontrado');
      }

      // Validar quantidade mínima
      if (orderItem.quantity < supplier.minimumOrder) {
        throw new InsufficientStockError(
          `Quantidade mínima de ${supplier.minimumOrder} não atendida`
        );
      }

      // Criar registro de sincronização
      const sync = await prisma.supplierOrderSync.create({
        data: {
          orderItemId: orderItemId,
          supplierId: supplierId,
          externalOrderId: null, // Será preenchido após envio
          status: SUPPLIER_ORDER_STATUS.PENDING_SEND,
          notes: 'Aguardando envio para fornecedor',
        },
      });

      // Se supplier tem API, enviar pedido
      if (supplier.apiEndpoint && supplier.apiKey) {
        try {
          await this.submitOrderToSupplierAPI(
            supplier,
            orderItem,
            sync.id
          );
        } catch (apiError) {
          logger.error('Erro ao enviar para API do fornecedor', apiError);
          // Log do erro mas continua - será enviado manualmente depois
        }
      } else {
        logger.info('Fornecedor sem API - envio manual necessário', {
          syncId: sync.id,
        });
      }

      return sync;
    } catch (error) {
      logger.error('Erro ao enviar pedido para fornecedor', error);
      throw error;
    }
  }

  /**
   * Submeter pedido à API do fornecedor
   */
  async submitOrderToSupplierAPI(supplier, orderItem, syncId) {
    try {
      // Exemplo de payload (adaptar para cada fornecedor)
      const payload = {
        externalOrderId: orderItem.order.orderNumber,
        quantity: orderItem.quantity,
        sku: orderItem.product.supplierSku,
        shippingAddress: orderItem.order.shippingAddress, // TODO: popular com addr do usuário
        estimatedDelivery: new Date(
          Date.now() + supplier.leadTimeDays * 24 * 60 * 60 * 1000
        ),
      };

      // Fetch API do fornecedor (substituir com implementation real)
      const response = await fetch(supplier.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supplier.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Supplier API responded with status ${response.status}`);
      }

      const responseData = await response.json();

      // Atualizar sync com ID externo
      await prisma.supplierOrderSync.update({
        where: { id: syncId },
        data: {
          externalOrderId: responseData.orderId || responseData.id,
          status: SUPPLIER_ORDER_STATUS.SENT,
          notes: 'Pedido enviado ao fornecedor com sucesso',
        },
      });

      logger.info('Pedido enviado para API do fornecedor', {
        syncId,
        externalOrderId: responseData.orderId,
      });

      return responseData;
    } catch (error) {
      logger.error('Erro na API do fornecedor', error);
      throw new AppError(`Erro na comunicação com fornecedor: ${error.message}`, 502);
    }
  }

  /**
   * Sincronizar status de pedidos do fornecedor
   */
  async syncSupplierOrderStatus(supplerId) {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplerId },
      });

      if (!supplier || !supplier.apiEndpoint) {
        throw new AppError('Fornecedor sem API configurada', 400);
      }

      // Buscar pedidos pendentes
      const pendingSyncs = await prisma.supplierOrderSync.findMany({
        where: {
          supplierId: supplier.id,
          status: { in: [SUPPLIER_ORDER_STATUS.SENT, SUPPLIER_ORDER_STATUS.PROCESSING] },
        },
        include: { orderItem: { include: { order: true } } },
      });

      let updatedCount = 0;

      for (const sync of pendingSyncs) {
        try {
          // Fetch status do fornecedor
          const statusResponse = await fetch(
            `${supplier.apiEndpoint}/orders/${sync.externalOrderId}`,
            {
              headers: {
                'Authorization': `Bearer ${supplier.apiKey}`,
              },
            }
          );

          if (!statusResponse.ok) continue;

          const statusData = await statusResponse.json();

          // Mapear status do fornecedor para nosso sistema
          const newStatus = this.mapSupplierStatus(statusData.status);

          // Atualizar sync
          await prisma.supplierOrderSync.update({
            where: { id: sync.id },
            data: {
              status: newStatus,
              notes: statusData.notes || '',
            },
          });

          // Se enviado/processo, atualizar OrderItem
          if (newStatus === SUPPLIER_ORDER_STATUS.SHIPPED) {
            await prisma.orderItem.update({
              where: { id: sync.orderItemId },
              data: {
                supplierStatus: 'SHIPPED',
                trackingNumber: statusData.trackingNumber,
              },
            });
          }

          updatedCount++;
        } catch (itemError) {
          logger.error(`Erro ao sincronizar item ${sync.id}`, itemError);
        }
      }

      logger.info('Status de fornecedor sincronizado', {
        supplierId: supplier.id,
        updatedCount,
      });

      return { updatedCount, totalChecked: pendingSyncs.length };
    } catch (error) {
      logger.error('Erro ao sincronizar status do fornecedor', error);
      throw error;
    }
  }

  /**
   * Mapear status do fornecedor para sistema interno
   */
  mapSupplierStatus(externalStatus) {
    const mapping = {
      'pending': SUPPLIER_ORDER_STATUS.PENDING_SEND,
      'processing': SUPPLIER_ORDER_STATUS.PROCESSING,
      'ready': SUPPLIER_ORDER_STATUS.READY_SHIP,
      'shipped': SUPPLIER_ORDER_STATUS.SHIPPED,
      'delivered': SUPPLIER_ORDER_STATUS.DELIVERED,
      'cancelled': SUPPLIER_ORDER_STATUS.CANCELLED,
      'failed': SUPPLIER_ORDER_STATUS.FAILED,
    };

    return mapping[externalStatus.toLowerCase()] || SUPPLIER_ORDER_STATUS.PROCESSING;
  }

  /**
   * Obter histórico de sincronização de um pedido
   */
  async getSyncHistory(orderItemId) {
    try {
      const syncs = await prisma.supplierOrderSync.findMany({
        where: { orderItemId },
        include: {
          supplier: { select: { id: true, companyName: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return syncs;
    } catch (error) {
      logger.error('Erro ao obter histórico de sincronização', error);
      throw new AppError('Erro ao obter histórico', 500);
    }
  }

  /**
   * Calcular custo de envio baseado em fornecedor e destino
   */
  async calculateShippingCost(supplierId, destinationZipCode, weight = 1) {
    try {
      // Implementação simplificada
      // Em produção, integrar com APIs de transportadoras (Sedex, PAC, Loggi, etc)

      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });

      if (!supplier) {
        throw new NotFoundError('Fornecedor não encontrado');
      }

      // Custo base por kg
      const costPerKg = 5.0;
      const baseCost = supplier.isActive ? weight * costPerKg : Infinity;

      // Adicionar frete conforme distância (simplificado)
      // Em produção, usar CEP origin (fornecedor) vs destination
      const shippingCost = baseCost + 10;

      return {
        cost: shippingCost,
        estimatedDays: supplier.leadTimeDays + 5, // Lead time + dias de transporte
        carrier: 'Padrão',
      };
    } catch (error) {
      logger.error('Erro ao calcular frete', error);
      throw error;
    }
  }

  /**
   * Gerar relatório de desempenho do fornecedor
   */
  async getSupplierPerformance(supplierId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const syncs = await prisma.supplierOrderSync.findMany({
        where: {
          supplierId,
          createdAt: { gte: startDate },
        },
        include: { orderItem: true },
      });

      const totalOrders = syncs.length;
      const successfulOrders = syncs.filter(
        (s) => s.status === SUPPLIER_ORDER_STATUS.DELIVERED
      ).length;
      const failedOrders = syncs.filter(
        (s) => s.status === SUPPLIER_ORDER_STATUS.FAILED
      ).length;
      const successRate =
        totalOrders > 0 ? ((successfulOrders / totalOrders) * 100).toFixed(2) : 0;

      const totalQuantity = syncs.reduce((sum, s) => sum + s.orderItem.quantity, 0);

      return {
        metric: 'SUPPLIER_PERFORMANCE',
        period: `${days} dias`,
        totalOrders,
        successfulOrders,
        failedOrders,
        successRate: `${successRate}%`,
        totalQuantitySold: totalQuantity,
        averageLeadTime: 'TODO',
      };
    } catch (error) {
      logger.error('Erro ao gerar relatório de desempenho', error);
      throw new AppError('Erro ao gerar relatório', 500);
    }
  }
}

export default new SupplierService();
