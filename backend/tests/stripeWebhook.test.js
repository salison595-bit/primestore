import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server.js';

let server;

const postJson = (path, body) =>
  new Promise((resolve, reject) => {
    const addr = server.address();
    const payload = Buffer.from(JSON.stringify(body));
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': payload.length
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          })
        );
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });

before(() => {
  server = app.listen(0);
});

after(() => {
  server.close();
});

test('POST /api/webhooks/stripe aceita evento em modo dev e lê orderId', async () => {
  const res = await postJson('/api/webhooks/stripe', {
    id: 'evt_test_1',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        payment_intent: 'pi_test_456',
        client_reference_id: 'order-abc-123',
        metadata: {
          orderId: 'order-abc-123'
        }
      }
    }
  });
  assert.equal(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.equal(json.received, true);
});
