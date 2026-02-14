import supplierService from '../services/supplierService.js';
import { logger } from '../utils/logger.js';
import formatters from '../utils/formatters.js';

class SupplierController {
  /**
   * POST /api/suppliers
   * Criar novo fornecedor
   */
  async createSupplier(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier(req.body);

      res.status(201).json(
        formatters.successResponse(supplier, 'Fornecedor criado com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao criar fornecedor', error);
      next(error);
    }
  }

  /**
   * GET /api/suppliers
   * Listar fornecedores
   */
  async listSuppliers(req, res, next) {
    try {
      const { page = 1, limit = 20, search, isActive } = req.query;

      const filters = {};
      if (search) filters.search = search;
      if (isActive !== undefined) filters.isActive = isActive;

      const result = await supplierService.listSuppliers(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json(
        formatters.successResponse(result.data, 'Fornecedores listados com sucesso', {
          'X-Page': result.pagination.page,
          'X-Limit': result.pagination.limit,
          'X-Total': result.pagination.total,
          'X-Pages': result.pagination.pages,
        })
      );
    } catch (error) {
      logger.error('Erro ao listar fornecedores', error);
      next(error);
    }
  }

  /**
   * GET /api/suppliers/:id
   * Obter detalhes do fornecedor
   */
  async getSupplierDetails(req, res, next) {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getSupplierDetails(id);

      res.json(
        formatters.successResponse(supplier, 'Fornecedor obtido com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao obter fornecedor', error);
      next(error);
    }
  }

  /**
   * POST /api/suppliers/:supplierId/orders/:orderItemId
   * Enviar pedido para fornecedor
   */
  async sendOrderToSupplier(req, res, next) {
    try {
      const { supplierId, orderItemId } = req.params;

      const sync = await supplierService.sendOrderToSupplier(
        orderItemId,
        supplierId
      );

      res.status(201).json(
        formatters.successResponse(sync, 'Pedido enviado ao fornecedor')
      );
    } catch (error) {
      logger.error('Erro ao enviar pedido', error);
      next(error);
    }
  }

  /**
   * POST /api/suppliers/:id/sync
   * Sincronizar status de pedidos
   */
  async syncSupplierOrders(req, res, next) {
    try {
      const { id } = req.params;
      const result = await supplierService.syncSupplierOrderStatus(id);

      res.json(
        formatters.successResponse(result, 'Status sincronizado com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao sincronizar pedidos', error);
      next(error);
    }
  }

  /**
   * GET /api/suppliers/orders/:orderItemId/history
   * Obter histórico de sincronização
   */
  async getSyncHistory(req, res, next) {
    try {
      const { orderItemId } = req.params;
      const history = await supplierService.getSyncHistory(orderItemId);

      res.json(
        formatters.successResponse(history, 'Histórico obtido com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao obter histórico', error);
      next(error);
    }
  }

  /**
   * GET /api/suppliers/:id/shipping-cost
   * Calcular custo de envio
   */
  async calculateShippingCost(req, res, next) {
    try {
      const { id } = req.params;
      const { destinationZipCode, weight = 1 } = req.query;

      const cost = await supplierService.calculateShippingCost(
        id,
        destinationZipCode,
        parseFloat(weight)
      );

      res.json(
        formatters.successResponse(cost, 'Frete calculado com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao calcular frete', error);
      next(error);
    }
  }

  /**
   * GET /api/suppliers/:id/performance
   * Obter relatório de desempenho
   */
  async getSupplierPerformance(req, res, next) {
    try {
      const { id } = req.params;
      const { days = 30 } = req.query;

      const performance = await supplierService.getSupplierPerformance(
        id,
        parseInt(days)
      );

      res.json(
        formatters.successResponse(performance, 'Desempenho obtido com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao obter desempenho', error);
      next(error);
    }
  }
}

export default new SupplierController();
