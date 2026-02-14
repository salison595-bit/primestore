/**
 * Middleware de rate limiting
 * Limita número de requisições por IP/usuário em período de tempo
 */

import { createLogger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

const logger = createLogger('RateLimiter');

// Armazena informações de requisições em memória
// Em produção usar Redis para distribuído
const requestCounts = new Map();
const CLEANUP_INTERVAL = 60000; // Limpar a cada 1 minuto

// Limpar dados antigos periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.lastRequest > 60000) {
      requestCounts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Factory para criar middleware de rate limiting
 * @param {Object} options - { windowMs, maxRequests, keyGenerator }
 * @returns {Function} - Middleware
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos padrão
    maxRequests = 100,
    keyGenerator = (req) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Muitas requisições, tente novamente mais tarde'
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    
    if (!requestCounts.has(key)) {
      requestCounts.set(key, {
        count: 1,
        firstRequest: now,
        lastRequest: now,
        blocked: false
      });
      return next();
    }

    const data = requestCounts.get(key);
    const timeElapsed = now - data.firstRequest;

    // Reset se passou a janela de tempo
    if (timeElapsed > windowMs) {
      data.count = 1;
      data.firstRequest = now;
      data.lastRequest = now;
      data.blocked = false;
      return next();
    }

    // Incrementa contador
    data.count++;
    data.lastRequest = now;

    // Verifica se excedeu limite
    if (data.count > maxRequests) {
      data.blocked = true;
      logger.warn('Rate limit excedido', { 
        key, 
        count: data.count, 
        maxRequests,
        path: req.path 
      });
      
      const retryAfter = Math.ceil((data.firstRequest + windowMs - now) / 1000);
      res.set('Retry-After', retryAfter);
      
      return next(new AppError(message, 429, 'RATE_LIMIT_EXCEEDED'));
    }

    next();
  };
};

/**
 * Rate limiter específico para autenticação (mais restritivo)
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5, // Máximo 5 tentativas
  keyGenerator: (req) => `auth:${req.ip || 'unknown'}:${req.body?.email || 'unknown'}`,
  message: 'Muitas tentativas de login, tente novamente em 15 minutos'
});

/**
 * Rate limiter específico para API pública
 */
export const publicApiRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 1000,
  keyGenerator: (req) => req.ip || 'unknown',
  message: 'Limite de requisições atingido'
});

/**
 * Rate limiter para usuários autenticados (menos restritivo)
 */
export const authenticatedRateLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 5000,
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
  message: 'Limite de requisições atingido para sua conta'
});

export default rateLimiter;
