# Elas no Congresso

[Site](https://elasnocongresso.com.br) estático em Astro para acompanhar a atividade legislativa e as pautas de gênero no Congresso Nacional.

## Desenvolvimento

```sh
npm install
npm run dev
```

No servidor local, GETs públicos bem-sucedidos são reutilizados por até 60 segundos, incluindo requisições simultâneas. Reinicie o servidor para limpar o cache imediatamente. O cache não se aplica ao browser nem ao build de produção; as requisições têm limite de 15 segundos.

No build, GETs públicos sem sinal de cancelamento têm até três tentativas em caso de falha de rede, timeout ou HTTP 502/503/504, com pausas de 500 ms e 1 segundo. Cada tentativa mantém o limite de 15 segundos; os logs identificam a URL. Falhas persistentes continuam interrompendo o build. Requisições no browser ou com cancelamento explícito não são repetidas automaticamente.

## Verificação e build

```sh
npm run check
npm run build
```

`check` executa a verificação de tipos do Astro/React, Knip, verifica referências e arquivos não utilizados em `public/assets`, e roda os testes com o Node. O build gera `dist/` e precisa acessar a fonte pública de dados.

### Testes e avaliação contínua

Use uma distribuição do Node com suporte a TypeScript (Node 22.12+; o CI testa as versões 22 e 24).

```sh
npm test
npm run test:coverage
npm run build
npm run test:build
```

Os testes unitários e de renderização não precisam de rede, `.env` ou credenciais. Cobrem regras de domínio, filtros, alertas, renderização React, paginação, erros e cancelamento de requisições, notícias e cache. As requisições dos novos testes são simuladas com `node:test`. `test:coverage` mostra a cobertura dos módulos TypeScript carregados pelos testes e salva `reports/coverage.lcov`; os bundles React criados em memória não entram nessa medição. A cobertura serve para identificar lacunas, sem um percentual mínimo arbitrário.

`test:build` exige um `dist/` recém-gerado. Verifica conteúdo e metadados das páginas principais, uma página de autoria e uma de proposição, os assets gerados referenciados nesses HTMLs, o sitemap canônico, `robots.txt` e a página 404. O build usa a API pública real: indisponibilidade ou mudanças nesses dados podem quebrar essa avaliação mesmo quando os testes unitários passam. Essas verificações não substituem a [revisão visual e de interações](docs/visual-regression.md).

Os workflows do GitHub Actions são:

- **Tests** (`.github/workflows/test.yml`): em pull requests, pushes em `main` e execução manual; verifica tipos, código/assets sem uso e testes com cobertura no Node 22 e 24.
- **Production build evaluation** (`.github/workflows/evaluate.yml`): em pull requests, toda segunda-feira às 9h de Brasília e execução manual; faz um build limpo com a API pública e roda `test:build`, sem publicar o site.
- **Build & Deploy** (`.github/workflows/build.yml`): mantém as verificações existentes e executa `test:build` antes de configurar credenciais e publicar.

Os workflows de testes e avaliação guardam logs e cobertura (quando aplicável) como artifacts por 14 dias, inclusive em falhas. Para exigir esses checks antes do merge, configure as regras de proteção da branch no GitHub depois da primeira execução.

### Segurança

O workflow **Security** (`.github/workflows/security.yml`) roda em pull requests, pushes em `main`, semanalmente e por execução manual. `npm audit --audit-level=high` verifica todo o lockfile, incluindo dependências de desenvolvimento, e falha para vulnerabilidades conhecidas de severidade alta ou crítica. O relatório fica disponível como artifact por 14 dias. Em pull requests, Dependency Review também verifica as mudanças de dependências com o mesmo limite de severidade. CodeQL analisa JavaScript/TypeScript e os workflows do GitHub Actions; os resultados ficam na aba **Security → Code scanning**.

Para repetir a auditoria localmente, use `npm audit --audit-level=high`; ela requer acesso ao registro npm. Uma auditoria sem alertas não substitui revisão de código nem garante ausência de vulnerabilidades.

Secret scanning e push protection são configurações do repositório no GitHub, fora dos arquivos de workflow. O primeiro detecta credenciais reconhecidas no histórico; o segundo bloqueia o envio de segredos suportados antes de entrarem no repositório. Alertas do Dependabot permanecem ativos; os PRs automáticos de correção do Dependabot ficam desativados para evitar duplicação com o Renovate. Essas configurações podem ser conferidas em **Settings → Security**.

### Atualizações de dependências

O Renovate é o único responsável por propor atualizações de npm e GitHub Actions. `renovate.json` reaproveita o onboarding do [PR #4](https://github.com/institutoazmina/elas-no-congresso/pull/4), com o preset `config:recommended`. A configuração entra em vigor quando chegar a `main`; mantenha o PR de onboarding aberto até lá para não desativar o bot antes da incorporação.

Atualizações regulares podem ser propostas às segundas-feiras entre 0h e 9h, no fuso `America/Sao_Paulo`, com limite de três PRs abertos e dois novos PRs por hora. Atualizações menores e patches são agrupados separadamente para npm e Actions; versões major ficam em PRs próprios. O Dependency Dashboard reúne as atualizações, e nenhum PR é mesclado automaticamente.

Correções de vulnerabilidades detectadas pelos alertas do GitHub podem ser propostas fora da janela e dos limites regulares, desde que o aplicativo Renovate tenha acesso de leitura aos alertas do Dependabot. A configuração não adiciona outro workflow nem exige um token no repositório: usa o aplicativo Renovate já responsável pelo onboarding.

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

Textos e imagens editáveis vêm do CMS no admin da API (`GET /cms/<página>`, em `src/service/api/cms.ts`). Cada salvamento no admin dispara este workflow via `repository_dispatch`; os deploys rodam um por vez. As imagens do CMS ficam no bucket em `cms/`; imagens editoriais podem ser inseridas e reutilizadas pela galeria dos campos Markdown. O deploy nunca as apaga.

## Interatividade

A interface interativa usa ilhas React em arquivos `.tsx`. Astro continua responsável pelas rotas, pelo layout, pelo conteúdo estático e pelas consultas de build. Cada área interativa tem um único proprietário de estado; controles filhos recebem valores e callbacks. Evite scripts de página, eventos globais para sincronizar componentes e reconstrução de HTML por seletores.

Use `client:load` para filtros, navegação e formulários; `client:visible` para carrosséis e gráficos abaixo da primeira dobra. Componentes dentro de uma ilha React não recebem outra diretiva `client:`. Na página de alertas, o topo e a lista são Astro; a ilha `AlertsSignup` é o botão do topo e o diálogo de inscrição, renderizado no `<body>`.

Efeitos devem cancelar requisições, observadores, timers e listeners ao desmontar. Leituras de layout e desenho em canvas podem usar refs e APIs do navegador dentro de efeitos. O bootstrap do Google Analytics é a única exceção de script inline de fornecedor.

No explorador, filtros, ordenação, paginação, totais, opções e exportação permanecem sob responsabilidade da API. As páginas de autoria mantêm a ordenação e paginação da fotografia estática gerada no build; o ritmo de tramitação vem da API, sem substituir valores ausentes por previsões.

Os testes de renderização verificam que as ilhas podem produzir HTML sem APIs do navegador, que proposições de autoria aparecem no HTML inicial e que texto da API é escapado pelo React. Validação visual e de interações no navegador continua distinta da checagem de tipos e do build.
