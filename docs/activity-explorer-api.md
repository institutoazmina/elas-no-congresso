# API da atividade legislativa

A página `/atividade-legislativa` usa `GET /api/v1/activity/explorer`.
O servidor filtra a coleção pública completa antes da paginação e devolve
`items`, `total`, `page`, `page_count`, `options`, `summary` e `dashboard`.
O frontend apenas envia os controles e apresenta a resposta: não filtra
proposições, deriva opções, ordena dados, agrega autorias ou calcula percentuais.

Os filtros são `search`, `house`, `year_start`, `year_end`, `party`, `category`,
`assessment`, `celerity`, `movements`, `gender`, `state`, `religion`,
`comments` e `evaluator`. Os controles adicionais são `page`, `page_size`,
`sort`, `direction`, `party_sort`, `author_sort` e `author_minimum`.

O período usa o ano de apresentação, com limites inclusivos. `year_start`
sozinho seleciona esse ano e os seguintes; `year_end` sozinho seleciona
esse ano e os anteriores. Limites vazios não restringem o período.
Um início posterior ao fim retorna HTTP 422. O parâmetro legado `year`
continua disponível para um ano exato. O período conta como um único filtro.

O controle de ano usa Popover e Select do Base UI. As opções vêm de
`options.year`, e as versões desktop, mobile e “Apresentada em” compartilham
o mesmo período. Nenhuma seleção filtra dados no navegador.

`options.religion` contém pares `value` / `label` derivados dos
parlamentares que assinam proposições públicas dos tipos admitidos.
As opções permanecem disponíveis ao combinar filtros ou mudar de página.
`__unknown__` seleciona parlamentares sem religião preenchida;
autorias institucionais não entram nesse recorte. Valores como “Sem Religião”
continuam sendo identidades distintas, preservadas da fonte.

Religião, gênero e UF precisam coincidir na mesma autoria. Os painéis por
autoria, partido, gênero e UF consideram apenas as autorias que correspondem
a esse recorte, sem duplicar assinaturas da mesma pessoa na mesma proposição.
Os totais e os demais painéis consideram proposições únicas do resultado completo.

`GET /api/v1/activity/explorer/export` aceita os mesmos parâmetros e
exporta todas as proposições do recorte, independentemente da página atual.

Publique a API com esses endpoints antes de publicar o frontend.
Para desenvolvimento com a API local, configure
`PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1 npm run dev`;
o proxy de desenvolvimento usa essa origem.
