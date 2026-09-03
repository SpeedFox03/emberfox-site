const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: JSON_HEADERS,
});

const clean = (value, maxLength = 5000) => String(value ?? '').trim().slice(0, maxLength);

const escapeHtml = (value) => clean(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 200;

const money = (value) => new Intl.NumberFormat('fr-BE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
}).format(Number(value) || 0);

function buildQuoteContent(payload) {
  const quote = payload.quote && typeof payload.quote === 'object' ? payload.quote : {};
  const plan = clean(quote.plan, 100);
  const billing = clean(quote.billing, 50);
  const quantityLabel = clean(quote.quantityLabel, 100);
  const quantity = Math.max(0, Math.min(100, Number(quote.quantity) || 0));
  const setup = Math.max(0, Math.min(100000, Number(quote.setup) || 0));
  const monthly = Math.max(0, Math.min(100000, Number(quote.monthly) || 0));
  const options = Array.isArray(quote.options)
    ? quote.options.slice(0, 20).map((option) => clean(option, 100)).filter(Boolean)
    : [];

  const rows = [
    ['Formule', plan || 'Non précisée'],
    ['Paiement', billing || 'Non précisé'],
    [quantityLabel || 'Quantité supplémentaire', String(quantity)],
    ['Options', options.length ? options.join(', ') : 'Aucune'],
    ['Total au lancement', money(setup)],
    ['Total mensuel', money(monthly)],
  ];

  return {
    subjectPrefix: `Configuration web — ${plan || 'nouvelle demande'}`,
    html: `
      <h2 style="margin:24px 0 12px;color:#ff6b00">Configuration demandée</h2>
      <table style="width:100%;border-collapse:collapse">
        ${rows.map(([label, value]) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #eadfd3;color:#6b5547">${escapeHtml(label)}</td>
            <td style="padding:8px;border-bottom:1px solid #eadfd3;font-weight:600">${escapeHtml(value)}</td>
          </tr>
        `).join('')}
      </table>
    `,
    text: rows.map(([label, value]) => `${label} : ${value}`).join('\n'),
  };
}

export default async (request) => {
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 50000) return json({ error: 'La demande est trop volumineuse.' }, 413);

  let payload;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 50000) return json({ error: 'La demande est trop volumineuse.' }, 413);
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: 'Données de formulaire invalides.' }, 400);
  }

  // Honeypot antispam : une réponse neutre évite d'aider les robots à le contourner.
  if (clean(payload.website, 200)) return json({ ok: true });

  const type = payload.type === 'quote' ? 'quote' : 'contact';
  const name = clean(payload.name, 100);
  const email = clean(payload.email, 200).toLowerCase();
  const service = clean(payload.service, 100);
  const message = clean(payload.message, 5000);

  if (!name || !isEmail(email) || (type === 'contact' && !message)) {
    return json({ error: 'Merci de vérifier votre nom, votre email et votre message.' }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is missing.');
    return json({ error: 'Le service d’envoi est temporairement indisponible.' }, 503);
  }

  const to = process.env.CONTACT_TO_EMAIL || 'contact@enkotech.be';
  const from = process.env.RESEND_FROM_EMAIL || 'Enkotech <contact@enkotech.be>';
  const quoteContent = type === 'quote' ? buildQuoteContent(payload) : null;
  const subject = quoteContent?.subjectPrefix || `Contact — ${service || 'demande générale'}`;
  const safeMessage = escapeHtml(message || 'Aucun message ajouté.').replaceAll('\n', '<br>');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#24170f">
      <div style="padding:20px 24px;background:#100b06;color:#f5ede0;border-top:3px solid #ff6b00">
        <h1 style="font-size:22px;margin:0">Nouvelle demande Enkotech</h1>
      </div>
      <div style="padding:24px;border:1px solid #eadfd3;border-top:0">
        <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
        <p><strong>Email :</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        ${service ? `<p><strong>Service :</strong> ${escapeHtml(service)}</p>` : ''}
        ${quoteContent?.html || ''}
        <h2 style="margin:24px 0 8px;color:#ff6b00;font-size:18px">Message</h2>
        <p style="line-height:1.65">${safeMessage}</p>
      </div>
    </div>
  `;

  const text = [
    'Nouvelle demande Enkotech',
    `Nom : ${name}`,
    `Email : ${email}`,
    service ? `Service : ${service}` : '',
    quoteContent?.text || '',
    '',
    'Message :',
    message || 'Aucun message ajouté.',
  ].filter(Boolean).join('\n');

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Enkotech] ${subject} — ${name}`,
        html,
        text,
      }),
    });

    if (!resendResponse.ok) {
      const providerError = await resendResponse.text();
      console.error('Resend rejected the email:', resendResponse.status, providerError);
      return json({ error: 'L’envoi a échoué. Vous pouvez écrire à contact@enkotech.be.' }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error('Contact function failed:', error);
    return json({ error: 'L’envoi a échoué. Vous pouvez écrire à contact@enkotech.be.' }, 502);
  }
};

