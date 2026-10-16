# Google Search Console: sitemap

O site é servido em `https://www.elasnocongresso.com.br`. O domínio sem `www`
redireciona (301) tudo para o `www`. O Astro gera **`/sitemap-index.xml`**, que
aponta para `/sitemap-0.xml`. **Não existe `/sitemap.xml`** (dá 404).

## 1. Usar a propriedade certa

O sitemap só é aceito numa propriedade que cubra `https://www.elasnocongresso.com.br/`.
Uma propriedade de "prefixo de URL" `https://elasnocongresso.com.br/` (sem `www`)
**rejeita** o sitemap, porque todas as URLs dele estão em outro host.

1. Abra o [Search Console](https://search.google.com/search-console) e clique no
   seletor de propriedades (canto superior esquerdo).
2. Se já existir uma propriedade **Domínio** `elasnocongresso.com.br` (ícone de
   globo, sem `https://`), use essa. Ela cobre `www`, sem `www`, `http` e `https`.
   O DNS já tem registros TXT `google-site-verification`, então ela provavelmente
   já está verificada.
3. Se não existir: **Adicionar propriedade → Domínio** → digite
   `elasnocongresso.com.br` → copie o registro TXT e confira se ele já está no
   DNS (Cloudflare). Se não estiver, adicione e clique em **Verificar**.
   - Alternativa: **Prefixo do URL** com `https://www.elasnocongresso.com.br/`
     (com `www` e barra no fim).

## 2. Enviar o sitemap correto

Na propriedade do passo 1:

1. Menu lateral → **Indexação → Sitemaps**.
2. Em "Sitemaps enviados", se houver `sitemap.xml`, ou qualquer sitemap enviado
   na propriedade sem `www`, clique nele → menu **⋮** → **Remover sitemap**.
3. Em "Adicionar um novo sitemap", digite `sitemap-index.xml` e clique em
   **Enviar**. Numa propriedade Domínio, digite a URL completa:
   `https://www.elasnocongresso.com.br/sitemap-index.xml`.
4. O status esperado é **Sucesso**, com `sitemap-0.xml` listado dentro do índice.

> Se aparecer **"Não foi possível buscar"** logo depois do envio, normalmente é
> só atraso no processamento do Search Console. Aguarde de 1 a 3 dias antes de
> concluir que há erro. Para confirmar que o Google consegue acessar o arquivo,
> cole a URL do sitemap na barra **Inspeção de URL** → **Testar URL publicado**.

## 3. Depois do deploy com o sitemap filtrado

O sitemap deixou de listar as páginas que só redirecionam (`/perfil/*`,
`/proposta/*`, `/propostas-e-votacoes/*`, `/ranking`, `/quiteria`,
`/newsletter`, `/metodologia`, `/acompanhe`, `/apoiadores`) e as páginas
`noindex` de `/alertas/confirmado` e `/alertas/cancelado`. Ele caiu de cerca de
15,7 mil para cerca de 7,5 mil URLs.

1. Depois do deploy, em **Sitemaps**, clique em `sitemap-index.xml` → **⋮** →
   **Reenviar** (ou remova e envie de novo) para forçar uma nova leitura.
2. Em **Indexação → Páginas**, os grupos "Página com redirecionamento" e
   "Excluída pela tag 'noindex'" vão continuar mostrando as URLs antigas por
   algumas semanas. Isso é esperado: elas saem conforme o Google rastreia de novo.
   Não é preciso pedir remoção.
3. Para acelerar páginas importantes (home, `/atividade-legislativa/`, `/sobre/`),
   use **Inspeção de URL** → **Solicitar indexação**. O limite é de poucas URLs
   por dia, então use só nas principais.

## 4. Conferência rápida (opcional)

```sh
curl -sI https://www.elasnocongresso.com.br/sitemap-index.xml   # 200, application/xml
curl -s  https://www.elasnocongresso.com.br/robots.txt          # Sitemap: .../sitemap-index.xml
```

Referência: [Criar e enviar um sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=pt-br).
