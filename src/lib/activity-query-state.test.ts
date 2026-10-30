import assert from "node:assert/strict";
import { buildActivityPaginationUrl, parseActivityPagination } from "./activity-query-state.ts";

assert.deepEqual(parseActivityPagination("https://example.com/atividade-legislativa?pagina=3&itens_por_pagina=20"), {
    page: 3,
    pageSize: 20,
});
assert.deepEqual(parseActivityPagination("https://example.com/atividade-legislativa?pagina=invalid&itens_por_pagina=12"), {
    page: 1,
    pageSize: null,
});
assert.equal(
    buildActivityPaginationUrl("https://example.com/atividade-legislativa?tema=saude#resultados", {
        page: 2,
        pageSize: 5,
    }).href,
    "https://example.com/atividade-legislativa?tema=saude&pagina=2&itens_por_pagina=5#resultados",
);
assert.equal(
    buildActivityPaginationUrl("https://example.com/atividade-legislativa?pagina=4&itens_por_pagina=50", {
        page: 1,
        pageSize: null,
    }).href,
    "https://example.com/atividade-legislativa",
);
assert.deepEqual(parseActivityPagination("https://example.com/atividade-legislativa?page=2&page_size=10"), {
    page: 2,
    pageSize: 10,
});
assert.equal(
    buildActivityPaginationUrl("https://example.com/atividade-legislativa?page=2&page_size=10", {
        page: 3,
        pageSize: 20,
    }).href,
    "https://example.com/atividade-legislativa?pagina=3&itens_por_pagina=20",
);

console.log("ok");
