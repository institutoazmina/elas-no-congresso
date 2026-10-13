import assert from "node:assert/strict";
import test from "node:test";

import { API_PAGE_SIZE, fetchAllPages } from "./api-pages.ts";

const pagedApi = (total: number) => {
    const requested: string[] = [];
    const fetchJson = async (url: string) => {
        requested.push(url);
        const params = new URL(url).searchParams;
        const limit = Number(params.get("limit"));
        const offset = Number(params.get("offset"));
        assert.ok(limit <= API_PAGE_SIZE, "a API recusa limit acima do teto");
        const items = Array.from({ length: Math.max(0, Math.min(limit, total - offset)) }, (_, index) => offset + index);
        return { items, count: total };
    };
    return { requested, fetchJson };
};

test("percorre todas as páginas sem pedir mais que o teto da API", async () => {
    const api = pagedApi(2_350);

    const items = await fetchAllPages("https://api.test/v1/legislatures/parliamentarians?house=camara", api.fetchJson);

    assert.equal(items.length, 2_350);
    assert.deepEqual(items.slice(998, 1_002), [998, 999, 1_000, 1_001]);
    assert.deepEqual(api.requested, [
        "https://api.test/v1/legislatures/parliamentarians?house=camara&limit=1000&offset=0",
        "https://api.test/v1/legislatures/parliamentarians?house=camara&limit=1000&offset=1000",
        "https://api.test/v1/legislatures/parliamentarians?house=camara&limit=1000&offset=2000",
    ]);
});

test("uma página só quando tudo cabe nela", async () => {
    const api = pagedApi(40);

    const items = await fetchAllPages("https://api.test/v1/legislatures/parties", api.fetchJson);

    assert.equal(items.length, 40);
    assert.deepEqual(api.requested, ["https://api.test/v1/legislatures/parties?limit=1000&offset=0"]);
});

test("para numa página vazia mesmo se o total anunciado não bater", async () => {
    const requested: string[] = [];
    const items = await fetchAllPages<number>("https://api.test/v1/x", async (url) => {
        requested.push(url);
        return requested.length === 1 ? { items: [1, 2], count: 5 } : { items: [], count: 5 };
    }, 2);

    assert.deepEqual(items, [1, 2]);
    assert.equal(requested.length, 2);
});
