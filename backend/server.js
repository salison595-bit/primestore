/**
 * PRIME STORE - API BACKEND
 * Servidor Express com arquitetura modular profissional
 * 
 * Stack: Node.js + Express + Prisma + PostgreSQL + JWT
 * Segurança: bcrypt + JWT + Rate Limiting + Headers de Segurança
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Imports de configuração
import { validateEnv, config } from './src/config/env.js';
import { corsOptions } from './src/config/corsOptions.js';
import prisma from './src/config/database.js';
import { createLogger } from './src/utils/logger.js';

// Imports de middlewares
import { requestLogger } from './src/middlewares/requestLogger.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';
import { 
  authMiddleware, 
  authorizeRoles, 
  optionalAuth 
} from './src/middlewares/auth.js';
import {
  securityHeaders,
  sanitizeInputs,
  preventPathTraversal,
  verifyOrigin
} from './src/middlewares/security.js';
import { rateLimiter, publicApiRateLimiter } from './src/middlewares/rateLimiter.js';

// Imports de rotas
import apiRoutes from './src/routes/index.js';

// Configuração de variáveis de ambiente
dotenv.config();
validateEnv();

// Logger da aplicação
const logger = createLogger('Server');

// Inicialização do Express
const app = express();

// Importar Mercado Pago
const mp = new MercadoPagoConfig({
  accessToken: config.MP_ACCESS_TOKEN || ''
});

// ============================================================================
// MIDDLEWARES GLOBAIS
// ============================================================================

// Ordem importa: segurança primeiro
app.use(securityHeaders); // Headers de segurança
app.use(preventPathTraversal); // Previne path traversal
app.use(verifyOrigin); // Verifica origem
app.use(cors(corsOptions)); // CORS com configuração
app.use(express.json({ limit: '50mb' })); // Parser JSON
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Parser URL encoded
app.use(sanitizeInputs); // Sanitiza inputs
app.use(requestLogger); // Logger de requisições
app.use(publicApiRateLimiter); // Rate limiting global

// ============================================================================
// ROTAS DE SAÚDE (sem autenticação)
// ============================================================================

app.get('/health', (req, res) => {
  res.json({ 
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: config.NODE_ENV,
      version: '1.0.0'
    }
  });
});

app.get('/', (req, res) => {
  res.json({ 
    success: true,
    data: {
      message: 'PRIME STORE API 🚀',
      version: '1.0.0',
      docs: '/api/docs'
    }
  });
});

// ============================================================================
// ROTAS TEMPORÁRIAS (para retrocompatibilidade)
// TODO: Remover quando migrations estiverem completas
// ============================================================================

app.get('/products', async (req, res, next) => {
  try {
    // Compatibilidade com cliente existente
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        supplier: {
          select: {
            id: true,
            name: true
          }
        }
      },
      where: { isActive: true }
    });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
});

app.post('/products', async (req, res, next) => {
  try {
    // Validação básica
    if (!req.body.name || !req.body.price) {
      throw new Error('Nome e preço são obrigatórios');
    }

    const product = await prisma.product.create({
      data: {
        name: req.body.name,
        slug: req.body.name.toLowerCase().replace(/\s+/g, '-'),
        description: req.body.description || '',
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock || 0),
        categoryId: req.body.categoryId || null,
        images: {
          create: req.body.image ? [{
            imageUrl: req.body.image,
            isPrimary: true
          }] : []
        }
      },
      include: {
        images: true,
        category: true
      }
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

app.post('/create-payment', async (req, res, next) => {
  try {
    const { id, title, price, items } = req.body;

    let product = null;
    if (id) {
      product = await prisma.product.findUnique({
        where: { id }
      });
    }

    if (!product && (!title || typeof price !== "number")) {
      return res.status(400).json({ 
        success: false,
        error: {
          message: 'Dados insuficientes para criar pagamento'
        }
      });
    }

    const preference = {
      items: items && Array.isArray(items) && items.length > 0 ? items : [
        {
          title: product ? product.name : title,
          unit_price: product ? product.price : price,
          quantity: 1
        }
      ],
      back_urls: {
        success: `${config.FRONT_URL}/success`,
        failure: `${config.FRONT_URL}/error`
      },
      auto_return: 'approved'
    };

    const prefClient = new Preference(mp);
    const response = await prefClient.create({ body: preference });
    
    res.json({ 
      success: true,
      data: {
        url: response.init_point, 
        id: response.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ROTAS DA API
// ============================================================================

/**
 * Registra todas as rotas sob prefixo /api
 * Inclui:
 * - /api/auth - Autenticação (login, register, etc)
 * - /api/users - Gerenciamento de usuários
 * - /api/products - Gestão de produtos
 * - /api/orders - Pedidos
 * - /api/cart - Carrinho de compras
 * - /api/payments - Pagamentos
 * - /api/coupons - Cupons de desconto
 * - /api/addresses - Endereços de usuário
 * - /api/categories - Categorias de produtos
 * - /api/reviews - Avaliações
 * - /api/admin - Painel administrativo
 * - /api/webhooks - Webhooks de pagamento
 */
app.use('/api', apiRoutes);

// ============================================================================
// TRATAMENTO DE ERROS
// ============================================================================

// 404 - Rota não encontrada
app.use(notFoundHandler);

// Handler global de erros (DEVE ser o último)
app.use(errorHandler);

// ============================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

const PORT = config.PORT || 5000;

const startServer = async () => {
  try {
    // Testa conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Conexão com banco de dados estabelecida');

    // Inicia servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📝 Ambiente: ${config.NODE_ENV}`);
      logger.info(`🔐 CORS habilitado para: ${config.FRONT_URL}`);
      logger.info(`📊 Banco de dados: PostgreSQL`);
      console.log('\n' + '='.repeat(50));
      console.log('  PRIME STORE - API ONLINE 🚀');
      console.log(`  URL: http://localhost:${PORT}`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    logger.error('❌ Erro ao iniciar servidor', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Encerrando servidor...');
  await prisma.$disconnect();
  logger.info('✅ Conexão com banco encerrada');
  process.exit(0);
});

// Inicia o servidor
startServer();
