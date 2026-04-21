# Plan: PHP → Astro Migration — Elas no Congresso

## Context

Migrate frontend of `elasnocongresso` (PHP 7.3 + Apache + Gulp) to Astro (static output) in this repo.
The `elasnocongresso/astro-migration.md` is the authoritative spec. This plan adds concrete
implementation details found during source analysis.

**Source:** `../elasnocongresso/`
**Spec:** `../elasnocongresso/astro-migration.md`

---

## Pre-flight: Critical Discoveries

### 1. dados.json — three fetch paths in `_base.js`

| Object | Path | Works from sub-page? |
|--------|------|----------------------|
| `app` | `d3.json("/data/dados.json")` | ✅ absolute |
| `rank` | `d3.json("./dados.json")` | ❌ breaks from `/ranking/` |
| `props` | `d3.json("./dados.json")` | ❌ breaks from `/propostas-e-votacoes/` |
| `vueApp` | `d3.json("/dados.json")` | ✅ absolute |

**Fix (Option A, adopted):** Copy `dados.json` to `public/dados.json` AND `public/data/dados.json`.
In `public/build/script.js`, change lines 1013 and 1387 from `"./dados.json"` → `"/dados.json"`. Done.

### 2. LESS asset paths → absolute URLs

`_base.less` used `@u: "../assets/images/"` and font-face with `../assets/fonts/...`.
In new project LESS lives at `src/styles/less/` — relative `../` resolves wrong.
**Fix (adopted):** Changed to `/assets/images/` and `/assets/fonts/...`. Done.

### 3. quiteria WebP images never committed

`_quiteria.less` referenced `../dist/images/quiteria/*.webp` (Gulp-generated, gitignored).
**Fix (adopted):** Paths updated to `/assets/images/quiteria/...`. Directory created at
`public/assets/images/quiteria/`. Images must be sourced separately (from running server or re-generated).

### 4. jQuery

`package.json` in PHP project lists `jquery` as dep. `_base.js` uses D3, but `select.js` plugin
likely requires it. Include jQuery CDN in `BaseLayout.astro` before `script.js`.

### 5. PetiteVue `{{ }}` conflict with Astro template syntax

Astro parses `{}` as JS expressions. PetiteVue `{{ expr }}` blocks must be wrapped in
`<Fragment set:html={...}>` or components must use `is:raw`. Use `<script is:inline>` for all
vueApp and `PetiteVue.createApp(...)` blocks.

### 6. `home_url` global JS variable

`_footer.php` sets `const home_url = '<?php tu(); ?>';`.
**Fix:** `BaseLayout.astro` injects `<script is:inline>const home_url = '/';</script>` before `script.js`.

### 7. CSS media query warnings (pre-existing)

`flexboxgrid.less` generates `screen and (...) and screen and (...)` — invalid but pre-existing
in the PHP project. Vite warns but does not fail. Document in `MIGRATION_NOTES.md`.

---

## Stack

- **Astro 6** — `output: 'static'`, `trailingSlash: 'ignore'`
- **Tailwind v4** via `@tailwindcss/vite`, prefix `tw:`
- **LESS** via Vite (`less` devDependency)
- **autoprefixer** via `postcss.config.cjs`
- **PetiteVue, D3, Lodash, Motion** — CDN only, no bundling
- **TypeScript strict** — `tsconfig.json` extends `astro/tsconfigs/strict`

---

## Phase 0 — Astro bootstrap ✅ DONE

- Astro 6 minimal template, strict TS
- `astro.config.mjs` with Tailwind v4 + LESS + trailingSlash
- `postcss.config.cjs` with autoprefixer
- `src/styles/tailwind.css` with `@import "tailwindcss" prefix(tw);`
- Build passes, `tw:` prefix works

## Phase 1 — Static assets and data ✅ DONE

- `public/assets/` ← `elasnocongresso/assets/`
- `src/data/dados.json`, `public/dados.json`, `public/data/dados.json`
- `src/data/parlamentares.csv` ← `.data/parlamentares.csv`
- `src/styles/less/` ← `src/less/`
- `public/build/script.js` ← concatenated `plugins/select.js` + `_base.js`
- Fixed `./dados.json` → `/dados.json` on lines 1013, 1387 of script.js

## Phase 2 — CSS pipeline ✅ DONE

- `src/styles/global.less` importing `./less/style.less`
- `_base.less`: `@u` and font-face paths fixed to absolute
- `_quiteria.less`: `../dist/images/quiteria/` → `/assets/images/quiteria/`
- Build passes with only pre-existing warnings

