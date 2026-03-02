import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { app } from '../server.js';

let server;

const request = (path, method = 'GET') =>
  new Promise((resolve, reject) => {
    const addr = server.address();
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: addr.port,
        path,
        method
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
    req.end();
  });

before(() => {
  server = app.listen(0);
});

after(() => {
  server.close();
});

test('GET /health retorna sucesso', async () => {
  const res = await request('/health');
  assert.equal(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.equal(json.success, true);
  assert.equal(json.data.status, 'OK');
});

test('GET /ready responde com JSON válido', async () => {
  const res = await request('/ready');
  const json = JSON.parse(res.body);
  assert.equal(typeof json.success, 'boolean');
  assert.ok(json.data || json.error);
});

test('GET /products retorna lista', async () => {
  const res = await request('/products');
  assert.equal(res.statusCode, 200);
  const json = JSON.parse(res.body);
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
});
