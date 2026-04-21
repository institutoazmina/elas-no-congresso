# Migration Notes

## LESS Path Fixes

Fixed asset paths in LESS files to work with Astro's static output:

```diff
- background-image: url(../assets/images/...);
+ background-image: url(/assets/images/...);
```

Font paths in `_base.less`:
```diff
- src: url(../assets/fonts/...);
+ src: url(/assets/fonts/...);
```

## dados.json Strategy

The proposals/votations table fetches data client-side:

```js
d3.json("/dados.json")
```

Two copies exist:
- `public/dados.json` - Served to browser
- `src/data/dados.json` - TypeScript source for static generation

## ?legislatura= Limitation

The original PHP site supported `?legislatura=56` etc. This was not implemented in the Astro migration. Would require dynamic routes or client-side filtering.

## PetiteVue Delimiters

PetiteVue defaults to `{{ }}` which conflicts with Astro's template syntax. Fixed by using custom delimiters:

```js
 delimiters: ['[[', ']]'
```

In Astro templates:
```astro
<div v-if="gender === 'f'">[[ gender ]]</div>
```

This allows using both frameworks in the same file.
