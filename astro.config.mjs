// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // The address guests see. Link previews need absolute URLs.
  site: process.env.SITE_URL || 'https://ranchiwedspune.in',
  output: 'static',
  compressHTML: true,
  prefetch: false,
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
  vite: { build: { target: 'es2020' } },
});
