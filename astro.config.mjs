// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  site: 'https://www.elasnocongresso.com.br',
  trailingSlash: 'ignore',
  integrations: [sitemap(), react()],
  image: {
    // Parliamentary photo URLs may redirect; keep their browser-side fallback.
    domains: ['azmina.com.br'],
  },
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
      // O modal de alertas faz POST no browser, então esta precisa chegar ao
      // bundle do cliente — a de cima só existe no build.
      PUBLIC_API_BASE_URL: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://api.elasnocongresso.com.br/api/v1',
        url: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      proxy: {
        '/api/v1': {
          target: new URL(process.env.PUBLIC_API_BASE_URL || 'https://api.elasnocongresso.com.br/api/v1').origin,
          changeOrigin: true,
        },
      },
    },
  },
});
