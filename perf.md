# Melhorias de Performance e Best Practices

Baseado nos relatórios Unlighthouse de `homologacao.elasnocongresso.com.br` (versão Astro).
Scores da home na medição inicial: **Performance 62 · Best Practices 73**.

> **Status (2026-06-16):** maioria das ações aplicadas. Falta nova medição
> Unlighthouse para confirmar o ganho. Itens marcados ⏳ continuam pendentes.

Métricas críticas medidas na home (baseline):

| Métrica | Valor | Meta |
|---|---|---|
| LCP (Largest Contentful Paint) | **18,3 s** | < 2,5 s |
| TBT (Total Blocking Time) | 440 ms | < 200 ms |
| Speed Index | 4,0 s | < 3,4 s |
| TTI (Time to Interactive) | 18,4 s | < 3,8 s |
| Peso total da página | 3.576 KiB | < 1.500 KiB |

---

## Performance

### 1. Imagens — economia estimada ~828 KiB (maior ganho) ✅
Migrado para `astro:assets` (`<Image>` / `<Picture>`): gera AVIF + WebP + fallback,
arquivos hasheados em `_astro/`, `width`/`height` automáticos, `loading` correto.

- [x] **Home** (`HomeCta`, `index`, `NewsletterSection`): hero (abertura, splash), 3 banners, newsletter → `<Picture>`.
  - `abertura` 453 KiB → **AVIF 136 KiB** / WebP 275 KiB / JPG 357 KiB.
- [x] **apoiadores** (9 logos parceiros) e **Participantes** (20 logos raster) → `<Image>` via `import.meta.glob`.
- [x] **quiteria** (`logo.webp`, `fluxo.webp`) → `<Image>`.
- [x] `loading="lazy"` abaixo da dobra; `fetchpriority="high"` no hero; `width`/`height` em tudo (corrige `unsized-images` / CLS).
- [x] Imagens raster movidas `public/assets/images` → `src/assets/images` (necessário p/ `astro:assets`).
  - Arquivos que também são background CSS ficaram duplicados (`src/` p/ `<Image>` + `public/` p/ CSS): `splash-lettering.png`, `quiteria/logo.webp`.
- SVGs (`article19`, `instituto-update`, `EQUALITY`) ficam `<img>` cru — Astro não otimiza vetor.
- [x] Imagens **remotas/runtime** (WP, foto de parlamentar em `acompanhe`, `HomePosts`, `HomeChartsGender`, `perfil/[slug]`) → `loading="lazy"` + `decoding="async"` (não dá p/ importar estático).
- [x] **Backgrounds CSS** (`papel.jpg`, `congresso.png`, `abertura-*.png`, `lettering-logo.png`, etc.) otimizados via **CSS-in-Astro** (`src/components/BgStyles.astro`): `getImage()` gera WebP (`quality: 55`) em build e injeta um `<style is:global>` com override de maior especificidade (`html <seletor>`) → a regra PNG do LESS é sobrescrita e **nunca é baixada**. LESS não foi tocado (baixo risco); originais ficam em `public/` p/ os poucos seletores não cobertos.
  - Maiores ganhos (site-wide, no `footer` e headers `.abertura-*`): `congresso.png` 203→**39 KiB**, `papel.jpg` 71→**25 KiB**, `abertura-apoiadores` 362→**143 KiB**.
  - Os 3 `tw:bg-[url('papel.jpg')]` (HomeCta/HomeQuotes/HomeChartsPartidos) viraram classe `.bg-papel`.
  - ⏳ Alguns headers fotográficos com alpha comprimem pouco mesmo em q55 (`abertura-sobre` 354→272, `abertura-acompanhe` 338→305) — só melhora com qualidade mais baixa (risco de artefato visível) ou resize.
  - ⏳ Splash decorativos do **menu** (`splash-top-right/bottom-left` nos seletores aninhados de nav) seguem em PNG — seletores aninhados, baixo valor.

### 2. LCP 18,3 s ✅ (parcial)
- [x] `fetchpriority="high"` + `loading="eager"` no hero (via `<Picture>`).
- [x] Imagem do hero não depende de JS para renderizar.
- ⏳ LCP real provavelmente dominado pelo carregamento de `dados.json` (2,6 MB) na home — ver item 8.

### 3. JavaScript não usado — economia ~588 KiB ✅
Scripts eram carregados em **todas** as páginas via `BaseLayout.astro`.

