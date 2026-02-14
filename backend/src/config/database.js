/**
 * Configuração do Prisma Client
 * Inicializa e exporta a instância única do Prisma
 * Usa o arquivo prisma.config.ts para configuração do datasource
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

let prisma;

try {
  if (!global.prisma) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
    });

    const adapter = new PrismaPg(pool);

    global.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error']
    });
  }

  prisma = global.prisma;
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  throw error;
}

export default prisma;
