// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.cuchitoarmyoficial.com',
  trailingSlash: 'never',
  compressHTML: true,
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    // Sharp is used to generate optimized AVIF/WebP variants at build time.
    domains: [],
  },
});
