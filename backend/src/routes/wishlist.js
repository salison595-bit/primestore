/**
 * Rotas da Wishlist (Lista de Desejos)
 * Requer autenticação
 */

import express from 'express';
import prisma from '../config/database.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/wishlist - Lista itens da wishlist do usuário
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: { select: { name: true, slug: true } },
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    const data = items.map((w) => ({
      id: w.id,
      productId: w.productId,
      product: {
        id: w.product.id,
        name: w.product.name,
        price: w.product.finalPrice ?? w.product.price,
        imageUrl: w.product.primaryImage || w.product.images?.find?.((i) => i.isPrimary)?.imageUrl || w.product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        category: w.product.category?.name || '',
        isActive: w.product.isActive
      },
      addedAt: w.createdAt
    }));
    res.json({ data, total: data.length });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/wishlist - Adiciona produto à wishlist
 */
router.post('/', async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId || typeof productId !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'productId é obrigatório' } });
    }
    const userId = req.user.id;

    const product = await prisma.product.findUnique({ where: { id: productId, isActive: true } });
    if (!product) {
      return res.status(404).json({ success: false, error: { message: 'Produto não encontrado' } });
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } }
    });
    if (existing) {
      return res.status(200).json({ success: true, data: existing, message: 'Produto já está na wishlist' });
    }

    const item = await prisma.wishlist.create({
      data: { userId, productId }
    });
    res.status(201).json({ success: true, data: item, message: 'Adicionado à wishlist' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/wishlist/:productId - Remove produto da wishlist
 */
router.delete('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const deleted = await prisma.wishlist.deleteMany({
      where: { userId, productId }
    });
    if (deleted.count === 0) {
      return res.status(404).json({ success: false, error: { message: 'Item não encontrado na wishlist' } });
    }
    res.json({ success: true, message: 'Removido da wishlist' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/wishlist/check/:productId - Verifica se produto está na wishlist
 */
router.get('/check/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const item = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } }
    });
    res.json({ inWishlist: !!item });
  } catch (error) {
    next(error);
  }
});

export default router;
