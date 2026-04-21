// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://www.elasnocongresso.com.br',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()],
    css: { preprocessorOptions: { less: {} } },
  },
});
