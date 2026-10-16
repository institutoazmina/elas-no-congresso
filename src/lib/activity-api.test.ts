import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchActivity, fetchEnactedProjects, fetchFastUnfavorable, fetchSlowFavorable } from "./activity-api.ts";

const endpoints = [
    [fetchActivity, "/activity?limit=5000"],
    [fetchFastUnfavorable, "/activity/fast-unfavorable"],
    [fetchSlowFavorable, "/activity/slow-favorable"],
    [fetchEnactedProjects, "/activity/enacted-projects?limit=50"],
] as const;

for (const [load, endpoint] of endpoints) {
    test(`${endpoint} preserves API data and forwards cancellation`, async (t) => {
        const data = [{ id: 42, is_favorable: false, authors: [] }];
        const controller = new AbortController();
        const fetchMock = t.mock.method(globalThis, "fetch", async (...[input, init]: Parameters<typeof fetch>) => {
            assert.equal(input, `https://api.test/v1${endpoint}`);
            assert.equal(init?.signal, controller.signal);
            return Response.json(data);
        });

        assert.deepEqual(await load("https://api.test/v1/", controller.signal), data);
        assert.equal(fetchMock.mock.callCount(), 1);
    });

    test(`${endpoint} rejects an HTTP error instead of presenting empty data`, async (t) => {
        t.mock.method(globalThis, "fetch", async () => new Response("unavailable", { status: 503 }));
        await assert.rejects(load("https://api.test/v1"), /status 503/);
    });
}

test("activity propagates network failures and invalid JSON", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", async (): Promise<Response> => {
        throw new TypeError("offline");
    });
    await assert.rejects(fetchActivity("https://api.test/v1"), /offline/);
    fetchMock.mock.mockImplementation(async () => new Response("invalid json"));
    await assert.rejects(fetchActivity("https://api.test/v1"), SyntaxError);
});

test("activity preserves an abort error so callers can ignore cancelled searches", async (t) => {
    const controller = new AbortController();
    controller.abort();
    t.mock.method(globalThis, "fetch", async (...[_input, init]: Parameters<typeof fetch>): Promise<Response> => {
        init?.signal?.throwIfAborted();
        throw new Error("Expected an aborted signal");
    });
    await assert.rejects(fetchActivity("https://api.test/v1", controller.signal), { name: "AbortError" });
});
