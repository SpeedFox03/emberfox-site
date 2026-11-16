import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Window } from 'happy-dom';
import ts from 'typescript';
import { offers, calculateQuote } from '../src/data/web-offers.mjs';

function setup(t, url = 'https://enkotech.be/Sites-web') {
  const window = new Window({ url, settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true, enableJavaScriptEvaluation: false } });
  window.document.write(readFileSync('dist/Sites-web/index.html', 'utf8'));
  window.IntersectionObserver = class { observe() {} disconnect() {} };
  window.__pricing = { offers, calculateQuote };
  window.enkotechTrack = () => {};
  t.after(() => window.happyDOM.close());
  return window;
}
function run(window, path) {
  let source = readFileSync(path, 'utf8').replace(/^import .*;\s*$/gm, '').replace(/^export \{\};/gm, '');
  source = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
  window.eval(`(function(){${path.includes('configurator') ? 'const { offers, calculateQuote } = window.__pricing;' : ''}\n${source}\n})()`);
}
test('configurator switches billing, retains recurring option costs and restores shared selections', t => {
  const window = setup(t, 'https://enkotech.be/Sites-web?plan=site&billing=purchase&quantity=2&options=blog#configurateur');
  run(window, 'src/scripts/configurator.ts'); const document = window.document;
  assert.match(document.getElementById('summarySetup').textContent, /1.?550/);
  assert.match(document.getElementById('summaryMonthly').textContent, /15/);
  assert.match(document.getElementById('summaryYear').textContent, /1.?730/);
  assert.match(document.getElementById('summaryNote').textContent, /coût mensuel/);
  assert.ok(document.querySelector('.plan-options[data-options-for="landing"]').hidden);
  document.querySelector('[data-billing-mode="subscription"]').click();
  assert.match(document.getElementById('summarySetup').textContent, /400/);
  assert.match(document.getElementById('summaryMonthly').textContent, /160/);
  const draft = JSON.parse(window.localStorage.getItem('enkotech-configuration-v1'));
  assert.deepEqual(Object.keys(draft).sort(), ['billing', 'options', 'plan', 'quantity']);
  document.getElementById('resetQuote').click();
  assert.match(document.getElementById('summarySetup').textContent, /250/);
  assert.match(document.getElementById('summaryMonthly').textContent, /125/);
  assert.ok(!window.location.search);
  assert.equal(window.localStorage.getItem('enkotech-configuration-v1'), null);
});
test('malformed shared values fall back to a valid configuration', t => {
  const window = setup(t, 'https://enkotech.be/Sites-web?plan=invalid&billing=free&quantity=-2&options=unknown');
  run(window, 'src/scripts/configurator.ts');
  assert.match(window.document.getElementById('summarySetup').textContent, /250/);
});
test('submission sends option identifiers, displays server totals and prevents repeated sends', async t => {
  const window = setup(t); const sent = [];
  window.fetch = async (_url, init) => { sent.push(JSON.parse(init.body)); return new Response(JSON.stringify({ ok: true, quote: { setup: 250, monthly: 125, firstYear: 1750 } }), { headers: { 'Content-Type': 'application/json' } }); };
  run(window, 'src/scripts/configurator.ts');
  const form = window.document.getElementById('quoteForm');
  form.querySelector('[name="name"]').value = 'Test du formulaire';
  form.querySelector('[name="email"]').value = 'client@example.test';
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  await new Promise(setImmediate);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].quote.plan, 'site'); assert.equal(sent[0].quote.billing, 'subscription');
  assert.ok(!Object.hasOwn(sent[0].quote, 'monthly'));
  assert.match(window.document.getElementById('quoteFeedback').textContent, /Configuration envoyée/);
  form.dispatchEvent(new window.Event('submit', { cancelable: true })); await new Promise(setImmediate);
  assert.equal(sent.length, 1);
});
test('privacy blocks all Google loaders before consent and after refusal', t => {
  const window = setup(t); run(window, 'src/scripts/privacy.ts');
  const document = window.document;
  assert.equal(document.querySelectorAll('script[src*="googletagmanager"]').length, 0);
  assert.equal(document.getElementById('cookiePanel').hidden, false);
  document.querySelector('[data-consent="reject"]').click();
  assert.equal(document.querySelectorAll('script[src*="googletagmanager"]').length, 0);
  assert.equal(JSON.parse(window.localStorage.getItem('enkotech-consent-v1')).analytics, false);
  window.enkotechTrack('generate_lead', { source: 'test' });
  assert.ok(!window.dataLayer.some(item => item.event === 'generate_lead'));
});
test('granular Google consent loads each container once and keeps advertising denied', t => {
  const window = setup(t); run(window, 'src/scripts/privacy.ts'); const document = window.document;
  document.querySelector('[data-consent="customize"]').click();
  document.getElementById('consentAnalytics').checked = true;
  document.querySelector('[data-consent="save"]').click();
  assert.equal(document.querySelectorAll('script[src*="googletagmanager"]').length, 2);
  window.enkotechTrack('plan_select', { plan: 'site' });
  assert.ok(window.dataLayer.some(item => item.event === 'plan_select'));
  assert.ok(window.dataLayer.some(item => item[0] === 'consent' && item[1] === 'update' && item[2].analytics_storage === 'granted' && item[2].ad_storage === 'denied'));
  document.querySelector('[data-cookie-settings]').click(); document.querySelector('[data-consent="save"]').click();
  assert.equal(document.querySelectorAll('script[src*="googletagmanager"]').length, 2);
});
test('built pages have working internal targets, metadata and native POST forms', t => {
  const all = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? all(join(dir, entry.name)) : [join(dir, entry.name)]);
  const pages = all('dist').filter(file => file.endsWith('.html'));
  assert.ok(pages.length >= 14);
  for (const file of pages) {
    const window = new Window({ url: 'https://enkotech.be', settings: { disableJavaScriptFileLoading: true, disableCSSFileLoading: true } });
    t.after(() => window.happyDOM.close());
    window.document.write(readFileSync(file, 'utf8')); const document = window.document;
    assert.equal(document.querySelectorAll('h1').length, 1, file);
    assert.ok(document.querySelector('link[rel="canonical"]'), file);
    assert.ok(document.querySelector('meta[property="og:image"]'), file);
    assert.ok(document.querySelector('script[type="application/ld+json"]'), file);
    assert.equal(document.querySelectorAll('script[src*="googletagmanager"]').length, 0, file);
    for (const form of document.querySelectorAll('form')) { assert.equal(form.method, 'post'); assert.ok(form.getAttribute('action')); }
    for (const img of document.querySelectorAll('img')) { assert.ok(img.hasAttribute('alt')); assert.ok(img.hasAttribute('width')); assert.ok(img.hasAttribute('height')); }
    for (const link of document.querySelectorAll('a[href^="/"]')) {
      const url = new URL(link.href); const path = decodeURIComponent(url.pathname);
      if (path.startsWith('/.netlify/')) continue;
      const target = join('dist', path, path.endsWith('.html') ? '' : 'index.html');
      assert.ok(existsSync(target), `${file}: broken link ${path}`);
      if (url.hash && path !== '/') {
        const targetHtml = readFileSync(target, 'utf8');
        assert.ok(targetHtml.includes(`id="${url.hash.slice(1)}"`), `${file}: broken fragment ${url.hash}`);
      }
    }
  }
  const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
  assert.ok(!sitemap.includes('404')); assert.ok(!sitemap.includes('event-flow')); assert.ok(sitemap.includes('moment-d-art'));
});
