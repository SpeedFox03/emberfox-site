import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://SpeedFox03.github.io',
  base: '/emberfox-site', // le nom exact de ton repo
  integrations: [react()],
});