import express from 'express';
import supplierController from '../controllers/supplierController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.js';
import { validate } from '../middlewares/validation.js';
import { z } from 'zod';

const router = express.Router();

// Validação schemas
const createSupplierSchema = z.object({
  companyName: z.string().min(3).max(255),
  cnpj: z.string().min(14).max(14),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string().max(2),
  zipCode: z.string(),
  contactPerson: z.string().optional(),
  minimumOrder: z.number().int().min(1).optional(),
  leadTimeDays: z.number().int().min(1).optional(),
  paymentTerms: z.string().optional(),
  apiEndpoint: z.string().url().optional(),
  apiKey: z.string().optional(),
});

// ADMIN ONLY - Criar fornecedor
/**
 * POST /api/suppliers
 * Criar novo fornecedor (ADMIN only)
 */
router.post(
  '/',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  validate({ body: createSupplierSchema }),
  supplierController.createSupplier
);

// ADMIN ONLY - Listar fornecedores
/**
 * GET /api/suppliers
 * Listar todos os fornecedores com filtros
 * Query: ?page=1&limit=20&search=termo&isActive=true
 */
router.get(
  '/',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  supplierController.listSuppliers
);

// ADMIN ONLY - Obter detalhes
/**
 * GET /api/suppliers/:id
 * Obter detalhes completos do fornecedor
 */
router.get(
  '/:id',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  supplierController.getSupplierDetails
);

// ADMIN ONLY - Enviar pedido
/**
 * POST /api/suppliers/:supplierId/orders/:orderItemId
 * Enviar pedido específico ao fornecedor
 */
router.post(
  '/:supplierId/orders/:orderItemId',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  supplierController.sendOrderToSupplier
);

// ADMIN ONLY - Sincronizar pedidos
/**
 * POST /api/suppliers/:id/sync
 * Sincronizar status de todos os pedidos pendentes
 */
router.post(
  '/:id/sync',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  supplierController.syncSupplierOrders
);

// ADMIN - Histórico de sincronização
/**
 * GET /api/suppliers/orders/:orderItemId/history
 * Obter histórico de sincronização de um item
 */
router.get(
  '/orders/:orderItemId/history',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  supplierController.getSyncHistory
);

// ADMIN - Calcular frete
/**
 * GET /api/suppliers/:id/shipping-cost
 * Calcular custo de envio: ?destinationZipCode=xxxxx&weight=1.5
 */
router.get(
  '/:id/shipping-cost',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  supplierController.calculateShippingCost
);

// ADMIN - Desempenho
/**
 * GET /api/suppliers/:id/performance
 * Obter relatório de desempenho: ?days=30
 */
router.get(
  '/:id/performance',
  authMiddleware,
  authorizeRoles(['ADMIN', 'SUPERADMIN']),
  supplierController.getSupplierPerformance
);

export default router;