| Script | Antes | Agora |
|---|---|---|
| reCAPTCHA + Mautic | global (~376 KiB) | atrás de prop `hasForm` → **não carrega em página nenhuma** (FormMautic é componente morto; newsletter real = iframe Substack) |
| d3@7 | carregado **2×** na home | **1×** (removido de `DatavizIncludes`; `BaseLayout` provê global p/ `script.js`) |
| gtag UA-67010839-2 | global | **removido** (Universal Analytics descontinuado jul/2024) |
| jQuery 3.7.1 | global | **removido** (0 usos confirmados) |
| motion@latest | dataviz | mantido |

- [x] d3 duplicado removido.
- [x] reCAPTCHA/Mautic não carregam (gate `hasForm`, ativável no futuro se reintroduzirem o form).
- [x] UA analytics removido.
- [x] jQuery removido.
- ⏳ `motion@latest` sem versão fixa — não fixei p/ não arriscar quebrar animação sem teste visual.

### 4. Render-blocking — economia ~630 ms ✅ (parcial)
- [x] `preconnect` (fonts.googleapis/gstatic) + `dns-prefetch` (jsdelivr) no `<head>`.
- [x] `preload` da fonte local.
- d3 + `script.js` permanecem no fim do `<body>` (ordem importa: `script.js` depende de d3; petite-vue monta depois). Não há ganho seguro em adicionar `defer` sem reordenar o mount.

### 5. Fontes — `font-display` ✅
- [x] `font-display: swap;` no `@font-face` da ETC Anybody (`_base.less`).
- [x] `preload` da fonte local + `preconnect` Google Fonts.

### 6. Cache ✅
- [x] `build.yml`: imagens agora hasheadas (`_astro/`) → pegam corretamente `Cache-Control: immutable` 1 ano.
- [x] **Bug corrigido**: `dados.json` (não-fingerprinted) pegava `immutable` 1 ano → updates nunca propagavam. Agora `json`/`xml`/`robots.txt` = `max-age=3600,must-revalidate`.

### 7. Forced reflow + TBT 440 ms ⏳
- [ ] Auditar JS que lê/escreve layout no mesmo frame (`offsetWidth` etc.) — provável em `script.js`/dataviz d3.
- [ ] Quebrar tarefas longas; usar `requestAnimationFrame` p/ DOM/tooltip.

### 8. `dados.json` — 491 KiB transferidos (2,6 MB cru) ⏳
- [ ] Maior asset da home, carregado p/ os contadores. Avaliar: carregar só na rota da dataviz, paginar, ou pré-agregar os números dos contadores em build (evita baixar o JSON inteiro na home).

### 9. JS não minificado — economia ~3 KiB ⏳
- [ ] Mover `/build/script.js` p/ `src/` e importar (passa pela minificação do Astro) em vez de servir cru de `/build`.

---

## Best Practices

### 1. Erros no console (`errors-in-console`) ⏳
- [ ] `Failed to load resource: net::ERR_TIMED_OUT` — identificar e remover/corrigir a URL morta.

### 2. Cookies de terceiros (`third-party-cookies`) ✅ (parcial)
- [x] iframe do Substack com `loading="lazy"` (adia o cookie `__cf_bm` p/ quando entra na viewport).
- ⏳ Ganho maior: carregar o embed só sob clique/interação.

### 3. Problemas do inspetor (`inspector-issues`) ⏳
- [ ] Abrir aba **Issues** do DevTools e resolver (headers ausentes, deprecations, mixed content).

### 4. Higiene geral ✅
- [x] `@astrojs/sitemap` integrado (`sitemap-index.xml`) + `robots.txt`.
- [x] Removido `maximum-scale=1.0, user-scalable=no` da meta viewport (acessibilidade/zoom).

---

## Pendências (próximos passos)

1. ⏳ **Re-rodar Unlighthouse** no build local/homologação p/ medir o ganho real.
2. ⏳ **`dados.json` na home** (item 8) — provável maior alavanca restante p/ LCP/TTI.
3. ⏳ Forced reflow / TBT (item 7).
4. ⏳ Fixar versão do `motion`; mover `script.js` p/ o build do Astro (item 9).
5. ⏳ Best practices: erro de console, embed Substack sob interação, aba Issues.

> ⚠️ **Validar visualmente** (`npm run dev`) /apoiadores, /quiteria e um /perfil/* antes do
> deploy — a migração de imagens passa no build, mas o visual (larguras/alinhamento dos
> logos, layout do hero) não foi validado automaticamente.
