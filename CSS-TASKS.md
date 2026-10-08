# CSS cleanup — page by page

Staging visual comparison: see [visual regression review](docs/visual-regression.md). The original loading/interaction checks did not establish visual parity; the later review corrected typography, selector escaping, flex wrapping, spacing, masks, and article presentation.

Use Tailwind utilities, flexbox for layout, and shared tokens for fonts/colors.
Remove replaced rules; keep custom CSS only for behavior Tailwind cannot express clearly.
Keep JavaScript hooks and current content. Check desktop and mobile for every page.

- [x] Shared foundation: fonts/tokens, header, footer, backgrounds, shared controls.
- [x] Home `/`: hero, charts, reportagens, alerts, carousels, funders.
- [x] Activity `/atividade-legislativa`: hero, explorer, filters, tables/cards, dashboards.
- [x] Proposition `/atividade-legislativa/proposicao/[slug]`: details, events, assessments.
- [x] Author `/atividade-legislativa/autoria/[slug]`: profile, filters, tables/cards.
- [x] Alerts `/alertas`: hero, search/sort, results, subscription dialog.
- [x] Alert confirmed `/alertas/confirmado`.
- [x] Alert cancelled `/alertas/cancelado`.
- [x] Reportagens `/reportagens`: hero, cards, pagination.
- [x] Sobre `/sobre`: hero, history, methodology, partners, credits.
- [x] IA Feminista `/ia-feminista`: hero, process, taxonomy, metrics, links.
- [x] QuitérIA `/quiteria`: article, illustrations, participants.
- [x] Metodologia `/metodologia`: article and tables.
- [x] Apoiadores `/apoiadores`: article and supporter logos.
- [x] Newsletter `/newsletter`: article and signup.
- [x] Acompanhe `/acompanhe`: reportagens and newsletter.
- [x] Not found `/404`: message and navigation.
- [x] Redirect routes: preserve redirects; no styling to migrate.
- [x] Final cleanup: remove LESS/custom utility framework and dependencies; check, build, desktop/mobile smoke check.

## Manual review

Checkboxes track implementation and automated checks. Visual approval belongs to the user.

Home validated at 1440px, 820px, and 390px on `localhost:4321`: four carousels advance, chart selector and mobile menu respond, no page overflow, broken images, or JavaScript errors. Production build and 16 tests passed. Awaiting manual visual review.

All 16 page types passed desktop (1440px) and mobile (390px) browser smoke checks on `localhost:4321`: expected HTTP statuses, no horizontal page overflow, broken images, or JavaScript errors. Activity filters and the alerts subscription dialog open and close at both widths. Dynamic author/proposition routes were checked with representative records. Existing redirect definitions are preserved.

Final validation: Knip clean; 267 assets with no unused or missing references; 16 tests passed; production build generated 15,751 pages. Home interactions rechecked after the final CSS changes at 1440px, 820px, and 390px.
