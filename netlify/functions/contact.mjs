import { createHash } from 'node:crypto';
import { calculateQuote } from '../../src/data/web-offers.mjs';

export const config = {
  path: '/.netlify/functions/contact',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
const LIMIT = 50000;
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' };
const escapeHtml = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const euro = n => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
function quoteRows(quote) {
  return [['Formule', quote.title], ['Paiement', quote.billing === 'subscription' ? 'Abonnement' : 'Achat unique'], [quote.quantityLabel, String(quote.quantity)], ['Options', quote.optionLabels.join(', ') || 'Aucune'], ['Au lancement', euro(quote.setup)], ['Chaque mois', euro(quote.monthly)], ['Première année', euro(quote.firstYear)]];
}
const table = rows => `<table style="width:100%;border-collapse:collapse">${rows.map(([label, value]) => `<tr><th style="text-align:left;padding:10px;border-bottom:1px solid #543722">${escapeHtml(label)}</th><td style="padding:10px;border-bottom:1px solid #543722">${escapeHtml(value)}</td></tr>`).join('')}</table>`;
async function readBody(request) {
  if (Number(request.headers.get('content-length')) > LIMIT) throw Object.assign(new Error('La demande est trop volumineuse.'), { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks = []; let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > LIMIT) { await reader.cancel(); throw Object.assign(new Error('La demande est trop volumineuse.'), { status: 413 }); }
    chunks.push(value);
  }
  const data = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(data);
}
export default async function handler(request) {
  const wantsJson = request.headers.get('accept')?.includes('application/json') || request.headers.get('content-type')?.includes('application/json');
  function respond(body, status = 200) {
    if (wantsJson) return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8', ...(status === 405 ? { Allow: 'POST' } : {}) } });
    const ok = status < 400;
    const title = ok ? 'Votre demande a été envoyée.' : 'Votre demande n’a pas pu être envoyée.';
    const content = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>${title} | Enkotech</title><style>body{background:#15110d;color:#f5ede0;font:18px/1.7 system-ui;margin:0;padding:clamp(20px,5vw,70px)}main{max-width:760px;margin:auto;border-top:3px solid #ff6b00;padding-top:25px}a{color:#ffb830}h1{line-height:1.2}table{font-size:16px}th{text-align:left}td,th{vertical-align:top}</style></head><body><main><p>ENKOTECH</p><h1>${title}</h1><p>${escapeHtml(body.error || 'Je vous recontacte sous 24 h ouvrables. Cet envoi ne constitue pas une commande.')}</p>${body.quote ? table(quoteRows(body.quote)) + '<p>Estimation indicative. TVA non applicable, régime de la franchise de taxe. Le devis confirme le périmètre et les modalités.</p>' : ''}<p><a href="/Sites-web#configurateur">Retour au configurateur</a> · <a href="/Contact">Contact</a></p><p>Besoin d’aide ? <a href="mailto:contact@enkotech.be">contact@enkotech.be</a></p></main></body></html>`;
    return new Response(content, { status, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', ...(status === 405 ? { Allow: 'POST' } : {}) } });
  }
  if (request.method !== 'POST') return respond({ error: 'Méthode non autorisée.' }, 405);
  const origin = request.headers.get('origin');
  const allowed = new Set([new URL(request.url).origin, 'https://enkotech.be', 'https://www.enkotech.be']);
  if (origin && !allowed.has(origin)) return respond({ error: 'Origine de la demande non autorisée.' }, 403);
  let payload;
  try {
    const raw = await readBody(request);
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) payload = JSON.parse(raw);
    else if (contentType.includes('application/x-www-form-urlencoded')) {
      const fields = new URLSearchParams(raw);
      payload = Object.fromEntries(fields);
      if (payload.type === 'quote') payload.quote = { plan: payload.plan, billing: payload.billing, quantity: fields.get(`quantity_${payload.plan}`) || 0, options: fields.getAll(`options_${payload.plan}`) };
    } else return respond({ error: 'Format de formulaire non pris en charge.' }, 415);
  } catch (error) { return respond({ error: error.status === 413 ? error.message : 'Données de formulaire invalides.' }, error.status === 413 ? 413 : 400); }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return respond({ error: 'Données de formulaire invalides.' }, 400);
  if (typeof payload.website === 'string' && payload.website.trim()) return respond({ ok: true });
  const type = payload.type || 'contact';
  if (!['contact', 'quote'].includes(type)) return respond({ error: 'Type de demande invalide.' }, 400);
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  const service = typeof payload.service === 'string' ? payload.service.trim().slice(0, 100) : '';
  if (!name || name.length > 100 || /[\r\n]/.test(name) || email.length > 200 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || message.length > 5000 || (type === 'contact' && !message)) return respond({ error: 'Merci de vérifier votre nom, votre email et votre message.' }, 400);
  let quote = null;
  if (type === 'quote') {
    try { quote = calculateQuote(payload.quote); } catch (error) { return respond({ error: error.message }, 400); }
  }
  if (!process.env.RESEND_API_KEY) return respond({ error: 'Le service d’envoi est temporairement indisponible. écrivez à contact@enkotech.be.' }, 503);
  const subject = `[Enkotech] ${quote ? `Configuration web — ${quote.title}` : `Contact — ${service || 'demande générale'}`} — ${name}`.replace(/[\r\n]/g, ' ');
  const rows = quote ? quoteRows(quote) : [];
  const html = `<div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;color:#24170f"><h1>Nouvelle demande Enkotech</h1><p><strong>Nom :</strong> ${escapeHtml(name)}</p><p><strong>Email :</strong> ${escapeHtml(email)}</p>${service ? `<p>Service : ${escapeHtml(service)}</p>` : ''}${quote ? table(rows) : ''}<h2>Message</h2><p>${escapeHtml(message || 'Aucun message ajouté.').replaceAll('\n', '<br>')}</p><p>Estimation recalculée côté serveur. Le devis confirme les modalités.</p></div>`;
  const text = [`Nom : ${name}`, `Email : ${email}`, `Service : ${service}`, ...rows.map(([label, value]) => `${label} : ${value}`), `Message : ${message}`].join('\n');
  const requestId = typeof payload.requestId === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(payload.requestId) ? payload.requestId : '';
  const fingerprint = createHash('sha256').update(JSON.stringify({ requestId, name, email, message, service, quote })).digest('hex');
  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `enkotech-${fingerprint}` },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || 'Enkotech <contact@enkotech.be>', to: [process.env.CONTACT_TO_EMAIL || 'contact@enkotech.be'], reply_to: email, subject, html, text }),
    });
    if (!result.ok) { console.error('Contact email delivery failed:', result.status); return respond({ error: 'L’envoi a échoué. Réessayez ou écrivez à contact@enkotech.be.' }, 502); }
    return respond({ ok: true, ...(quote ? { quote } : {}) });
  } catch { return respond({ error: 'Le service d’envoi ne répond pas. Réessayez ou écrivez à contact@enkotech.be.' }, 502); }
}
