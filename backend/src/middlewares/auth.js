/**
 * Middleware de autenticação JWT
 * Verifica e valida tokens nas requisições
 */

import JWTUtil from '../utils/jwt.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AuthMiddleware');

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next(new AuthenticationError('Nenhum token fornecido'));
    }

    const token = JWTUtil.extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next(new AuthenticationError('Token malformado'));
    }

    const decoded = JWTUtil.verifyToken(token);
    req.user = decoded;
    
    logger.debug('Usuário autenticado', { userId: decoded.id });
    next();
  } catch (error) {
    logger.error('Erro na autenticação', error);
    return next(new AuthenticationError('Token inválido ou expirado'));
  }
};

/**
 * Middleware de verificação de role/permissão
 * @param {Array<string>} allowedRoles - Roles permitidos
 * @returns {Function} - Middleware
 */
export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Usuário não autenticado'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Acesso negado por role', { userId: req.user.id, role: req.user.role });
      return next(new AuthorizationError(`Role '${req.user.role}' não tem permissão`));
    }

    next();
  };
};

/**
 * Middleware opcional de autenticação
 * Tenta autenticar mas não falha se não conseguir
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = JWTUtil.extractTokenFromHeader(authHeader);
    
    if (token) {
      const decoded = JWTUtil.verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Ignora erro de autenticação para middleware opcional
  }
  
  next();
};

export default authMiddleware;
