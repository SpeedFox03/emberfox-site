export const offers = [
  {
    id: 'landing', title: 'Landing page', kicker: 'Pour lancer une offre',
    launch: 150, monthly: 75, purchase: 600,
    features: ['Une page sur mesure', 'Hébergement & maintenance', 'SEO essentiel', 'Formulaire de contact', '1 h de modifications / mois', 'Refonte offerte après 5 ans'],
    quantity: { label: 'Sections supplémentaires', unit: 'section', monthly: 5, purchase: 50, max: 8 },
    options: [
      { id: 'seo-local', label: 'SEO local renforcé', desc: 'Structure, mots-clés et fiche locale', setup: 250, monthly: 0 },
      { id: 'copywriting', label: 'Rédaction des contenus', desc: 'Textes de vente optimisés pour convertir', setup: 120, monthly: 0 },
      { id: 'booking', label: 'Prise de rendez-vous', desc: 'Agenda et confirmation automatisée', setup: 100, monthly: 10 },
      { id: 'multilingual', label: 'Version bilingue', desc: 'Une langue supplémentaire', setup: 150, monthly: 15 },
    ],
  },
  {
    id: 'site', title: 'Site 4 pages', kicker: 'Pour présenter votre activité',
    launch: 250, monthly: 125, purchase: 1200, highlight: true,
    features: ['4 pages sur mesure', 'Hébergement, sécurité & sauvegardes', 'SEO essentiel', 'Formulaire & statistiques', '2 h de modifications / mois', 'Refonte offerte après 5 ans'],
    quantity: { label: 'Pages supplémentaires', unit: 'page', monthly: 10, purchase: 100, max: 20 },
    options: [
      { id: 'seo-complet', label: 'SEO approfondi', desc: 'Audit, recherche de mots-clés et optimisation', setup: 250, monthly: 0 },
      { id: 'blog', label: 'Blog administrable', desc: 'Publiez vos actualités en autonomie', setup: 150, monthly: 15 },
      { id: 'booking', label: 'Réservation en ligne', desc: 'Agenda, créneaux et confirmations', setup: 120, monthly: 10 },
      { id: 'multilingual', label: 'Version bilingue', desc: 'Une langue supplémentaire', setup: 250, monthly: 20 },
      { id: 'newsletter', label: 'Newsletter', desc: 'Inscription et outil d’envoi connecté', setup: 100, monthly: 10 },
    ],
  },
  {
    id: 'ecommerce', title: 'E-commerce', kicker: 'Pour vendre en ligne',
    launch: 500, monthly: 195, purchase: 2400,
    features: ['Boutique jusqu’à 20 produits', 'Paiement sécurisé', 'Commandes & stock', 'Hébergement & maintenance', '3 h de modifications / mois', 'Refonte offerte après 5 ans'],
    quantity: { label: 'Packs de 10 produits en plus', unit: 'pack', monthly: 12, purchase: 120, max: 20 },
    options: [
      { id: 'seo-shop', label: 'SEO e-commerce avancé', desc: 'Catégories, produits et données structurées', setup: 350, monthly: 0 },
      { id: 'catalog', label: 'Import du catalogue', desc: 'Reprise et nettoyage de vos produits', setup: 250, monthly: 0 },
      { id: 'shipping', label: 'Transporteurs connectés', desc: 'Tarifs, étiquettes et suivi automatisés', setup: 200, monthly: 15 },
      { id: 'multilingual', label: 'Boutique bilingue', desc: 'Une langue supplémentaire', setup: 300, monthly: 25 },
      { id: 'recovery', label: 'Relance des paniers abandonnés', desc: 'Scénario email automatisé', setup: 120, monthly: 15 },
    ],
  },
];

export function calculateQuote(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Configuration invalide.');
  const offer = offers.find(item => item.id === input.plan);
  if (!offer || !['subscription', 'purchase'].includes(input.billing)) throw new Error('Choisissez une formule et un mode de paiement valides.');
  const quantity = Number(input.quantity ?? 0);
  if (!Number.isInteger(quantity) || quantity < 0 || quantity > offer.quantity.max) throw new Error('La quantité demandée est invalide.');
  if (!Array.isArray(input.options) || input.options.some(id => typeof id !== 'string' || !offer.options.some(option => option.id === id))) throw new Error('Une option demandée est invalide.');
  const optionIds = [...new Set(input.options)];
  const options = offer.options.filter(option => optionIds.includes(option.id));
  const subscription = input.billing === 'subscription';
  const setup = (subscription ? offer.launch : offer.purchase) + (subscription ? 0 : quantity * offer.quantity.purchase) + options.reduce((sum, option) => sum + option.setup, 0);
  const monthly = (subscription ? offer.monthly + quantity * offer.quantity.monthly : 0) + options.reduce((sum, option) => sum + option.monthly, 0);
  return { plan: offer.id, title: offer.title, billing: input.billing, quantity, quantityLabel: offer.quantity.label, options: optionIds, optionLabels: options.map(option => option.label), setup, monthly, firstYear: setup + monthly * 12 };
}
