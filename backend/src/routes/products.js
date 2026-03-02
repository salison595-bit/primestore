import express from 'express';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { validate } from '../middlewares/validation.js';
import { z } from 'zod';

const router = express.Router();

const listQuerySchema = z.object({
  category: z.string().optional(),
  min: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  max: z.string().regex(/^\d+(\.\d+)?$/).optional(),
  q: z.string().optional(),
  sort: z.enum(['createdAt','price','name']).optional(),
  order: z.enum(['asc','desc']).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

router.get('/', validate({ query: listQuerySchema }), async (req, res, next) => {
  try {
    const { category, min, max, q, sort = 'createdAt', order = 'desc', page = 1, limit = 10 } = req.query;
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

    if (q) {
      const term = q.toString();
      where.AND = (where.AND || []).concat([
        {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { category: { is: { name: { contains: term, mode: 'insensitive' } } } },
          ],
        },
      ]);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        skip,
        take,
        orderBy: (() => {
          const s = ['price', 'createdAt', 'name'].includes(String(sort)) ? String(sort) : 'createdAt';
          const o = ['asc', 'desc'].includes(String(order)) ? String(order) : 'desc';
          return { [s]: o };
        })(),
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

    const etag = crypto.createHash('sha1').update(JSON.stringify({ data, total, page: Number(page), limit: take })).digest('hex');
    const lastUpdated = (() => {
      const dates = products.map((p) => p.updatedAt || p.createdAt).filter(Boolean).map((d) => new Date(d).getTime());
      return dates.length ? new Date(Math.max(...dates)) : new Date();
    })();
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      const sinceDate = new Date(ifModifiedSince);
      if (!isNaN(sinceDate.getTime()) && lastUpdated.getTime() <= sinceDate.getTime() + 1000) {
        res.set('ETag', etag);
        res.set('Last-Modified', lastUpdated.toUTCString());
        res.status(304).end();
        return;
      }
    }
    if (req.headers['if-none-match'] === etag) {
      res.set('ETag', etag);
      res.status(304).end();
      return;
    }
    res.set('X-Total-Count', String(total));
    res.set('X-Page-Count', String(Math.ceil(total / take)));
    res.set('X-Pagination-Limit', String(take));
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.set('Surrogate-Control', 'max-age=300, stale-while-revalidate=600');
    res.set('Vary', 'Accept, If-None-Match, If-Modified-Since');
    res.set('Last-Modified', lastUpdated.toUTCString());
    res.set('ETag', etag);
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

/** GET /api/products/featured - Produtos em destaque */
router.get('/featured', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 24);
    const products = await prisma.product.findMany({
      where: { featured: true, isActive: true },
      include: { category: { select: { name: true, slug: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
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
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.json({ data, total: data.length });
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

    const etag = crypto.createHash('sha1').update(JSON.stringify(data)).digest('hex');
    const lastUpdated = p.updatedAt || p.createdAt || new Date();
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince) {
      const sinceDate = new Date(ifModifiedSince);
      const lu = new Date(lastUpdated);
      if (!isNaN(sinceDate.getTime()) && lu.getTime() <= sinceDate.getTime() + 1000) {
        res.set('ETag', etag);
        res.set('Last-Modified', new Date(lastUpdated).toUTCString());
        res.status(304).end();
        return;
      }
    }
    if (req.headers['if-none-match'] === etag) {
      res.set('ETag', etag);
      res.status(304).end();
      return;
    }
    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    res.set('Surrogate-Control', 'max-age=300, stale-while-revalidate=600');
    res.set('Vary', 'Accept, If-None-Match, If-Modified-Since');
    res.set('Last-Modified', new Date(lastUpdated).toUTCString());
    res.set('ETag', etag);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
