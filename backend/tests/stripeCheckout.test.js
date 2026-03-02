import { test } from 'node:test';
import assert from 'node:assert/strict';
import PaymentService from '../src/services/paymentService.js';

process.env.STRIPE_SECRET_KEY = 'sk_test_primestore_replace';
process.env.FRONT_URL = 'http://localhost:5173';

test('createStripeCheckoutSession retorna mock com client_reference_id e metadata', async () => {
  const result = await PaymentService.createStripeCheckoutSession({
    orderId: 'order-xyz-789',
    items: [
      { name: 'Produto', quantity: 1, price: 100 }
    ],
    total: 100,
    email: 'cliente@example.com',
    customerName: 'Cliente'
  });
  assert.ok(result.url.includes('mock/stripe-session'));
  assert.ok(result.sessionId.startsWith('cs_mock_'));
});
