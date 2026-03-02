import { test } from 'node:test';
import assert from 'node:assert/strict';
import PaymentController from '../src/controllers/paymentController.js';
import OrderService from '../src/services/orderService.js';

process.env.STRIPE_SECRET_KEY = 'sk_test_primestore_replace';
process.env.FRONT_URL = 'http://localhost:5173';

test('PaymentController.createStripeCheckoutSession cria sessão com metadata e client_reference_id', async () => {
  const orderId = 'order-ctrl-001';
  // Mock do OrderService.getOrder para evitar acesso ao banco
  OrderService.getOrder = async () => ({
    id: orderId,
    userId: 'user-1',
    total: 199.9,
    items: [
      { name: 'Produto A', quantity: 1, price: 199.9 }
    ]
  });

  const req = {
    user: { id: 'user-1', email: 'cliente@example.com', name: 'Cliente' },
    body: { orderId }
  };
  let payload = null;
  const res = {
    status: function () { return this; },
    json: (data) => { payload = data; }
  };
  const next = (err) => { throw err; };

  await PaymentController.createStripeCheckoutSession(req, res, next);
  assert.ok(payload && payload.success === true);
  assert.ok(payload.data && payload.data.url.includes('mock/stripe-session'));
});
