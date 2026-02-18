import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { category, min, max, page = 1, limit = 10 } = req.query;
    const where = {};

    if (category) {
      where.OR = [
        { category: { is: { slug: category.toString().toLowerCase() } } },
        { category: { is: { name: { equals: category.toString(), mode: 'insensitive' } } } },
      ];
    }

    if (min || max) {
      where.price = {
        gte: min ? Number(min) : undefined,
        lte: max ? Number(max) : undefined,
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.finalPrice ?? p.price,
      imageUrl:
        p.primaryImage ||
        p.images?.find?.((i) => i.isPrimary)?.imageUrl ||
        p.images?.[0]?.imageUrl ||
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      category: p.category?.name || '',
      createdAt: p.createdAt,
    }));

    res.json({
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = await prisma.product.findUnique({
      where: { id },
      include: { category: { select: { name: true, slug: true } }, images: true },
    });
    if (!p) return res.status(404).json({ error: 'Produto não encontrado' });

    const data = {
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.finalPrice ?? p.price,
      imageUrl:
        p.primaryImage ||
        p.images?.find?.((i) => i.isPrimary)?.imageUrl ||
        p.images?.[0]?.imageUrl ||
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      category: p.category?.name || '',
      createdAt: p.createdAt,
    };

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
