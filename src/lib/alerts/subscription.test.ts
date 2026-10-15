import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { requestDailySubscription, type DailySubscription } from "./subscription.ts";

const subscription: DailySubscription = {
    email: "teste@example.com",
    acceptedTerms: true,
    categories: ["saude"],
    house: "camara",
    propositions: [4242],
};
const realFetch = globalThis.fetch;
afterEach(() => {
    globalThis.fetch = realFetch;
});

function answer(status: number) {
    const calls: [string, RequestInit][] = [];
    globalThis.fetch = (async (url: string, init: RequestInit) => {
        calls.push([url, init]);
        return new Response(null, { status });
    }) as typeof fetch;
    return calls;
}

test("posts the daily alert with its criteria tree", async () => {
    const calls = answer(201);

    const outcome = await requestDailySubscription("https://api.test/v1", subscription, new AbortController().signal);

    assert.equal(outcome, "sent");
    const [url, init] = calls[0]!;
    assert.equal(url, "https://api.test/v1/subscriptions/");
    assert.deepEqual(JSON.parse(String(init.body)), {
        email: "teste@example.com",
        accepted_terms: true,
        alerts: [
            {
                frequency: "daily",
                ast: {
                    op: "AND",
                    children: [
                        { field: "categoria", op: "in", value: ["saude"] },
                        { field: "casa", op: "eq", value: "camara" },
                        { field: "proposicao", op: "in", value: [4242] },
                    ],
                },
            },
        ],
    });
});

test("429 is a rate limit, not a failure", async () => {
    answer(429);
    assert.equal(await requestDailySubscription("https://api.test/v1", subscription, new AbortController().signal), "rate-limited");
});

test("other error statuses throw", async () => {
    answer(500);
    await assert.rejects(requestDailySubscription("https://api.test/v1", subscription, new AbortController().signal));
});
