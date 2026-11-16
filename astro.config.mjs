import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://enkotech.be',
  integrations: [sitemap({
    filter: (page) => !/\/404(?:\.html|\/)?$/.test(page),
    serialize: (item) => ({ ...item, url: item.url.toLowerCase() }),
  })],
});
