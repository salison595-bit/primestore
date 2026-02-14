/**
 * Middleware de validação de dados
 * Valida request body, params e query contra schemas
 */

import { ValidationError } from '../utils/errors.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ValidationMiddleware');

/**
 * Factory para criar middleware de validação
 * @param {Object} schemas - { body, params, query }
 * @returns {Function} - Middleware
 */
export const validate = (schemas = {}) => {
  return (req, res, next) => {
    const errors = [];

    // Valida body se schema fornecido
    if (schemas.body) {
      const bodyValidation = schemas.body.safeParse(req.body);
      if (!bodyValidation.success) {
        errors.push(...formatZodErrors(bodyValidation.error.errors, 'body'));
      } else {
        req.body = bodyValidation.data;
      }
    }

    // Valida params se schema fornecido
    if (schemas.params) {
      const paramsValidation = schemas.params.safeParse(req.params);
      if (!paramsValidation.success) {
        errors.push(...formatZodErrors(paramsValidation.error.errors, 'params'));
      } else {
        req.params = paramsValidation.data;
      }
    }

    // Valida query se schema fornecido
    if (schemas.query) {
      const queryValidation = schemas.query.safeParse(req.query);
      if (!queryValidation.success) {
        errors.push(...formatZodErrors(queryValidation.error.errors, 'query'));
      } else {
        req.query = queryValidation.data;
      }
    }

    if (errors.length > 0) {
      logger.warn('Validação falhou', { errors, path: req.path });
      return next(new ValidationError('Dados inválidos', errors));
    }

    next();
  };
};

/**
 * Formata erros do Zod em array legível
 */
function formatZodErrors(errors, source) {
  return errors.map(err => ({
    field: `${source}.${err.path.join('.')}`,
    message: err.message,
    code: err.code
  }));
}

/**
 * Middleware para validação manual customizada
 */
export const validateManual = (validationFn) => {
  return (req, res, next) => {
    const result = validationFn(req);
    
    if (!result.valid) {
      logger.warn('Validação customizada falhou', result.errors);
      return next(new ValidationError('Dados inválidos', result.errors));
    }
    
    next();
  };
};

export default validate;
