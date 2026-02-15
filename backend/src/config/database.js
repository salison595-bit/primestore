/**
 * Configuração do Prisma Client
 * Inicializa e exporta a instância única do Prisma
 */

import { PrismaClient } from "@prisma/client";

let prisma;

try {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error']
    });
  }

  prisma = global.prisma;
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  throw error;
}

export default prisma;
