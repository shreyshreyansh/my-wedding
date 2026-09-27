// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  compressHTML: true,
  prefetch: false,
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
  vite: { build: { target: 'es2020' } },
});
