# Intro 3D archivée

Cette archive contient l'ancienne intro 3D de la page d'accueil, retirée du site actif le 21 août 2026.

## Contenu

- `src/components/intro3d/` : composants React et styles de l'intro
- `src/utils/geo.js` : utilitaire de géolocalisation 3D
- `public/textures/earth/` : textures de la Terre

## Réactivation

1. Remettre les dossiers et le fichier ci-dessus à leur emplacement d'origine.
2. Réinstaller les dépendances :

   ```sh
   npm install @astrojs/react@^5.0.7 @react-three/drei@^10.7.7 @react-three/fiber@^9.6.1 gsap@^3.15.0 lenis@^1.3.23 react@^19.2.7 react-dom@^19.2.7 three@^0.184.0
   ```

3. Réactiver React dans `astro.config.mjs` :

   ```js
   import react from '@astrojs/react';

   export default defineConfig({
     // configuration existante…
     integrations: [react()],
   });
   ```

4. Dans `src/pages/index.astro`, importer puis monter l'intro sous `<BaseLayout>` :

   ```astro
   import Intro3D from '../components/intro3d/Intro3D.jsx';

   <Intro3D client:only="react" />
   ```
