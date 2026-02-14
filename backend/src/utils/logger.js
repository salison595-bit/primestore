/**
 * Sistema de logging estruturado
 * Fornece diferentes níveis e formatação de logs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
    this.level = LOG_LEVELS[process.env.LOG_LEVEL || 'INFO'];
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
    }
  }

  writeToFile(message) {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${today}.log`);
    
    fs.appendFile(logFile, message + '\n', (err) => {
      if (err) console.error('Erro ao escrever log:', err);
    });
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
