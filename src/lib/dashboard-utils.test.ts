import assert from "node:assert/strict";
import { DEFAULT_DASHBOARD_ORDER, MIN_PROPOSICOES_POR_PARLAMENTAR } from "./dashboard-utils.ts";

assert.strictEqual(DEFAULT_DASHBOARD_ORDER, "unfavorable");
assert.strictEqual(MIN_PROPOSICOES_POR_PARLAMENTAR, 5);

console.log("ok");
