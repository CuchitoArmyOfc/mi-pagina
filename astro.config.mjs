// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.cuchitoarmyoficial.com',
  trailingSlash: 'never',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
  },
  image: {
    // Sharp is used to generate optimized AVIF/WebP variants at build time.
    domains: [],
  },
});
