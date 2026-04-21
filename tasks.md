# Tasks — Elas no Congresso Astro Migration

Legend: ✅ done · 🔄 in progress · ⬜ todo

---

## Phase 0 — Astro bootstrap
- ✅ Run `npm create astro` with minimal template + strict TS
- ✅ Install `@tailwindcss/vite`, `tailwindcss`, `less`, `autoprefixer`
- ✅ Write `astro.config.mjs` (static output, trailingSlash ignore, Tailwind v4 plugin, LESS)
- ✅ Write `src/styles/tailwind.css` (`@import "tailwindcss" prefix(tw);`)
- ✅ Write `postcss.config.cjs` (autoprefixer)
- ✅ Placeholder `src/pages/index.astro` with `tw:bg-red-500` test div
- ✅ `npm run build` passes, `dist/index.html` exists

## Phase 1 — Static assets and data
- ✅ Copy `assets/` → `public/assets/`
- ✅ Copy `dados.json` → `src/data/`, `public/`, `public/data/`
- ✅ Copy `.data/parlamentares.csv` → `src/data/parlamentares.csv`
- ✅ Copy `src/less/` → `src/styles/less/`
- ✅ Concatenate `plugins/select.js` + `_base.js` → `public/build/script.js`
- ✅ Fix `./dados.json` → `/dados.json` in script.js (lines 1013, 1387)

## Phase 2 — CSS pipeline
- ✅ Create `src/styles/global.less` importing `./less/style.less`
- ✅ Fix `@u` path in `_base.less` (`../assets/images/` → `/assets/images/`)
- ✅ Fix font-face paths in `_base.less` (`../assets/fonts/` → `/assets/fonts/`)
- ✅ Fix quiteria paths in `_quiteria.less` (`../dist/images/quiteria/` → `/assets/images/quiteria/`)
- ✅ `npm run build` passes (only pre-existing warnings remain)

## Phase 3 — Layout and shared components
- ✅ `src/lib/url.ts`
- ✅ `src/components/Expediente.astro`
- ✅ `src/components/Participantes.astro`
- ✅ `src/layouts/BaseLayout.astro`
- ✅ `src/components/Header.astro`
- ✅ `src/components/Footer.astro`
- ✅ `src/components/Share.astro`
- ✅ `src/components/NewsletterSection.astro`
- ✅ `src/components/FormMautic.astro`
- ✅ `src/components/FormSubstack.astro`
- ✅ `src/pages/_layout-test.astro` (validated and deleted)
- ✅ `npm run build` passes with layout

## Phase 4 — TypeScript helpers
- ✅ `src/lib/formatters.ts` (`artigoCasa`, `casa`, `genero`, `avaliacao`, `relevancia`, `voto`)
- ✅ `src/lib/strings.ts` (`cleanName`, `cleanNumero`)
- ✅ Validate `cleanName('Esperidião Amin') === 'esperidiao_amin'`
- ✅ `src/lib/dados.ts` (re-export JSON, `getLegislatura`)
- ✅ `src/lib/parlamentar.ts` (all query/lookup functions)
- ✅ `src/lib/partidos.ts` (`getPartidos()` from CSV ?raw)
- ✅ `src/lib/wp.ts` (`fetchReportagens`)
- ✅ `npm run build` passes with TS strict

## Phase 5.1 — Static pages
- ✅ `src/pages/metodologia.astro`
- ✅ `src/pages/quiteria.astro`
- ✅ `src/pages/apoiadores.astro`
- ✅ `src/pages/newsletter.astro`
- ✅ `src/pages/teste.astro`

## Phase 5.2 — Acompanhe (WP fetch)
- ✅ `src/pages/acompanhe.astro` with `fetchReportagens(1988, 99)`

## Phase 5.3 — Home + dataviz components
- ✅ `src/components/dataviz/DatavizIncludes.astro` (CDN scripts + `<script is:inline>` vueApp)
- ✅ `src/components/dataviz/HomeCta.astro`
- ✅ `src/components/dataviz/HomeCharts.astro`
- ✅ `src/components/dataviz/HomeChartsGender.astro`
- ✅ `src/components/dataviz/HomeChartsPartidos.astro`
- ✅ `src/components/dataviz/HomePosts.astro`
- ✅ `src/components/dataviz/HomeQuotes.astro`
- ✅ `src/pages/index.astro` (full port with PetiteVue islands)
- ✅ Verify PetiteVue gender toggle works in browser

## Phase 5.4 — Rankings and proposals
- ✅ `src/pages/propostas-e-votacoes.astro`
- ✅ `src/pages/ranking.astro`
- ✅ Verify filters work (cargo, partido, busca)

## Phase 5.5 — Dynamic routes
- ✅ `src/pages/perfil/[slug].astro` with `getStaticPaths`
- ✅ `src/pages/proposta/[slug].astro` with `getStaticPaths`
- ✅ `find dist/perfil -name "*.html" | wc -l` matches slug count (682 perfil, 2402 proposta pages generated)

## Phase 5.6 — 404
- ✅ `src/pages/404.astro`

## Phase 6 — JS validation
- ⬜ jQuery CDN loads before script.js (`typeof $ !== 'undefined'`)
- ⬜ `window.home_url === '/'` in console
- ⬜ Menu mobile opens/closes
- ⬜ Copy link button works
- ⬜ Ranking filters update table
- ⬜ Propostas filters work
- ⬜ PetiteVue gender toggle on home charts
- ⬜ Tooltips on hover
- ⬜ Zero console errors on home, ranking, perfil

## Phase 7 — CI
- ⬜ `.github/workflows/build.yml` (Node 22, npm ci, build, upload dist artifact)

## Phase 8 — Cleanup + docs
- ⬜ Delete `src/pages/_layout-test.astro`
- ⬜ `README.md` (dev/build/data instructions + known limitations)
- ⬜ `MIGRATION_NOTES.md` (LESS fixes, dados.json path strategy, ?legislatura= limitation, PetiteVue {{ }} approach)
- ⬜ `npx depcheck` — remove unused deps
- ⬜ Final `npm run build` zero warnings
- ⬜ Delete `plan.md` and `tasks.md` (or move to docs/)
