#!/usr/bin/env node

/**
 * Script para testar webhook do Mercado Pago
 * Uso: node test-webhook.js
 */

const crypto = require('crypto');

// Simulação de dados do webhook Mercado Pago
const WEBHOOK_SECRET = '493dbc57510ad42d631469b2d854b4a53a53b374c4939e289388eedcf4dfaa7c';
const NOTIFICATION_ID = '123456789';
const TIMESTAMP = Math.floor(Date.now() / 1000).toString();

// 1️⃣ GERAR ASSINATURA VÁLIDA
function generateValidSignature(id, timestamp, secret) {
  const data = `${id}|${timestamp}|${secret}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// 2️⃣ VALIDAR ASSINATURA (como faz o controller)
function validateSignature(signature, id, timestamp, secret) {
  const data = `${id}|${timestamp}|${secret}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );
  } catch (error) {
    return false;
  }
}

// 🧪 TESTES
console.log('🧪 TESTE DE WEBHOOK MERCADO PAGO\n');
console.log('═'.repeat(60));

// Teste 1: Gerar assinatura válida
const validSignature = generateValidSignature(NOTIFICATION_ID, TIMESTAMP, WEBHOOK_SECRET);
console.log('\n✅ Teste 1: Gerar Assinatura Válida');
console.log(`   ID: ${NOTIFICATION_ID}`);
console.log(`   Timestamp: ${TIMESTAMP}`);
console.log(`   Secret: ${WEBHOOK_SECRET.substring(0, 10)}...`);
console.log(`   Assinatura Gerada: ${validSignature}`);

// Teste 2: Validar assinatura válida
const isValid = validateSignature(validSignature, NOTIFICATION_ID, TIMESTAMP, WEBHOOK_SECRET);
console.log('\n✅ Teste 2: Validar Assinatura Válida');
console.log(`   Resultado: ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);

// Teste 3: Validar assinatura inválida
const invalidSignature = 'signature_invalida_123456';
const isValidInvalid = validateSignature(invalidSignature, NOTIFICATION_ID, TIMESTAMP, WEBHOOK_SECRET);
console.log('\n✅ Teste 3: Rejeitar Assinatura Inválida');
console.log(`   Resultado: ${!isValidInvalid ? '✅ CORRETAMENTE REJEITADA' : '❌ ERRO'}`);

// Teste 4: Comando CURL para testar webhook
console.log('\n✅ Teste 4: Comando CURL para Testar');
console.log('\n📋 TESTE SIMPLES (sem validação):');
console.log(`
curl -X POST http://localhost:5000/api/webhooks/test \\
  -H "Content-Type: application/json" \\
  -d '{"test": true, "message": "Teste iniciado em ${new Date().toISOString()}"}'
`);

console.log('📋 TESTE COM WEBHOOK REAL (com assinatura):');
const webhookPayload = {
  id: NOTIFICATION_ID,
  type: 'payment',
  data: {
    id: 'payment_' + Math.random().toString(36).substring(7)
  }
};

console.log(`
curl -X POST http://localhost:5000/api/webhooks/mercadopago \\
  -H "Content-Type: application/json" \\
  -H "x-signature: ${validSignature}" \\
  -H "x-signature-ts: ${TIMESTAMP}" \\
  -d '${JSON.stringify(webhookPayload, null, 2)}'
`);

// Teste 5: Simulação do fluxo completo
console.log('✅ Teste 5: Simulação do Fluxo Completo\n');

const testCases = [
  {
    name: 'Webhook de Pagamento Aprovado',
    payload: {
      id: '11111111',
      type: 'payment',
      data: {
        id: 12345678,
        status: 'approved',
        external_reference: 'ORDER_12345'
      }
    }
  },
  {
    name: 'Webhook de Pedido Mercante',
    payload: {
      id: '22222222',
      type: 'merchant_order',
      data: {
        id: 98765432,
        status: 'closed'
      }
    }
  },
  {
    name: 'Webhook de Intent de Pagamento',
    payload: {
      id: '33333333',
      type: 'payment_intent',
      data: {
        id: 'pi_123456',
        status: 'succeeded'
      }
    }
  }
];

testCases.forEach((testCase, index) => {
  const testId = testCase.payload.id;
  const testTimestamp = Math.floor(Date.now() / 1000).toString();
  const testSignature = generateValidSignature(testId, testTimestamp, WEBHOOK_SECRET);
  
  console.log(`   ${index + 1}. ${testCase.name}`);
  console.log(`      ID: ${testId}`);
  console.log(`      Type: ${testCase.payload.type}`);
  console.log(`      Assinatura: ${testSignature.substring(0, 20)}...`);
  console.log(`      Comando:`);
  console.log(`      
curl -X POST http://localhost:5000/api/webhooks/mercadopago \\
  -H "Content-Type: application/json" \\
  -H "x-signature: ${testSignature}" \\
  -H "x-signature-ts: ${testTimestamp}" \\
  -d '${JSON.stringify(testCase.payload)}'
  `);
  console.log();
});

console.log('═'.repeat(60));
console.log('\n📖 PRÓXIMOS PASSOS:\n');
console.log('1. Copie um dos comandos CURL acima');
console.log('2. Abra novo terminal (PowerShell)');
console.log('3. Certifique-se que backend está rodando: npm run dev');
console.log('4. Cole e execute o comando CURL');
console.log('5. Verificar resposta (deve ser 200 OK)\n');
console.log('6. Para listar eventos processados:');
console.log(`
curl http://localhost:5000/api/webhooks/events \\
  -H "Authorization: Bearer seu_token_jwt"
`);
console.log('\n✨ Sistema pronto para receber webhooks!\n');
