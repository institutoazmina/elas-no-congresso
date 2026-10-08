# Elas no Congresso

Site estático em Astro para acompanhar a atividade legislativa e as pautas de gênero no Congresso Nacional.

## Desenvolvimento

```sh
npm install
npm run dev
```

## Verificação e build

```sh
npm run check
npm run build
```

`check` executa Knip, verifica referências e arquivos não utilizados em `public/assets`, e roda os testes com o Node. O build gera `dist/` e precisa acessar a fonte pública de dados.

## Organização

- `src/pages/`: rotas públicas.
- `src/layouts/`: estruturas de página.
- `src/components/{home,activity,alerts,charts,about,newsletter,layout,shared}/`: componentes agrupados por uso.
- `src/lib/`: lógica e testes.
- `src/scripts/`: comportamento das páginas no navegador.
- `src/service/api/`: acesso aos dados no build.
- `src/styles/tailwind.css`: entrada do Tailwind, tokens de cores/fontes e fonte local.
- `public/assets/images/`: imagens, agrupadas por assunto; inclui os mapas e a papelada.
- `public/assets/fonts/`: fontes locais.

Imagens usam URLs `/assets/images/...`, inclusive em CSS. Os arquivos WebP já estão otimizados: não são gerados nem importados pelo bundler. Os dois mapas SVG interativos são lidos no build para preservar seus paths inline.

Os componentes usam utilitários Tailwind com prefixo `tw:` e flexbox para layout. Não há LESS nem folhas de estilo por página. Valores calculados em tempo de execução, como percentuais dos gráficos e deslocamentos dos carrosséis, continuam no JavaScript. O acompanhamento por página está em [CSS-TASKS.md](CSS-TASKS.md).

Seletores Tailwind com underscores escapados precisam preservar as barras no HTML. Nos atributos Astro, use `String.raw` para esses valores; veja os exemplos em `PartyRightsChart.astro`. Ao alterar layout ou tipografia, compare também com a referência visual: verificações de carregamento não detectam fontes ou alinhamentos incorretos.

O deploy configura cache de uma hora com revalidação para `/assets/`, e um ano imutável para os arquivos com hash gerados pelo Astro. Ao precisar publicar uma imagem sem esperar a expiração do cache do navegador, use um novo nome de arquivo.

## Dados

`https://api.elasnocongresso.com.br/api/v1` fornece os dados legislativos para o build e as interações no navegador. Veja [a documentação dos filtros](docs/activity-explorer-api.md).
