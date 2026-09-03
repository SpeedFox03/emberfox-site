# Site Enkotech

Site vitrine Astro avec configurateur d'offres et formulaires envoyés par Resend via une fonction Netlify.

## Déploiement Netlify

La variable d'environnement obligatoire est :

```text
RESEND_API_KEY=re_xxxxxxxxx
```

Le domaine `enkotech.be` doit être vérifié dans Resend pour utiliser l'expéditeur par défaut `Enkotech <contact@enkotech.be>`. Les variables facultatives `CONTACT_TO_EMAIL` et `RESEND_FROM_EMAIL` permettent de remplacer le destinataire ou l'expéditeur.

Netlify détecte la configuration dans `netlify.toml`, construit le site dans `dist` et déploie la fonction située dans `netlify/functions`.

## Développement

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
