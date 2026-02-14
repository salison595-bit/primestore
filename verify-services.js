#!/usr/bin/env node

/**
 * Script de Verificação de Serviços
 * Testa conectividade de backend e frontend
 * Verifica webhooks e admin access
 */

import http from 'http';

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';
const ADMIN_TOKEN = 'test-token'; // Será obtido após login

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function request(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            body: body ? JSON.parse(body).catch(() => body) : null,
            headers: res.headers,
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function main() {
  console.log('\n');
  log('╔════════════════════════════════════════════╗', 'blue');
  log('║   🔍 VERIFICAÇÃO DE SERVIÇOS PRIME STORE   ║', 'blue');
  log('╚════════════════════════════════════════════╝', 'blue');
  console.log('\n');

  // 1. Teste de conectividade Backend
  log('1️⃣ Testando Backend (http://localhost:5000)', 'yellow');
  try {
    const backendResponse = await request(`${BACKEND_URL}/api/health`);
    if (backendResponse.status === 200) {
      log('   ✅ Backend respondendo na porta 5000', 'green');
    } else {
      log(`   ⚠️  Backend respondeu com status ${backendResponse.status}`, 'yellow');
    }
  } catch (error) {
    log(`   ❌ Erro ao conectar ao backend: ${error.message}`, 'red');
  }

  // 2. Teste de Webhook de Teste
  log('\n2️⃣ Testando Webhook de Teste', 'yellow');
  try {
    const webhookResponse = await request(`${BACKEND_URL}/api/webhooks/test`, 'POST', {
      test: true,
      message: 'Teste de webhook',
    });
    if (webhookResponse.status >= 200 && webhookResponse.status < 300) {
      log('   ✅ Webhook test respondida com sucesso', 'green');
      log(`      Status: ${webhookResponse.status}`, 'green');
    } else {
      log(`   ⚠️  Webhook respondeu com status ${webhookResponse.status}`, 'yellow');
    }
  } catch (error) {
    log(
      `   ⚠️  Webhook test não respondeu (backend pode estar aguardando DB): ${error.message}`,
      'yellow'
    );
  }

  // 3. Teste de conectividade Frontend
  log('\n3️⃣ Testando Frontend (http://localhost:3000)', 'yellow');
  try {
    const frontendResponse = await request(FRONTEND_URL);
    if (frontendResponse.status === 200) {
      log('   ✅ Frontend respondendo na porta 3000', 'green');
    } else {
      log(`   ⚠️  Frontend respondeu com status ${frontendResponse.status}`, 'yellow');
    }
  } catch (error) {
    log(`   ❌ Erro ao conectar ao frontend: ${error.message}`, 'red');
  }

  // 4. Informações de Acesso
  console.log('\n');
  log('4️⃣ Informações de Acesso', 'blue');
  log('   Frontend Admin: http://localhost:3000/admin', 'blue');
  log('   Email Admin: admin@primestore.com', 'blue');
  log('   Senha: Admin@123456', 'blue');
  log('   ⚠️  Altere a senha na primeira vez!', 'yellow');

  // 5. Endpoints Disponíveis
  console.log('\n');
  log('5️⃣ Endpoints de Webhook', 'blue');
  log('   POST /api/webhooks/mercadopago - Webhook Mercado Pago', 'blue');
  log('   POST /api/webhooks/stripe - Webhook Stripe', 'blue');
  log('   POST /api/webhooks/test - Webhook de Teste', 'blue');

  // 6. Configurações Necessárias
  console.log('\n');
  log('6️⃣ Configurações Necessárias para Produção', 'yellow');
  log('   ✓ DATABASE_URL - Banco PostgreSQL configurado', 'blue');
  log('   ✓ JWT_SECRET - Chave JWT gerada', 'blue');
  log('   ✓ MP_ACCESS_TOKEN - Token Mercado Pago', 'blue');
  log('   ✓ SMTP_HOST/USER/PASS - Servidor de email configurado', 'blue');
  log('   ✓ AWS_ACCESS_KEY_ID - Credenciais AWS S3 (opcional)', 'blue');
  log('   ✓ REDIS_URL - Redis para cache (opcional)', 'blue');

  // 7. Próximos Passos
  console.log('\n');
  log('7️⃣ Próximos Passos', 'blue');
  log('   1. Teste o login em http://localhost:3000/admin', 'blue');
  log('   2. Configure as variáveis de ambiente em production', 'blue');
  log('   3. Configure webhooks no painel do Mercado Pago', 'blue');
  log('   4. Deploy para produção', 'blue');

  console.log('\n');
  log('✅ Verificação concluída!', 'green');
  console.log('\n');
}

main().catch(console.error);
