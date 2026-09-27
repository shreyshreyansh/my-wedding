// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // The address guests see (e.g. https://shreyansh-mrunalini.in). Link previews need absolute URLs.
  site: process.env.SITE_URL || 'https://shreyansh-mrunalini.pages.dev',
  output: 'static',
  compressHTML: true,
  prefetch: false,
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
  vite: { build: { target: 'es2020' } },
});
