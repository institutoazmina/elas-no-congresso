import assert from "node:assert/strict";
import { test } from "node:test";
import { createBuildFetcher } from "./public-data-fetch.ts";

test("build fetch retries transient HTTP failures and releases failed responses", async (t) => {
    const warnings = t.mock.method(console, "warn", () => {});
    const responses = [new Response("bad gateway", { status: 502 }), new Response("unavailable", { status: 503 }), Response.json([42])];
    const signals: AbortSignal[] = [];
    const delays: number[] = [];
    let requests = 0;
    const load = createBuildFetcher(async (url, init) => {
        assert.equal(url, "https://api.test/activity");
        assert.ok(init?.signal instanceof AbortSignal);
        signals.push(init.signal);
        return responses[requests++];
    }, async (delay) => { delays.push(delay); });

    assert.deepEqual(await (await load("https://api.test/activity")).json(), [42]);
    assert.deepEqual(delays, [500, 1000]);
    assert.equal(new Set(signals).size, 3, "each attempt gets a fresh timeout signal");
    assert.ok(responses[0].bodyUsed && responses[1].bodyUsed);
    assert.match(String(warnings.mock.calls[0].arguments[0]), /https:\/\/api.test\/activity.*502/);
});

for (const failure of [new TypeError("network down"), new DOMException("slow API", "TimeoutError")]) {
    test(`build fetch recovers from ${failure.name} without caching the next request`, async (t) => {
        t.mock.method(console, "warn", () => {});
        let requests = 0;
        const load = createBuildFetcher(async () => {
            if (++requests === 1) throw failure;
            return Response.json(requests);
        }, async () => {});
        assert.equal(await (await load("https://api.test")).json(), 2);
        assert.equal(await (await load("https://api.test")).json(), 3);
    });
}

test("persistent build timeouts stop after three attempts with the failing URL", async (t) => {
    t.mock.method(console, "warn", () => {});
    const failure = new DOMException("slow API", "TimeoutError");
    let requests = 0;
    const load = createBuildFetcher(async () => { requests++; throw failure; }, async () => {});
    await assert.rejects(load("https://api.test/activity"), (error: Error) => {
        assert.match(error.message, /https:\/\/api.test\/activity.*3 tentativa/);
        assert.equal(error.cause, failure);
        return true;
    });
    assert.equal(requests, 3);
});

test("persistent HTTP errors preserve the final response for callers", async (t) => {
    t.mock.method(console, "warn", () => {});
    let requests = 0;
    const load = createBuildFetcher(async () => {
        requests++;
        return new Response("gateway timeout", { status: 504 });
    }, async () => {});
    const response = await load("https://api.test");
    assert.equal(response.status, 504);
    assert.equal(await response.text(), "gateway timeout");
    assert.equal(requests, 3);
});

for (const status of [400, 401, 404, 422, 500]) {
    test(`build fetch does not retry HTTP ${status}`, async () => {
        let requests = 0;
        const load = createBuildFetcher(async () => {
            requests++;
            return new Response("invalid request", { status });
        }, async () => { assert.fail("Unexpected retry"); });
        assert.equal((await load("https://api.test")).status, status);
        assert.equal(requests, 1);
    });
}

test("build fetch does not retry aborts or unexpected exceptions", async () => {
    for (const failure of [new DOMException("cancelled", "AbortError"), new Error("unexpected")]) {
        let requests = 0;
        const load = createBuildFetcher(async () => { requests++; throw failure; }, async () => { assert.fail("Unexpected retry"); });
        await assert.rejects(load("https://api.test"), { cause: failure });
        assert.equal(requests, 1);
    }
});
