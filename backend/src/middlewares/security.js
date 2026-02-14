/**
 * Middleware de segurança
 * Proteção XSS, CSRF, headers de segurança, etc.
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('SecurityMiddleware');

/**
 * Middleware de headers de segurança
 * Define headers HTTP de segurança
 */
export const securityHeaders = (req, res, next) => {
  // Previne clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Previne MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilita proteção XSS do navegador
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-ancestors 'none';"
  );
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy (antes Feature-Policy)
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=()'
  );
  
  // HSTS (só em produção com HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

/**
 * Middleware de sanitização simples
 * Remove caracteres perigosos de inputs
 */
export const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Sanitiza um objeto recursivamente
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      // Remove tags HTML e scripts
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }
  
  return sanitized;
}

/**
 * Middleware para prevenir path traversal attacks
 */
export const preventPathTraversal = (req, res, next) => {
  if (req.path.includes('..')) {
    logger.warn('Tentativa de path traversal detectada', { path: req.path });
    return res.status(400).json({
      success: false,
      error: {
        message: 'Requisição inválida',
        code: 'INVALID_PATH'
      }
    });
  }
  
  next();
};

/**
 * Middleware para validar tamanho de payload
 */
export const validatePayloadSize = (maxSizeMB = 10) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  
  return (req, res, next) => {
    let size = 0;
    
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        req.pause();
        res.status(413).json({
          success: false,
          error: {
            message: `Payload excede limite de ${maxSizeMB}MB`,
            code: 'PAYLOAD_TOO_LARGE'
          }
        });
      }
    });
    
    req.on('end', () => {
      next();
    });
  };
};

/**
 * Middleware para verificar origem de requisição
 */
export const verifyOrigin = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONT_URL
  ];
  
  const origin = req.headers.origin;
  
  if (origin && !allowedOrigins.includes(origin)) {
    logger.warn('Requisição de origem suspeita detectada', { origin, path: req.path });
  }
  
  next();
};

export default {
  securityHeaders,
  sanitizeInputs,
  preventPathTraversal,
  validatePayloadSize,
  verifyOrigin
};
