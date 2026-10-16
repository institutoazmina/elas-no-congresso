import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchNewsPage, resolveNewsImage, WP_NEWS_ENDPOINT } from "./wp.ts";

test("news requests encode filters and preserve pagination headers and cancellation", async (t) => {
    const posts = [{ date: "2026-01-01", link: "https://azmina.com.br/reportagem", title: { rendered: "Uma reportagem" } }];
    const signal = new AbortController().signal;
    t.mock.method(globalThis, "fetch", async (...[input, init]: Parameters<typeof fetch>) => {
        const url = new URL(String(input));
        assert.equal(url.origin + url.pathname, WP_NEWS_ENDPOINT);
        assert.deepEqual(Object.fromEntries(url.searchParams), {
            _embed: "wp:featuredmedia", per_page: "6", page: "2", offset: "0",
            search: "gênero & direitos", "tags[]": "0", orderby: "date", order: "desc",
        });
        assert.equal(init?.signal, signal);
        return Response.json(posts, { headers: { "x-wp-total": "19", "x-wp-totalpages": "4" } });
    });
    assert.deepEqual(await fetchNewsPage({ perPage: 6, page: 2, offset: 0, tagId: 0, search: "gênero & direitos", orderByDate: true, signal }), {
        posts, total: 19, totalPages: 4,
    });
});

test("news defaults omit optional filters and tolerate missing pagination headers", async (t) => {
    t.mock.method(globalThis, "fetch", async (...[input]: Parameters<typeof fetch>) => {
        assert.deepEqual(Object.fromEntries(new URL(String(input)).searchParams), {
            _embed: "wp:featuredmedia", per_page: "3", page: "1",
        });
        return Response.json([]);
    });
    assert.deepEqual(await fetchNewsPage({ perPage: 3 }), { posts: [], total: 0, totalPages: 0 });
});

for (const failure of ["http", "network", "json"] as const) {
    test(`news marks ${failure} failures as unavailable rather than a successful empty result`, async (t) => {
        t.mock.method(globalThis, "fetch", async () => {
            if (failure === "network") throw new TypeError("offline");
            return failure === "http" ? new Response("", { status: 502 }) : new Response("not json");
        });
        assert.deepEqual(await fetchNewsPage({ perPage: 3 }), { posts: [], total: 0, totalPages: 0, unavailable: true });
    });
}

test("news images prefer the article thumbnail, then source URL, then link", () => {
    assert.equal(resolveNewsImage({ media_details: { sizes: { "az-article-thumbnail-large": { source_url: "/thumb.jpg" } } }, source_url: "/original.jpg", link: "/attachment" }), "https://azmina.com.br/thumb.jpg");
    assert.equal(resolveNewsImage({ source_url: "/original.jpg", link: "/attachment" }), "https://azmina.com.br/original.jpg");
    assert.equal(resolveNewsImage({ link: "/attachment" }, "https://images.test"), "https://images.test/attachment");
    assert.equal(resolveNewsImage({ source_url: "https://images.test/photo.jpg" }), "https://images.test/photo.jpg");
    assert.equal(resolveNewsImage(undefined), undefined);
    assert.equal(resolveNewsImage({}), undefined);
    assert.equal(resolveNewsImage({ source_url: "http://[invalid" }), undefined);
});
