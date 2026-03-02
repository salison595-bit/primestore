/**
 * Sistema de logging estruturado
 * Fornece diferentes níveis e formatação de logs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LOG_COLORS = {
  DEBUG: '\x1b[36m', // Cyan
  INFO: '\x1b[32m',  // Green
  WARN: '\x1b[33m',  // Yellow
  ERROR: '\x1b[31m', // Red
  RESET: '\x1b[0m'
};

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor(module) {
    this.module = module;
    const defaultLevel = (process.env.NODE_ENV === 'production') ? 'INFO' : 'DEBUG';
    const envLevel = process.env.LOG_LEVEL || defaultLevel;
    this.level = LOG_LEVELS[envLevel];
    this.webhookUrl = process.env.LOG_WEBHOOK_URL || '';
    this.sampleRate = parseFloat(process.env.LOG_WEBHOOK_SAMPLE_RATE || '1');
    this.forceWebhook = (process.env.FORCE_LOG_WEBHOOK || 'false') === 'true';
    this.minWebhookLevel = LOG_LEVELS[(process.env.LOG_WEBHOOK_MIN_LEVEL || 'INFO')];
  }

  format(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level] || '';
    const reset = LOG_COLORS.RESET;
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    
    return `${timestamp} [${color}${level}${reset}] [${this.module}] ${message}${dataStr}`;
  }

  log(level, message, data = null) {
    if (this.level <= LOG_LEVELS[level]) {
      const formatted = this.format(level, message, data);
      console.log(formatted);
      
      // Escrever em arquivo
      this.writeToFile(formatted);

      // Enviar para webhook externo (centralização)
      this.sendToWebhook(level, message, data);
    }
  }

  writeToFile(message) {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${today}.log`);
    
    fs.appendFile(logFile, message + '\n', (err) => {
      if (err) console.error('Erro ao escrever log:', err);
    });
  }

  shouldSend(level) {
    if (!this.webhookUrl) return false;
    const envOk = (process.env.NODE_ENV === 'production') || this.forceWebhook;
    if (!envOk) return false;
    if (LOG_LEVELS[level] < this.minWebhookLevel) return false;
    if (isNaN(this.sampleRate) || this.sampleRate <= 0) return false;
    if (this.sampleRate >= 1) return true;
    return Math.random() < this.sampleRate;
  }

  async sendToWebhook(level, message, data) {
    try {
      if (!this.shouldSend(level)) return;
      const payload = {
        level,
        module: this.module,
        message,
        data,
        timestamp: new Date().toISOString()
      };
      await axios.post(this.webhookUrl, payload);
    } catch {}
  }

  debug(message, data) {
    this.log('DEBUG', message, data);
  }

  info(message, data) {
    this.log('INFO', message, data);
  }

  warn(message, data) {
    this.log('WARN', message, data);
  }

  error(message, error) {
    const errorData = {
      message: error?.message,
      stack: error?.stack,
      code: error?.code
    };
    this.log('ERROR', message, errorData);
  }
}

export const createLogger = (module) => new Logger(module);

// Export a default logger instance
export const logger = new Logger('App');

export default Logger;
