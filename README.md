# Elas no Congresso

Site estático em Astro para acompanhar a atividade legislativa e as pautas de gênero no Congresso Nacional.

## Desenvolvimento

```sh
npm install
npm run dev
```

No servidor local, GETs públicos bem-sucedidos são reutilizados por até 60 segundos, incluindo requisições simultâneas. Reinicie o servidor para limpar o cache imediatamente. O cache não se aplica ao browser nem ao build de produção; as requisições têm limite de 15 segundos.

## Verificação e build

```sh
npm run check
npm run build
```

`check` executa a verificação de tipos do Astro/React, Knip, verifica referências e arquivos não utilizados em `public/assets`, e roda os testes com o Node. O build gera `dist/` e precisa acessar a fonte pública de dados.

## Organização

- `src/pages/`: rotas públicas.
- `src/layouts/`: estruturas de página.
- `src/components/{home,activity,alerts,charts,about,newsletter,layout,shared}/`: componentes agrupados por uso.
- `src/lib/`: lógica e testes.
- `src/hooks/`: ciclo de vida, mídia, foco e carrosséis em React.
- `src/service/api/`: acesso aos dados no build.
- `src/styles/tailwind.css`: entrada do Tailwind, tokens de cores/fontes e fonte local.
- `src/assets/images/`: imagens, agrupadas por assunto; inclui os mapas e a papelada.
- `public/assets/fonts/`: fontes locais.

Imagens locais são importadas de `src/assets/images/`. Templates estáticos usam `Image` de `astro:assets`; ilhas React usam o componente compartilhado `Image`, com dimensões dos metadados e URLs resolvidas pelo Vite. Fundos CSS e imagens de scripts usam URLs resolvidas pelo bundler; os mapas SVG interativos usam imports `?raw` para preservar seus paths inline. Imagens remotas da AzMina também são autorizadas para otimização. Fotos parlamentares continuam remotas, pois algumas URLs redirecionam e precisam do fallback no navegador.

Os componentes usam utilitários Tailwind com prefixo `tw:` e flexbox para layout. Não há LESS nem folhas de estilo por página. Valores calculados em tempo de execução, como percentuais dos gráficos e deslocamentos dos carrosséis, continuam no JavaScript.

Seletores Tailwind com underscores escapados precisam preservar as barras no HTML. Nos atributos Astro, use `String.raw` para esses valores; veja os exemplos em `PartyRightsChart.tsx`. Ao alterar layout ou tipografia, compare também com a referência visual: verificações de carregamento não detectam fontes ou alinhamentos incorretos.

O deploy configura cache de uma hora com revalidação para `/assets/`, e um ano imutável para os arquivos com hash gerados pelo Astro. Ao precisar publicar uma imagem sem esperar a expiração do cache do navegador, use um novo nome de arquivo.

## Dados

`https://api.elasnocongresso.com.br/api/v1` fornece os dados legislativos para o build e as interações no navegador. Veja [a documentação dos filtros](docs/activity-explorer-api.md).

## Interatividade

A interface interativa usa ilhas React em arquivos `.tsx`. Astro continua responsável pelas rotas, pelo layout, pelo conteúdo estático e pelas consultas de build. Cada área interativa tem um único proprietário de estado; controles filhos recebem valores e callbacks. Evite scripts de página, eventos globais para sincronizar componentes e reconstrução de HTML por seletores.

Use `client:load` para filtros, navegação e formulários; `client:visible` para carrosséis e gráficos abaixo da primeira dobra. Componentes dentro de uma ilha React não recebem outra diretiva `client:`. O slot de conteúdo da página de alertas permanece Astro e hospeda a ilha independente da lista.

Efeitos devem cancelar requisições, observadores, timers e listeners ao desmontar. Leituras de layout e desenho em canvas podem usar refs e APIs do navegador dentro de efeitos. O bootstrap do Google Analytics é a única exceção de script inline de fornecedor.

No explorador, filtros, ordenação, paginação, totais, opções e exportação permanecem sob responsabilidade da API. As páginas de autoria mantêm a ordenação e paginação da fotografia estática gerada no build; o ritmo de tramitação vem da API, sem substituir valores ausentes por previsões.

Os testes de renderização verificam que as ilhas podem produzir HTML sem APIs do navegador, que proposições de autoria aparecem no HTML inicial e que texto da API é escapado pelo React. Validação visual e de interações no navegador continua distinta da checagem de tipos e do build.
