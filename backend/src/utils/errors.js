/**
 * Classes de erro customizadas
 * Oferece estrutura padronizada para tratamento de erros
 */

import { HTTP_STATUS, ERROR_CODES } from '../config/constants.js';

/**
 * Erro customizado da aplicação
 */
export class AppError extends Error {
  constructor(
    message,
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code = ERROR_CODES.INTERNAL_ERROR,
    details = null
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(
      message || 'Dados inválidos',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.VALIDATION_ERROR,
      details
    );
    this.name = 'ValidationError';
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Não autenticado', code = ERROR_CODES.UNAUTHORIZED) {
    super(message, HTTP_STATUS.UNAUTHORIZED, code);
    this.name = 'AuthenticationError';
  }
}

/**
 * Erro de autorização
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Recurso', message = null) {
    super(
      message || `${resource} não encontrado`,
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Erro de conflito (ex: email já existe)
 */
export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, HTTP_STATUS.CONFLICT, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

/**
 * Erro de recurso já existe
 */
export class AlreadyExistsError extends AppError {
  constructor(resource, message = null) {
    super(
      message || `${resource} já existe`,
      HTTP_STATUS.CONFLICT,
      'ALREADY_EXISTS'
    );
    this.name = 'AlreadyExistsError';
  }
}

/**
 * Erro de stock insuficiente
 */
export class InsufficientStockError extends AppError {
  constructor(product, available, requested) {
    super(
      `Stock insuficiente para ${product}. Disponível: ${available}, Solicitado: ${requested}`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.INSUFFICIENT_STOCK
    );
    this.name = 'InsufficientStockError';
  }
}

/**
 * Erro de pagamento
 */
export class PaymentError extends AppError {
  constructor(message, details = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.PAYMENT_FAILED, details);
    this.name = 'PaymentError';
  }
}

/**
 * Erro de cupom
 */
export class CouponError extends AppError {
  constructor(message, code = ERROR_CODES.COUPON_NOT_FOUND) {
    super(message, HTTP_STATUS.BAD_REQUEST, code);
    this.name = 'CouponError';
  }
}

export default AppError;
