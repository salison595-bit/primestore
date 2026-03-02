/**
 * Middleware de logger de requisições
 * Registra todas as requisições HTTP
 */

import { createLogger } from '../utils/logger.js';
import axios from 'axios';

const logger = createLogger('RequestLogger');
const shouldSend = () => {
  if (!process.env.LOG_WEBHOOK_URL) return false;
  if (!(process.env.NODE_ENV === 'production' || process.env.FORCE_LOG_WEBHOOK === 'true')) return false;
  const rate = parseFloat(process.env.LOG_WEBHOOK_SAMPLE_RATE || '1');
  if (isNaN(rate) || rate <= 0) return false;
  if (rate >= 1) return true;
  return Math.random() < rate;
};

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

    try {
      if (shouldSend()) {
        const payload = {
          ...logData,
          timestamp: new Date().toISOString()
        };
        axios.post(process.env.LOG_WEBHOOK_URL, payload).catch(() => {});
      }
    } catch {}

    // Chama o método original
    return originalJson.call(this, data);
  };

  next();
};

export default requestLogger;
