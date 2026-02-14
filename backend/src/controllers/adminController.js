import adminService from '../services/adminService.js';
import { logger } from '../utils/logger.js';
import formatters from '../utils/formatters.js';

class AdminController {
  /**
   * GET /api/admin/dashboard
   * Obter dashboard com KPIs
   */
  async getDashboard(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const dashboard = await adminService.getDashboard(parseInt(days));

      res.json(
        formatters.successResponse(dashboard, 'Dashboard gerado com sucesso')
      );
    } catch (error) {
      logger.error('Erro no controller de dashboard', error);
      next(error);
    }
  }

  /**
   * GET /api/admin/products
   * Listar produtos
   */
  async listProducts(req, res, next) {
    try {
      const { page = 1, limit = 20, search, categoryId, isActive } = req.query;

      const filters = {};
      if (search) filters.search = search;
      if (categoryId) filters.categoryId = categoryId;
      if (isActive !== undefined) filters.isActive = isActive;

      const result = await adminService.listProducts(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json(
        formatters.successResponse(result.data, 'Produtos listados com sucesso', {
          'X-Page': result.pagination.page,
          'X-Limit': result.pagination.limit,
          'X-Total': result.pagination.total,
          'X-Pages': result.pagination.pages,
        })
      );
    } catch (error) {
      logger.error('Erro ao listar produtos', error);
      next(error);
    }
  }

  /**
   * PUT /api/admin/products/:id
   * Atualizar produto
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await adminService.updateProduct(id, req.body);

      res.json(
        formatters.successResponse(product, 'Produto atualizado com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao atualizar produto', error);
      next(error);
    }
  }

  /**
   * DELETE /api/admin/products/:id
   * Deletar produto
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.deleteProduct(id);

      res.json(formatters.successResponse(result, result.message));
    } catch (error) {
      logger.error('Erro ao deletar produto', error);
      next(error);
    }
  }

  /**
   * GET /api/admin/orders
   * Listar pedidos
   */
  async listOrders(req, res, next) {
    try {
      const { page = 1, limit = 20, status, paymentStatus, userId } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (paymentStatus) filters.paymentStatus = paymentStatus;
      if (userId) filters.userId = userId;

      const result = await adminService.listOrders(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json(
        formatters.successResponse(result.data, 'Pedidos listados com sucesso', {
          'X-Page': result.pagination.page,
          'X-Limit': result.pagination.limit,
          'X-Total': result.pagination.total,
          'X-Pages': result.pagination.pages,
        })
      );
    } catch (error) {
      logger.error('Erro ao listar pedidos', error);
      next(error);
    }
  }

  /**
   * PATCH /api/admin/orders/:id/status
   * Atualizar status do pedido
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const order = await adminService.updateOrderStatus(id, status);

      res.json(
        formatters.successResponse(
          formatters.formatOrder(order),
          'Status do pedido atualizado'
        )
      );
    } catch (error) {
      logger.error('Erro ao atualizar status do pedido', error);
      next(error);
    }
  }

  /**
   * GET /api/admin/users
   * Listar usuários
   */
  async listUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search, role } = req.query;

      const filters = {};
      if (search) filters.search = search;
      if (role) filters.role = role;

      const result = await adminService.listUsers(
        parseInt(page),
        parseInt(limit),
        filters
      );

      res.json(
        formatters.successResponse(result.data, 'Usuários listados com sucesso', {
          'X-Page': result.pagination.page,
          'X-Limit': result.pagination.limit,
          'X-Total': result.pagination.total,
          'X-Pages': result.pagination.pages,
        })
      );
    } catch (error) {
      logger.error('Erro ao listar usuários', error);
      next(error);
    }
  }

  /**
   * GET /api/admin/coupons
   * Listar cupons
   */
  async listCoupons(req, res, next) {
    try {
      const coupons = await adminService.manageCoupons('list');

      res.json(
        formatters.successResponse(coupons, 'Cupons listados com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao listar cupons', error);
      next(error);
    }
  }

  /**
   * POST /api/admin/coupons
   * Criar cupom
   */
  async createCoupon(req, res, next) {
    try {
      const coupon = await adminService.manageCoupons('create', null, req.body);

      res.status(201).json(
        formatters.successResponse(coupon, 'Cupom criado com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao criar cupom', error);
      next(error);
    }
  }

  /**
   * PUT /api/admin/coupons/:id
   * Atualizar cupom
   */
  async updateCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const coupon = await adminService.manageCoupons('update', id, req.body);

      res.json(
        formatters.successResponse(coupon, 'Cupom atualizado com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao atualizar cupom', error);
      next(error);
    }
  }

  /**
   * DELETE /api/admin/coupons/:id
   * Deletar cupom
   */
  async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adminService.manageCoupons('delete', id);

      res.json(formatters.successResponse(result, result.message));
    } catch (error) {
      logger.error('Erro ao deletar cupom', error);
      next(error);
    }
  }

  /**
   * GET /api/admin/settings
   * Obter configurações da loja
   */
  async getSettings(req, res, next) {
    try {
      const settings = await adminService.getStoreSettings();

      res.json(
        formatters.successResponse(settings, 'Configurações obtidas com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao obter configurações', error);
      next(error);
    }
  }

  /**
   * PUT /api/admin/settings
   * Atualizar configurações da loja
   */
  async updateSettings(req, res, next) {
    try {
      const settings = await adminService.updateStoreSettings(req.body);

      res.json(
        formatters.successResponse(settings, 'Configurações atualizadas com sucesso')
      );
    } catch (error) {
      logger.error('Erro ao atualizar configurações', error);
      next(error);
    }
  }
}

export default new AdminController();
