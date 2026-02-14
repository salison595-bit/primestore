import express from 'express';
import adminController from '../controllers/adminController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { z } from 'zod';

const router = express.Router();

// Proteção: Todos as rotas admin requerem autenticação e role ADMIN
router.use(authMiddleware);
router.use(authorizeRoles(['ADMIN', 'SUPERADMIN']));

const updateProductSchema = z.object({
  name: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  isActive: z.boolean().optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ]),
});

const couponSchema = z.object({
  code: z.string().min(3).max(50),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime(),
});

const settingsSchema = z.object({
  storeName: z.string().optional(),
  storeDescription: z.string().optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().optional(),
  taxRate: z.number().min(0).max(1).optional(),
  shippingBaseCost: z.number().nonnegative().optional(),
});

// DASHBOARD
/**
 * GET /api/admin/dashboard
 * Obter KPIs do dashboard
 * Query: ?days=30
 */
router.get('/dashboard', adminController.getDashboard);

// PRODUTOS
/**
 * GET /api/admin/products
 * Listar produtos com filtros
 * Query: ?page=1&limit=20&search=termo&categoryId=id&isActive=true
 */
router.get('/products', adminController.listProducts);

/**
 * PUT /api/admin/products/:id
 * Atualizar produto
 */
router.put(
  '/products/:id',
  validate({ body: updateProductSchema }),
  adminController.updateProduct
);

/**
 * DELETE /api/admin/products/:id
 * Deletar produto
 */
router.delete('/products/:id', adminController.deleteProduct);

// PEDIDOS
/**
 * GET /api/admin/orders
 * Listar pedidos
 * Query: ?page=1&limit=20&status=PENDING&paymentStatus=APPROVED&userId=id
 */
router.get('/orders', adminController.listOrders);

/**
 * PATCH /api/admin/orders/:id/status
 * Atualizar status do pedido
 */
router.patch(
  '/orders/:id/status',
  validate({ body: updateOrderStatusSchema }),
  adminController.updateOrderStatus
);

// USUÁRIOS
/**
 * GET /api/admin/users
 * Listar usuários
 * Query: ?page=1&limit=20&search=termo&role=CUSTOMER
 */
router.get('/users', adminController.listUsers);

// CUPONS
/**
 * GET /api/admin/coupons
 * Listar todos os cupons
 */
router.get('/coupons', adminController.listCoupons);

/**
 * POST /api/admin/coupons
 * Criar novo cupom
 */
router.post(
  '/coupons',
  validate({ body: couponSchema }),
  adminController.createCoupon
);

/**
 * PUT /api/admin/coupons/:id
 * Atualizar cupom
 */
router.put(
  '/coupons/:id',
  validate({ body: couponSchema.partial() }),
  adminController.updateCoupon
);

/**
 * DELETE /api/admin/coupons/:id
 * Deletar cupom
 */
router.delete('/coupons/:id', adminController.deleteCoupon);

// CONFIGURAÇÕES DA LOJA
/**
 * GET /api/admin/settings
 * Obter configurações da loja
 */
router.get('/settings', adminController.getSettings);

/**
 * PUT /api/admin/settings
 * Atualizar configurações da loja
 */
router.put(
  '/settings',
  validate({ body: settingsSchema }),
  adminController.updateSettings
);

export default router;
