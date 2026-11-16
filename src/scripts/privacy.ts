export {};
type Consent = { analytics: boolean; marketing: boolean; expires: number };
const key = 'enkotech-consent-v1';
const panel = document.getElementById('cookiePanel');
const analytics = document.getElementById('consentAnalytics') as HTMLInputElement;
const marketing = document.getElementById('consentMarketing') as HTMLInputElement;
let choice: Consent = { analytics: false, marketing: false, expires: 0 };
try {
  const stored = JSON.parse(localStorage.getItem(key) || 'null');
  if (stored && stored.expires > Date.now() && typeof stored.analytics === 'boolean' && typeof stored.marketing === 'boolean') choice = stored;
} catch { /* Storage may be unavailable; keep optional services disabled. */ }
let loaded = false;
window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };
const consentValues = () => ({ analytics_storage: choice.analytics ? 'granted' : 'denied', ad_storage: choice.marketing ? 'granted' : 'denied', ad_user_data: choice.marketing ? 'granted' : 'denied', ad_personalization: choice.marketing ? 'granted' : 'denied' });
window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
function enableServices() {
  window.gtag('consent', 'update', consentValues());
  if (loaded || (!choice.analytics && !choice.marketing)) return;
  loaded = true;
  window.gtag('js', new Date());
  for (const id of ['GTM-TVHL3SZ2', 'GTM-P32K4HZS']) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    document.head.append(script);
  }
}
window.enkotechTrack = (event, parameters = {}) => {
  if (choice.analytics) window.dataLayer.push({ event, ...parameters });
};
function openPreferences() {
  analytics.checked = choice.analytics;
  marketing.checked = choice.marketing;
  if (panel) panel.hidden = false;
}
function save(next: Pick<Consent, 'analytics' | 'marketing'>) {
  const revoking = loaded && ((choice.analytics && !next.analytics) || (choice.marketing && !next.marketing));
  choice = { ...next, expires: Date.now() + 180 * 24 * 60 * 60 * 1000 };
  try { localStorage.setItem(key, JSON.stringify(choice)); } catch { /* Consent lasts for this page only. */ }
  window.gtag('consent', 'update', consentValues());
  if (!choice.analytics || !choice.marketing) {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      const removeAnalytics = !choice.analytics && /^(_ga|_gid|_gat)/.test(name);
      const removeMarketing = !choice.marketing && /^(_gcl_|_gac_)/.test(name);
      if (removeAnalytics || removeMarketing) {
        const domains = new Set(['', location.hostname, `.${location.hostname}`, ...(location.hostname.endsWith('.enkotech.be') ? ['enkotech.be', '.enkotech.be'] : [])]);
        for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
      }
    }
  }
  if (panel) panel.hidden = true;
  if (revoking) location.reload();
  else enableServices();
}
document.querySelectorAll<HTMLButtonElement>('[data-consent]').forEach(button => button.addEventListener('click', () => {
  switch (button.dataset.consent) {
    case 'accept': save({ analytics: true, marketing: true }); break;
    case 'reject': save({ analytics: false, marketing: false }); break;
    case 'save': save({ analytics: analytics.checked, marketing: marketing.checked }); break;
    case 'customize':
      document.getElementById('cookieOptions')?.removeAttribute('hidden');
      panel?.querySelector('[data-consent="save"]')?.removeAttribute('hidden');
      button.hidden = true;
      analytics.focus();
  }
}));
document.querySelectorAll('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => { openPreferences(); panel?.querySelector<HTMLButtonElement>('button')?.focus(); }));
if (!choice.expires) openPreferences();
else enableServices();
document.addEventListener('click', event => {
  const link = (event.target as Element).closest<HTMLAnchorElement>('a');
  if (!link) return;
  if (link.getAttribute('href')?.includes('#configurateur')) window.enkotechTrack('configurator_click', { source: link.closest('nav') ? 'navigation' : 'page' });
  if (link.protocol === 'tel:') window.enkotechTrack('contact_click', { channel: 'phone' });
  if (link.protocol === 'mailto:') window.enkotechTrack('contact_click', { channel: 'email' });
});
