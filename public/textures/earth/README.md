# Textures de la Terre (intro 3D)

Place ici les 3 fichiers suivants pour la planète de l'intro :

- `earth_day.jpg`   → texture couleur (jour) — **la plus importante**
- `earth_night.jpg` → lumières des villes (utilisée en emissive) — optionnel
- `earth_clouds.png` → nuages avec transparence (alpha) — optionnel

## Où les trouver (libres de droits)

Les classiques "Blue Marble" de la NASA Visible Earth :
https://visibleearth.nasa.gov/collection/1484/blue-marble

Ou les textures de Solar System Scope (CC BY 4.0) :
https://www.solarsystemscope.com/textures/

Recommandé : `2k` ou `4k` en `.jpg` (et le clouds en `.png` avec alpha).

## Frontière Belgique

Le contour 3D de la Belgique utilise le GeoJSON local
`src/components/intro3d/belgium-boundary.geojson`.

Source : geoBoundaries `BEL ADM0`, d'après Eurostat / Commission européenne,
licence CC BY 4.0.

## Important

L'intro **fonctionne sans ces fichiers** : si une texture est absente,
un fallback visuel bleu/vert propre est affiché automatiquement
(aucune erreur bloquante). Ajoute simplement les `.jpg/.png` ici et
recharge la page pour avoir la vraie Terre.

> Chemin servi par Astro : `/emberfox-site/textures/earth/earth_day.jpg`
> (le préfixe `/emberfox-site` vient de `base` dans `astro.config.mjs`).
