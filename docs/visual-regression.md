# Staging visual regression review

Reference: https://homologacao.elasnocongresso.com.br/
Local: http://localhost:4321/
Date: 2026-10-07

## Coverage

Captured matching Chrome screenshots at 1440 × 1000 and 390 × 1000 for Home, Atividade Legislativa, Alertas, Reportagens, Sobre, IA Feminista, QuitérIA, Metodologia, Apoiadores, Newsletter, and Acompanhe. Compared rendered typography on a representative proposition and author route as well. Home received an additional 820px interaction/layout check.

The review artifact is `/private/tmp/elas-visual-review/index.html`. It contains staging, before, and after screenshots, with page/viewport selectors and full-page views. Screenshots are review evidence, not a claim of pixel-identical output: live API results, editorial content, and randomized paper illustrations can differ between captures.

## Corrections

- Restored the condensed display family on chart headings, values, labels, and Home reportagens.
- Preserved escaped underscores in 50 Astro class attributes with `String.raw`; Astro had removed the escapes, preventing Tailwind selectors from matching.
- Replaced card font shorthands that reset variable-font width settings.
- Kept the article footer/archive breakpoint units consistent so tablet column widths no longer override desktop widths.
- Restored the two-column mobile topic chart with wrapping flexbox and the original paper-pile sizing.
- Corrected mobile hero sizes, selector icons, footer typography/visibility, card masks, and image corner radius.
- Restored Reportagens card widths and row spacing, Sobre timeline spacing, and IA table alignment/padding.
- Restored article header composition, share icons, QuitérIA artwork, and the article footer with its existing credits. These remain Tailwind components; assets live in `public/assets/images`.

## Validation

Home browser assertions cover display font families, variable-font width, card mask composition, responsive selector size, two-column chart placement, mobile footer sizing/visibility, horizontal overflow, and all four carousels at 1440px, 820px, and 390px.

The earlier page smoke checks established loading and interaction behavior, but did not establish visual parity. Use these staging comparisons for the visual review.

Some legacy routes already overflow slightly on staging at 390px (Metodologia, Apoiadores, Acompanhe). Those are baseline issues rather than evidence of visual parity. The screenshots retain them for comparison; this review does not certify every viewport, content record, or pixel.

Validation completed: Knip clean, 285 referenced assets with no unused/missing files, 16 tests passing, and a production build of 15,751 pages. Home visual assertions and carousel checks pass at all three sizes.

## Remaining visual differences

The legacy article pages still have differences in long-page section spacing. IA Feminista also has a different final section height; current editorial content was preserved. The report exposes these differences rather than marking the entire site pixel-identical. Mobile overflow already present on the staging legacy pages is listed above.
