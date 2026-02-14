/**
 * Middleware de logger de requisições
 * Registra todas as requisições HTTP
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('RequestLogger');

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Captura o método original res.json
  const originalJson = res.json;
  
  // Sobrescreve res.json para logar resposta
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id || 'anonymous'
    };

    // Log por nível de status
    if (res.statusCode < 400) {
      logger.info(`${req.method} ${req.path} - ${res.statusCode}`, logData);
    } else if (res.statusCode < 500) {
      logger.warn(`${req.method} ${req.path} - ${res.statusCode}`, {
        ...logData,
        error: data?.error?.message
      });
    } else {
      logger.error(`${req.method} ${req.path} - ${res.statusCode}`, {
        ...logData,
        error: data?.error?.message
      });
    }

    // Chama o método original
    return originalJson.call(this, data);
  };

  next();
};

export default requestLogger;
