/**
 * Validação de variáveis de ambiente
 * Garante que todas as variáveis necessárias estão presentes no inicialização
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NODE_ENV',
  'JWT_SECRET',
  'MP_ACCESS_TOKEN',
  'FRONT_URL'
];

const optionalEnvVars = [
  'PORT',
  'MERCADO_PAGO_WEBHOOK_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'REDIS_URL'
];

export function validateEnv() {
  const missing = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Variáveis de ambiente obrigatórias faltando:');
    missing.forEach(v => console.error(`  - ${v}`));
    process.exit(1);
  }

  console.log('✅ Todas as variáveis de ambiente obrigatórias estão presentes');
}

export const config = {
  // Aplicação
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'),
  
  // Banco de dados
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Autenticação
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '7d',
  REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '30d',
  
  // URLs
  FRONT_URL: process.env.FRONT_URL,
  API_URL: process.env.API_URL || `http://localhost:${parseInt(process.env.PORT || '5000')}`,
  
  // Mercado Pago
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
  MP_WEBHOOK_SECRET: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
  
  // AWS S3 (para upload de imagens)
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  AWS_REGION: process.env.AWS_REGION || 'sa-east-1',
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@primestore.com',
  
  // Redis (para cache e sessions)
  REDIS_URL: process.env.REDIS_URL,
  
  // Features
  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE === 'true',
  DEBUG: process.env.DEBUG === 'true'
};

export default config;
