import assert from "node:assert/strict";
import { test } from "node:test";
import { createResponseCache } from "./public-data-fetch.ts";

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
