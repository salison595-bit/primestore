/**
 * Configuração do Prisma Client
 * Inicializa e exporta a instância única do Prisma
 */

import { PrismaClient } from "@prisma/client";

let prisma;

try {
  if (!global.prisma) {
    const rawUrl = process.env.DATABASE_URL || '';
    let finalUrl = rawUrl;
    try {
      const u = new URL(rawUrl);
      if (!u.searchParams.has('sslmode')) {
        u.searchParams.set('sslmode', 'require');
      }
      finalUrl = u.toString();
    } catch {
      finalUrl = rawUrl ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}sslmode=require` : rawUrl;
    }

    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
      datasources: { db: { url: finalUrl } }
    });
  }

  prisma = global.prisma;
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  throw error;
}

export default prisma;
