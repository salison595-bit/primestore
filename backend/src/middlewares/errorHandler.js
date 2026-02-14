/**
 * Middleware de tratamento de erros global
 * Captura e formata todos os erros da aplicação
 */

import { AppError } from '../utils/errors.js';
import { createLogger } from '../utils/logger.js';
import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';

const logger = createLogger('ErrorHandler');

/**
 * Middleware de erro global
 * Deve ser o último middleware a ser registrado
 */
export const errorHandler = (err, req, res, next) => {
  // Log do erro
  if (!err.statusCode || err.statusCode >= 500) {
    logger.error(`Erro na rota ${req.method} ${req.path}`, err);
  } else {
    logger.warn(`Erro esperado na rota ${req.method} ${req.path}: ${err.message}`);
  }

  // Verifica se é um AppError (erro conhecido)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
        timestamp: err.timestamp
      }
    });
  }

  // Erros do Prisma
  if (err.code?.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Erro de validação do JSON
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: 'JSON inválido',
        code: ERROR_CODES.INVALID_INPUT,
        details: err.message,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Erro genérico
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      message: 'Erro interno do servidor',
      code: ERROR_CODES.INTERNAL_ERROR,
      ...(process.env.NODE_ENV === 'development' && { 
        details: err.message,
        stack: err.stack 
      }),
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Trata erros específicos do Prisma
 */
function handlePrismaError(err, res) {
  let message = 'Erro no banco de dados';
  let statusCode = HTTP_STATUS.BAD_REQUEST;
  let code = ERROR_CODES.INTERNAL_ERROR;

  switch (err.code) {
    case 'P2002': // Violação de unique constraint
      message = `Valor já existe para ${err.meta?.target[0] || 'campo'}`;
      code = 'DUPLICATE_ENTRY';
      break;

    case 'P2025': // Registro não encontrado
      message = 'Registro não encontrado';
      statusCode = HTTP_STATUS.NOT_FOUND;
      code = ERROR_CODES.NOT_FOUND;
      break;

    case 'P2003': // Violação de foreign key
      message = 'Registro relacionado não encontrado';
      statusCode = HTTP_STATUS.BAD_REQUEST;
      break;

    case 'P2014': // Violação de relacionamento
      message = 'Não é possível remover este registro pois possui dependências';
      statusCode = HTTP_STATUS.BAD_REQUEST;
      code = 'ENTITY_HAS_RELATIONS';
      break;

    default:
      message = 'Erro ao processar dados do banco';
  }

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      prismaCode: err.code,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Middleware para capturar erros em rotas não encontradas
 */
export const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: {
      message: `Rota não encontrada: ${req.method} ${req.path}`,
      code: ERROR_CODES.NOT_FOUND,
      timestamp: new Date().toISOString()
    }
  });
};

export default errorHandler;