## Phase 3 — BaseLayout, Header, Footer, shared components 🔄 IN PROGRESS

Files completed so far:
- `src/lib/url.ts`
- `src/components/Expediente.astro`
- `src/components/Participantes.astro`

Files remaining:
- `src/layouts/BaseLayout.astro` — head + body; imports CSS; injects home_url + script.js
- `src/components/Header.astro` — `<header class="top-bar">` + nav 6 links
- `src/components/Footer.astro` — footer + bottom-bar + GA + Mautic scripts
- `src/components/Share.astro` — props: `title?`, `url?`; default `Astro.url.href`
- `src/components/NewsletterSection.astro`
- `src/components/FormMautic.astro`
- `src/components/FormSubstack.astro`

DoD: `_layout-test.astro` renders header + footer; delete before closing phase.

## Phase 4 — TypeScript helpers

- `src/lib/formatters.ts` — `artigoCasa`, `casa`, `genero`, `avaliacao`, `relevancia`, `voto`
- `src/lib/strings.ts` — `cleanName`, `cleanNumero`; validate `cleanName('Esperidião Amin') === 'esperidiao_amin'`
- `src/lib/dados.ts` — re-exports JSON, `getLegislatura()`
- `src/lib/parlamentar.ts` — `getParlamentarBySlug`, `getAllParlamentareSlugs`, `getProposicaoBySlug`, `getAllProposicoesSlugs`, `getProximos`, `mediaPartido`, `mediaCasa`
- `src/lib/partidos.ts` — `getPartidos()` from CSV `?raw`
- `src/lib/wp.ts` — `fetchReportagens(tagId, perPage)` → `[]` on failure

## Phase 5 — Pages

### 5.1 Static pages
`metodologia`, `quiteria`, `apoiadores`, `newsletter`, `teste` → `src/pages/<name>.astro`

### 5.2 `acompanhe.astro`
`await fetchReportagens(1988, 99)` at build time; map posts.

### 5.3 `index.astro` + dataviz components
- `src/components/dataviz/DatavizIncludes.astro` — CDN scripts + `<script is:inline>` with full `vueApp`
- `HomeCta`, `HomeCharts`, `HomeChartsGender`, `HomeChartsPartidos`, `HomePosts`, `HomeQuotes`
- PetiteVue `{{ }}` → `<Fragment set:html={...}>` strategy
- `DatavizIncludes` must load before `<HomeCharts />`
- `await fetchReportagens(2685, 2)` for home posts

### 5.4 `propostas-e-votacoes.astro` + `ranking.astro`
- Build-time `<option>` generation via `getPartidos()` + `legislaturasKeys`
- Client-side data already covered by script.js fetching `/dados.json`

### 5.5 `perfil/[slug].astro` + `proposta/[slug].astro`
- `getStaticPaths()` from `getAllParlamentareSlugs()` / `getAllProposicoesSlugs()`
- Render with `legislaturaAtualDefault`; `TODO:` comment on legislatura select
- Redirect to `/` if not found

### 5.6 `404.astro`

## Phase 6 — Scripts & JS validation

- Verify jQuery CDN, `window.home_url`, console zero errors
- Manual checklist: menu mobile, copy link, ranking filters, PetiteVue gender toggle, tooltips

## Phase 7 — CI

`.github/workflows/build.yml` — Node 22, `npm ci`, `npm run build`, upload artifact.

## Phase 8 — Cleanup + docs

- `README.md`, `MIGRATION_NOTES.md`
- Delete `_layout-test.astro` + scratch files
- `npx depcheck`

---

## Key substitution rules (PHP → Astro)

| PHP | Astro |
|-----|-------|
| `<?php echo home_url('x'); ?>` | `{url('x')}` |
| `<?php tu(); ?>assets/...` | `/assets/...` |
| `<?php include '_share.php'; ?>` | `<Share />` |
| `<?php include '_participantes.php'; ?>` | `<Participantes />` |
| `<?php include '_expediente.php'; ?>` | `<Expediente />` |
| `<?php include 'newsletter_section.php'; ?>` | `<NewsletterSection />` |
| `<?php echo $page ... ?>` | `title` prop on `BaseLayout` |
| `<?php foreach ($posts as ...) ?>` | `{posts.map(p => ...)}` |
| `<?php echo $p->nome; ?>` | `{parlamentar.nome}` |
