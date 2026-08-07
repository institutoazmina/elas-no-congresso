// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://www.elasnocongresso.com.br',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  env: {
    schema: {
      // Site é estático: a API só é chamada no build, então a variável é de
      // servidor (não vai para o bundle do browser). Sem barra no fim.
      API_BASE_URL: envField.string({
        context: 'server',
        access: 'public',
        default: 'https://api.elasnocongresso.com.br/api/v1',
        url: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    css: { preprocessorOptions: { less: {} } },
  },
});
