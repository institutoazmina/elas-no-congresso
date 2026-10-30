import assert from "node:assert/strict";
import { buildAlertsQueryUrl, parseAlertsQueryState } from "./query-state.ts";

assert.deepEqual(parseAlertsQueryState("https://example.com/alertas?busca=Erika%20Hilton&pagina=2"), {
    q: "Erika Hilton",
    page: 2,
    sort: "newest",
});

assert.deepEqual(parseAlertsQueryState("https://example.com/alertas?busca=%20%20&pagina=invalid"), {
    q: "",
    page: 1,
    sort: "newest",
});

assert.deepEqual(parseAlertsQueryState("https://example.com/alertas?ordem=antigos"), {
    q: "",
    page: 1,
    sort: "oldest",
});

assert.equal(
    buildAlertsQueryUrl("https://example.com/alertas?tema=saude#resultados", { q: "  PL 5349/2026  ", page: 3, sort: "oldest" }).href,
    "https://example.com/alertas?tema=saude&busca=PL+5349%2F2026&pagina=3&ordem=antigos#resultados",
);

assert.equal(
    buildAlertsQueryUrl("https://example.com/alertas?q=mulher&page=4&sort=oldest", { q: "", page: 1, sort: "newest" }).href,
    "https://example.com/alertas",
);

assert.deepEqual(parseAlertsQueryState("https://example.com/alertas?q=Erika&page=2&sort=oldest"), {
    q: "Erika",
    page: 2,
    sort: "oldest",
});
assert.equal(
    buildAlertsQueryUrl("https://example.com/alertas?q=Erika&page=2&sort=oldest", {
        q: "Maria",
        page: 3,
        sort: "oldest",
    }).href,
    "https://example.com/alertas?busca=Maria&pagina=3&ordem=antigos",
);

console.log("ok");
