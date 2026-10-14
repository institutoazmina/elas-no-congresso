import assert from "node:assert/strict";
import { DEFAULT_DASHBOARD_ORDER, MIN_PROPOSITIONS_PER_PARLIAMENTARIAN } from "./dashboard-utils.ts";

assert.strictEqual(DEFAULT_DASHBOARD_ORDER, "unfavorable");
assert.strictEqual(MIN_PROPOSITIONS_PER_PARLIAMENTARIAN, 5);

console.log("ok");
