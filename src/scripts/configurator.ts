import { offers, calculateQuote } from '../data/web-offers.mjs';
const form = document.getElementById('quoteForm') as HTMLFormElement | null;
if (form) {
  const storageKey = 'enkotech-configuration-v1';
  const euro = (n: number) => new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const value = (name: string) => form.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value || '';
  const feedback = document.getElementById('quoteFeedback')!;
  const submit = form.querySelector<HTMLButtonElement>('.quote-submit')!;
  let requestId = crypto.randomUUID();
  let submitted = false;
  const text = (id: string, content: string) => { const el = document.getElementById(id); if (el) el.textContent = content; };
  function selection() {
    const plan = value('plan');
    const quantityInput = form!.querySelector<HTMLInputElement>(`input[name="quantity_${plan}"]`)!;
    const quantity = Math.min(Number(quantityInput.max), Math.max(0, Math.floor(Number(quantityInput.value) || 0)));
    quantityInput.value = String(quantity);
    return { plan, billing: value('billing'), quantity, options: Array.from(form!.querySelectorAll<HTMLInputElement>(`input[name="options_${plan}"]:checked`), input => input.value) };
  }
  function restore(input: unknown) {
    try {
      const quote = calculateQuote(input);
      form!.querySelector<HTMLInputElement>(`input[name="plan"][value="${quote.plan}"]`)!.checked = true;
      form!.querySelector<HTMLInputElement>(`input[name="billing"][value="${quote.billing}"]`)!.checked = true;
      form!.querySelector<HTMLInputElement>(`input[name="quantity_${quote.plan}"]`)!.value = String(quote.quantity);
      form!.querySelectorAll<HTMLInputElement>(`input[name="options_${quote.plan}"]`).forEach(input => { input.checked = quote.options.includes(input.value); });
    } catch { /* Ignore stale or invalid stored/shared configurations. */ }
  }
  const params = new URLSearchParams(location.search);
  if (params.has('plan')) restore({ plan: params.get('plan'), billing: params.get('billing'), quantity: params.get('quantity') || 0, options: params.get('options')?.split(',').filter(Boolean) || [] });
  else try { restore(JSON.parse(localStorage.getItem(storageKey) || 'null')); } catch { /* Optional storage. */ }
  function render() {
    const input = selection();
    const quote = calculateQuote(input);
    form!.querySelectorAll<HTMLElement>('.plan-options').forEach(panel => {
      const active = panel.dataset.optionsFor === quote.plan;
      panel.hidden = !active;
      panel.querySelectorAll<HTMLInputElement>('input').forEach(input => { input.disabled = !active; });
    });
    const offer = offers.find(item => item.id === quote.plan)!;
    text('summaryPlan', quote.title);
    text('summarySetup', euro(quote.setup));
    text('summaryMonthly', euro(quote.monthly));
    text('summaryYear', euro(quote.firstYear));
    text('mobileQuotePrice', `${euro(quote.setup)}${quote.monthly ? ` + ${euro(quote.monthly)}/mois` : ''}`);
    document.getElementById('monthlySummary')!.hidden = quote.monthly === 0;
    text('summaryNote', quote.billing === 'subscription'
      ? 'Résiliable à tout moment. Le site vous appartient après un an d’abonnement. Heures de modifications non reportées.'
      : `Conception et livraison du site. Hébergement et maintenance à préciser dans le devis.${quote.monthly ? ' Les options sélectionnées comportent un coût mensuel.' : ''}`);
    const list = document.getElementById('summaryLines')!;
    list.replaceChildren();
    const lines = [
      [quote.billing === 'subscription' ? 'Lancement' : 'Achat du site', euro(quote.billing === 'subscription' ? offer.launch : offer.purchase)],
      ...(quote.quantity ? [[`${offer.quantity.label} × ${quote.quantity}`, `${euro(quote.quantity * (quote.billing === 'subscription' ? offer.quantity.monthly : offer.quantity.purchase))}${quote.billing === 'subscription' ? '/mois' : ''}`]] : []),
      ...offer.options.filter(option => quote.options.includes(option.id)).map(option => [option.label, [option.setup ? euro(option.setup) : '', option.monthly ? `${euro(option.monthly)}/mois` : ''].filter(Boolean).join(' + ')]),
    ];
    for (const [label, price] of lines) {
      const li = document.createElement('li');
      for (const content of [label, price]) { const span = document.createElement('span'); span.textContent = content; li.append(span); }
      list.append(li);
    }
    form!.querySelectorAll<HTMLElement>('.quantity-price').forEach(el => { el.textContent = quote.billing === 'subscription' ? `+${euro(Number(el.dataset.monthly))}/mois par unité` : `+${euro(Number(el.dataset.purchase))} par unité`; });
    document.querySelectorAll<HTMLElement>('[data-offer]').forEach(card => {
      const data = offers.find(item => item.id === card.dataset.offer)!;
      const subscription = quote.billing === 'subscription';
      card.querySelector('[data-card-price]')!.textContent = euro(subscription ? data.monthly : data.purchase);
      card.querySelector('[data-card-period]')!.textContent = subscription ? '/ mois' : 'à la création';
      card.querySelector('[data-card-launch]')!.textContent = subscription ? `${euro(data.launch)} au lancement` : 'Conception et livraison du site';
      card.querySelector('[data-card-alternative]')!.textContent = subscription ? `${euro(data.launch + data.monthly * 12)} la première année` : 'Hébergement et suivi définis dans le devis';
      const purchaseFeatures = [data.features[0], 'Présentation adaptée au mobile', 'SEO essentiel', 'Formulaire de contact', 'Livraison du site', 'Options et services tiers précisés au devis'];
      card.querySelectorAll<HTMLElement>('[data-card-feature]').forEach((el, index) => { el.textContent = (subscription ? data.features : purchaseFeatures)[index]; });
    });
    document.querySelectorAll<HTMLButtonElement>('[data-billing-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.billingMode === quote.billing)));
    form!.querySelectorAll<HTMLElement>('[data-plan-price]').forEach(el => { const item = offers.find(o => o.id === el.dataset.planPrice)!; el.textContent = quote.billing === 'subscription' ? `${euro(item.monthly)}/mois` : `${euro(item.purchase)} à la création`; });
    try { localStorage.setItem(storageKey, JSON.stringify(input)); } catch { /* Configuration remains usable without storage. */ }
  }
  function update() {
    submitted = false;
    submit.disabled = false;
    requestId = crypto.randomUUID();
    feedback.classList.remove('visible', 'success', 'error');
    render();
  }
  form.addEventListener('change', event => {
    update();
    const name = (event.target as HTMLInputElement).name;
    if (name === 'plan' || name === 'billing') window.enkotechTrack?.('configuration_change', { field: name, value: value(name) });
  });
  form.addEventListener('input', event => {
    submitted = false;
    submit.disabled = false;
    requestId = crypto.randomUUID();
    feedback.classList.remove('visible', 'success', 'error');
    if ((event.target as Element).classList.contains('quantity-input')) render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-billing-mode]').forEach(button => button.addEventListener('click', () => {
    form.querySelector<HTMLInputElement>(`input[name="billing"][value="${button.dataset.billingMode}"]`)!.checked = true;
    update();
    window.enkotechTrack?.('configuration_change', { field: 'billing', value: value('billing') });
  }));
  document.querySelectorAll<HTMLAnchorElement>('.select-offer').forEach(link => link.addEventListener('click', () => {
    form.querySelector<HTMLInputElement>(`input[name="plan"][value="${link.dataset.plan}"]`)!.checked = true;
    update();
    window.enkotechTrack?.('plan_select', { plan: value('plan'), billing: value('billing') });
  }));
  form.querySelectorAll<HTMLButtonElement>('.stepper-btn').forEach(button => button.addEventListener('click', () => {
    const input = button.closest('.stepper')!.querySelector<HTMLInputElement>('input')!;
    input.value = String(Math.max(0, Math.min(Number(input.max), Number(input.value) + Number(button.dataset.step))));
    update();
  }));
  const sharedUrl = () => {
    const input = selection();
    const url = new URL('/Sites-web', location.origin);
    for (const [key, value] of Object.entries(input)) url.searchParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
    url.hash = 'configurateur';
    return url.href;
  };
  document.getElementById('shareQuote')?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(sharedUrl()); text('shareFeedback', 'Lien copié. Il ne contient aucune coordonnée personnelle.'); }
    catch { const input = document.getElementById('shareLink') as HTMLInputElement; input.value = sharedUrl(); input.hidden = false; input.focus(); input.select(); text('shareFeedback', 'Copiez ce lien pour retrouver la configuration.'); }
  });
  document.getElementById('downloadQuote')?.addEventListener('click', () => {
    const quote = calculateQuote(selection());
    const content = `ENKOTECH — Estimation indicative\n${quote.title} — ${quote.billing === 'subscription' ? 'Abonnement' : 'Achat unique'}\n${quote.quantityLabel} : ${quote.quantity}\nOptions : ${quote.optionLabels.join(', ') || 'Aucune'}\nAu lancement : ${euro(quote.setup)}\nMensuel : ${euro(quote.monthly)}\nPremière année : ${euro(quote.firstYear)}\nTVA non applicable, régime de la franchise de taxe.\n${document.getElementById('summaryNote')!.textContent}\nEstimation gratuite et sans engagement ; le devis confirme le périmètre.\n${sharedUrl()}`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'estimation-enkotech.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById('resetQuote')?.addEventListener('click', () => {
    form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(input => { input.checked = false; });
    form.querySelectorAll<HTMLInputElement>('.quantity-input').forEach(input => { input.value = '0'; });
    restore({ plan: 'site', billing: 'subscription', quantity: 0, options: [] });
    history.replaceState(null, '', `${location.pathname}#configurateur`);
    document.getElementById('shareLink')!.hidden = true;
    text('shareFeedback', 'Configuration réinitialisée.'); update();
    try { localStorage.removeItem(storageKey); } catch { /* Optional storage. */ }
  });
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || submitted || !form.reportValidity()) return;
    sending = true; submit.disabled = true;
    const original = submit.innerHTML; submit.textContent = 'Envoi en cours…';
    feedback.classList.remove('visible', 'success', 'error');
    const quote = selection();
    const fields = new FormData(form);
    try {
      const response = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: AbortSignal.timeout(20000), body: JSON.stringify({ type: 'quote', requestId, name: fields.get('name'), email: fields.get('email'), message: fields.get('message'), website: fields.get('website'), quote }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || (response.status === 429 ? 'Trop de demandes rapprochées. Réessayez dans un instant.' : 'Envoi impossible. Réessayez ou écrivez à contact@enkotech.be.'));
      if (result.quote) {
        text('summarySetup', euro(result.quote.setup)); text('summaryMonthly', euro(result.quote.monthly)); text('summaryYear', euro(result.quote.firstYear));
      }
      feedback.textContent = 'Configuration envoyée. Votre récapitulatif reste disponible ci-dessus. Je vous recontacte sous 24 h ouvrables pour préparer le devis.';
      feedback.classList.add('visible', 'success'); submitted = true;
      window.enkotechTrack?.('generate_lead', { source: 'configurator', plan: quote.plan, billing: quote.billing });
    } catch (error) {
      feedback.textContent = error instanceof Error && error.name !== 'TimeoutError' ? error.message : 'Le délai d’envoi est dépassé. Réessayez ou écrivez à contact@enkotech.be.';
      feedback.classList.add('visible', 'error');
      window.enkotechTrack?.('form_error', { source: 'configurator' });
    } finally { sending = false; submit.disabled = submitted; submit.innerHTML = original; }
  });
  const dock = document.getElementById('mobileQuote')!;
  let inConfigurator = false, summaryVisible = false;
  const refreshDock = () => { dock.hidden = !inConfigurator || summaryVisible; };
  const observer = new IntersectionObserver(entries => { for (const entry of entries) { if (entry.target.id === 'configurateur') inConfigurator = entry.isIntersecting; else summaryVisible = entry.isIntersecting; } refreshDock(); });
  observer.observe(document.getElementById('configurateur')!); observer.observe(document.getElementById('estimation')!);
  render();
}
