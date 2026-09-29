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

Output: `./dist/` static HTML generated from the public API.

## Data

- `https://api.elasnocongresso.com.br/api/v1` - Legislative data for builds and browser interactions
- `public/assets/` - Static assets (images, fonts)

## Known Limitations

- `?legislatura=` query param not implemented (would require dynamic routes)
- PetiteVue uses `[[ ]]` delimiters to avoid conflicts with Astro's `{{ }}`
- Some LESS imports use absolute paths `/assets/images/` for production
