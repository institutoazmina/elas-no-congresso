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

## Data Strategy

Legislative data is fetched from the public API. Static proposition and author routes
are generated from `GET /api/v1/activity/?limit=5000`; the activity explorer fetches
the same read model in the browser.

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
