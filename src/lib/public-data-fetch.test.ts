import assert from "node:assert/strict";
import { test } from "node:test";
import { createResponseCache, fetchPublicData } from "./public-data-fetch.ts";

test("public data cache deduplicates concurrent GETs with independently readable responses", async () => {
    let requests = 0;
    const cached = createResponseCache(async () => {
        requests++;
        return Response.json({ count: 7 }, { headers: { "x-wp-total": "7" } });
    });
    const [first, second] = await Promise.all([cached("https://example.test"), cached("https://example.test")]);
    assert.equal(requests, 1);
    assert.deepEqual(await first.json(), { count: 7 });
    assert.deepEqual(await second.json(), { count: 7 });
    assert.equal(second.headers.get("x-wp-total"), "7");
});

test("failed public responses and network errors can be retried", async () => {
    let requests = 0;
    const cached = createResponseCache(async () => {
        requests++;
        if (requests === 1) throw new Error("offline");
        return new Response("", { status: requests === 2 ? 502 : 200 });
    });
    await assert.rejects(cached("https://example.test"), /offline/);
    assert.equal((await cached("https://example.test")).status, 502);
    assert.equal((await cached("https://example.test")).status, 200);
    assert.equal(requests, 3);
});

test("expired public data is fetched again", async () => {
    let requests = 0;
    const cached = createResponseCache(async () => Response.json(++requests), 0);
    assert.equal(await (await cached("https://example.test")).json(), 1);
    assert.equal(await (await cached("https://example.test")).json(), 2);
});

test("cache keys share string and URL inputs but keep query parameters distinct", async () => {
    let requests = 0;
    const cached = createResponseCache(async () => Response.json(++requests));
    assert.equal(await (await cached(new URL("https://example.test/?page=1"))).json(), 1);
    assert.equal(await (await cached("https://example.test/?page=1")).json(), 1);
    assert.equal(await (await cached("https://example.test/?page=2")).json(), 2);
});

test("cache evicts the oldest entry after reaching its 100 URL bound", async () => {
    let requests = 0;
    const cached = createResponseCache(async () => Response.json(++requests));
    for (let index = 0; index <= 100; index++) await cached(`https://example.test/${index}`);
    assert.equal(await (await cached("https://example.test/100")).json(), 101);
    assert.equal(await (await cached("https://example.test/0")).json(), 102);
});

test("an expired request failing does not evict its newer replacement", async (t) => {
    let now = 0;
    t.mock.method(Date, "now", () => now);
    let rejectFirst!: (error: Error) => void;
    let requests = 0;
    const cached = createResponseCache(async () => {
        if (++requests === 1) return new Promise<Response>((_resolve, reject) => { rejectFirst = reject; });
        return Response.json("new response");
    }, 100);
    const first = cached("https://example.test");
    const failure = assert.rejects(first, /old request failed/);
    now = 101;
    await cached("https://example.test");
    rejectFirst(new Error("old request failed"));
    await failure;
    assert.equal(await (await cached("https://example.test")).json(), "new response");
    assert.equal(requests, 2);
});

test("production requests bypass the cache and receive a timeout signal", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async (...[_input, init]: Parameters<typeof fetch>) => {
        assert.ok(init?.signal instanceof AbortSignal);
        assert.equal(init.signal.aborted, false);
        return Response.json({ ok: true });
    });
    await fetchPublicData("https://example.test");
    await fetchPublicData("https://example.test");
    assert.equal(fetchMock.mock.callCount(), 2);
});
