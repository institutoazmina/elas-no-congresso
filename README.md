# Elas no Congresso

Astro migration of the original PHP site.

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

Output: `./dist/` (~3100 static HTML pages)

## Data

- `public/dados.json` - Proposals/votations data (fetched client-side)
- `src/data/dados.json` - Source for type safety
- `src/data/parlamentares.csv` - Parliamentary data
- `public/assets/` - Static assets (images, fonts)

## Known Limitations

- `?legislatura=` query param not implemented (would require dynamic routes)
- PetiteVue uses `[[ ]]` delimiters to avoid conflicts with Astro's `{{ }}`
- Some LESS imports use absolute paths `/assets/images/` for production
