import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { config } from '../netlify/functions/contact.mjs';
import { calculateQuote } from '../src/data/web-offers.mjs';

const request = (body, headers = {}) => new Request('https://enkotech.be/.netlify/functions/contact', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', ...headers }, body: JSON.stringify(body) });
const contact = { type: 'contact', name: 'Test technique', email: 'audit@example.test', message: 'Demande de test' };
function emailEnvironment(t) {
  const previous = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 'unit-test-placeholder';
  t.after(() => { if (previous === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = previous; });
}
test('invalid body shapes and cross-origin requests are rejected without sending', async () => {
  for (const input of [null, [], 12, 'text', {}]) assert.equal((await handler(request(input))).status, 400);
  assert.equal((await handler(request(contact, { origin: 'https://example.test' }))).status, 403);
  assert.equal((await handler(new Request('https://enkotech.be/.netlify/functions/contact'))).status, 405);
  assert.equal((await handler(request({ ...contact, message: 'x'.repeat(50001) }))).status, 413);
  assert.equal((await handler(request({ ...contact, website: 'bot' }))).status, 200);
});
test('pricing rejects invalid quantities and unknown plans/options', () => {
  const valid = { plan: 'site', billing: 'subscription', quantity: 0, options: [] };
  for (const input of [{ ...valid, quantity: 1.5 }, { ...valid, quantity: -1 }, { ...valid, quantity: 21 }, { ...valid, plan: 'other' }, { ...valid, options: ['other'] }, { ...valid, options: 'blog' }, { ...valid, billing: 'free' }]) assert.throws(() => calculateQuote(input));
  const subscription = calculateQuote({ ...valid, quantity: 2, options: ['blog', 'blog'] });
  assert.equal(subscription.setup, 400); assert.equal(subscription.monthly, 160); assert.equal(subscription.firstYear, 2320);
  const purchase = calculateQuote({ ...valid, billing: 'purchase', quantity: 2, options: ['blog'] });
  assert.equal(purchase.setup, 1550); assert.equal(purchase.monthly, 15); assert.equal(purchase.firstYear, 1730);
});
test('server recalculates prices, escapes content and keeps retry idempotency', async t => {
  emailEnvironment(t);
  const deliveries = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => { deliveries.push({ url, init, body: JSON.parse(init.body) }); return new Response('{}', { status: 200 }); });
  const payload = { ...contact, type: 'quote', name: '<b>Test</b>', requestId: 'same-test-request', quote: { plan: 'site', billing: 'subscription', quantity: 0, options: [], setup: 0, monthly: 0 } };
  for (let i = 0; i < 2; i++) {
    const response = await handler(request(payload)); const result = await response.json();
    assert.equal(response.status, 200); assert.equal(result.quote.setup, 250); assert.equal(result.quote.monthly, 125);
  }
  assert.equal(deliveries[0].init.headers['Idempotency-Key'], deliveries[1].init.headers['Idempotency-Key']);
  assert.match(deliveries[0].body.html, /&lt;b&gt;Test&lt;\/b&gt;/);
  assert.ok(deliveries[0].init.signal);
  assert.deepEqual(config.rateLimit.aggregateBy, ['ip', 'domain']);
});
test('native POST fallback returns an HTML receipt without a redirect containing personal data', async t => {
  emailEnvironment(t);
  t.mock.method(globalThis, 'fetch', async () => new Response('{}'));
  const fields = new URLSearchParams({ ...contact, type: 'quote', plan: 'landing', billing: 'purchase', quantity_landing: '1' });
  const response = await handler(new Request('https://enkotech.be/.netlify/functions/contact', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'text/html' }, body: fields }));
  assert.equal(response.status, 200); assert.match(response.headers.get('content-type'), /text\/html/);
  assert.equal(response.headers.get('location'), null); assert.equal(response.headers.get('cache-control'), 'no-store');
  const html = await response.text(); assert.match(html, /Landing page/); assert.match(html, /650/); assert.doesNotMatch(html, /audit@example/);
});
test('delivery failures return recoverable errors', async t => {
  emailEnvironment(t);
  t.mock.method(globalThis, 'fetch', async () => new Response('{}', { status: 503 }));
  assert.equal((await handler(request(contact))).status, 502);
  globalThis.fetch = async () => { throw new Error('timeout'); };
  assert.equal((await handler(request(contact))).status, 502);
});
