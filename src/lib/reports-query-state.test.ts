import assert from "node:assert/strict";
import { buildReportsPageUrl, parseReportsPage } from "./reports-query-state.ts";

assert.equal(parseReportsPage("https://example.com/reportagens?pagina=3"), 3);
assert.equal(parseReportsPage("https://example.com/reportagens?pagina=invalid"), 1);
assert.equal(
    buildReportsPageUrl("https://example.com/reportagens?tema=saude#lista", 4).href,
    "https://example.com/reportagens?tema=saude&pagina=4#lista",
);
assert.equal(buildReportsPageUrl("https://example.com/reportagens?pagina=4", 1).href, "https://example.com/reportagens");

console.log("ok");
