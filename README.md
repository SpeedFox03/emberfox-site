# Enkotech

Site statique Astro, déployé sur Netlify. Le configurateur et la fonction d’envoi partagent le barème dans `src/data/web-offers.mjs` : les montants transmis par le navigateur ne font jamais autorité.

## Développement et vérification

Node.js 24 est utilisé sur Netlify.

```sh
npm ci
npm run dev
npm run check
npm run build
npm test
npm audit
```

Les tests utilisent les pages de `dist` : construire le site avant `npm test`. Les emails sont simulés, sans envoi réel. Les tests de DOM vérifient le configurateur et le consentement ; ils ne remplacent pas une vérification visuelle dans un navigateur.

## Formulaires

Configurer `RESEND_API_KEY` sur Netlify. Le domaine `enkotech.be` doit être vérifié dans Resend. Les variables facultatives `CONTACT_TO_EMAIL` et `RESEND_FROM_EMAIL` remplacent le destinataire et l’expéditeur par défaut.

La fonction `netlify/functions/contact.mjs` accepte JSON et POST HTML natif. Elle contrôle la taille et le type du contenu, valide les coordonnées, recalcule les devis, échappe le HTML, applique un délai maximal et fournit une clé d’idempotence à Resend. L’antispam combine un honeypot et une règle Netlify de cinq requêtes par IP/domaine sur une minute. Vérifier l’application de cette règle dans le journal de déploiement Netlify.

## Offres et contenus

- Tarifs, options et calcul : `src/data/web-offers.mjs`.
- Conditions : résiliation à tout moment, propriété après un an d’abonnement, heures non reportées. Les modalités de remise et de transfert sont définies au devis.
- Une seule réalisation publiée : Moment D. Art, confirmée par le propriétaire. Aucune note client, statistique de satisfaction ou photo personnelle n’est inventée.
- Captures originales : `src/images/projects/moment-d-art/`. Astro génère les variantes WebP et les dimensions.
- Les anciennes pages des autres projets sont redirigées vers le portfolio.

## Confidentialité et mesure

`src/scripts/privacy.ts` conserve le choix pendant 180 jours. Les conteneurs `GTM-TVHL3SZ2` et `GTM-P32K4HZS` ne sont chargés qu’après un consentement à au moins une catégorie optionnelle. Audience et publicité ont des choix distincts, refusés par défaut. Le refus complet ne charge aucun conteneur.

Événements prévus dans le dataLayer : `configurator_click`, `configuration_change`, `plan_select`, `generate_lead`, `form_error`, `contact_click`. Ils ne contiennent ni nom, ni email, ni message. Les préférences du configurateur sont enregistrées séparément des coordonnées.

Avant publication des balises, contrôler dans les deux comptes GTM :

- Le rôle de chaque conteneur et l’absence de double page vue ou conversion.
- Les contrôles de consentement de chaque balise, notamment les balises HTML personnalisées. Le site transmet les choix Google ; une balise personnalisée doit aussi les respecter.
- Le déclenchement des événements dans Tag Assistant et leur réception dans l’outil de mesure.

La configuration des comptes Google, les durées effectives de conservation dans les boîtes email et les accès Search Console ne sont pas pilotés par ce dépôt. Les adapter aux traitements réellement utilisés. Les documents de confidentialité doivent rester cohérents avec les changements de services.

## Publication et contrôle final

Netlify construit `dist` et publie les fonctions. Après déploiement, vérifier une demande réelle autorisée, les règles de limitation, le sitemap, les aperçus de partage et les parcours sur mobile/clavier. Les URL canoniques et le sitemap utilisent les URL en minuscules normalisées par Netlify ; les routes Astro existantes sont conservées pour compatibilité.
