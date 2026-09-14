import assert from "node:assert/strict";
import { buildAlertsQueryUrl, parseAlertsQueryState } from "./query-state.ts";

assert.deepEqual(parseAlertsQueryState("https://example.com/alertas?q=Erika%20Hilton&page=2"), {
    q: "Erika Hilton",
    page: 2,
    sort: "newest",
});

assert.deepEqual(parseAlertsQueryState("https://example.com/alertas?q=%20%20&page=invalid"), {
    q: "",
    page: 1,
    sort: "newest",
});

assert.deepEqual(parseAlertsQueryState("https://example.com/alertas?sort=oldest"), {
    q: "",
    page: 1,
    sort: "oldest",
});

assert.equal(
    buildAlertsQueryUrl("https://example.com/alertas?tema=saude#resultados", { q: "  PL 5349/2026  ", page: 3, sort: "oldest" }).href,
    "https://example.com/alertas?tema=saude&q=PL+5349%2F2026&page=3&sort=oldest#resultados",
);

assert.equal(
    buildAlertsQueryUrl("https://example.com/alertas?q=mulher&page=4&sort=oldest", { q: "", page: 1, sort: "newest" }).href,
    "https://example.com/alertas",
);

console.log("ok");
