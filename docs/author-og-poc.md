# Parliamentarian OG image POC

Each `/atividade-legislativa/autoria/<slug>` page points its Open Graph and
Twitter metadata at `/atividade-legislativa/autoria/<slug>/og.png` (1200 × 630).
Run `npm run dev` and open that image URL to preview, for example
`/atividade-legislativa/autoria/samia-bomfim/og.png` when that author is in the API.

The POC uses `src/assets/images/og-background.png` at its native 1200 × 630
size, with its embedded logo, plus a dynamic portrait, name, party/state, and green/red
favourability bar. Missing/failed photos display initials; zero assessed proposals
produce a neutral bar. It reuses the author page's unfiltered activity snapshot
and ratio, excluding unassessed proposals, and the same directory/term fallbacks.
URL query filters do not change the image.

## Approach

- [Astro static endpoints](https://docs.astro.build/en/guides/endpoints/) generate
  PNG files during the existing static build. Shared path loading keeps the page
  and image slugs/data consistent.
- [Satori](https://github.com/vercel/satori) lays out JSX as SVG, using local TTF
  fonts (Anybody at weight 700 / width 75 and Plus Jakarta Sans at weight 600,
  with their OFL licenses bundled). Sharp (already installed) embeds/resizes the remote portrait and converts
  the SVG to PNG. No browser or external image generation service is needed.
- Direct SVG + Sharp would need manual text layout/wrapping. Satori provides a
  small editable JSX template for the later design pass. Its CSS support is a
  subset of browser CSS; the final artwork can be embedded as static assets.

These are data-driven **build-time** images: updating API data requires a rebuild.
OG PNGs use the short deployment cache (one hour with revalidation), not the
one-year immutable asset cache. Social platforms may also cache previews. Truly request-time generation requires
an [Astro server adapter](https://docs.astro.build/en/guides/on-demand-rendering/)
and a caching strategy, or a separate image service. This POC retains the current
static hosting model. Each author adds a photo fetch and PNG render to the build;
photo failures log a warning and fall back to initials (10-second fetch timeout).

Other pages use `src/assets/images/og-default.png` through the shared layout.
Parliamentarian pages override that default with their generated images.

## Render while adjusting the design

Edit `src/lib/author-og.tsx` or `src/assets/images/og-background.png`, then run:

```sh
npm run og:render -- samia-bomfim
open previews/samia-bomfim.png
```

This compiles the current template and writes only that author's PNG. The first
run reuses the author data in `dist` if available, otherwise loads the API. Data
and the original portrait are cached in `node_modules/.cache/og-render`, allowing
subsequent design iterations offline. Add `--refresh` to reload API data and the
portrait. You can pass another author slug; Sâmia is the default if omitted.
