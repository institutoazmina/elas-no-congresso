import assert from "node:assert/strict";
import { formatHouseJourney } from "./house-labels.ts";

assert.equal(formatHouseJourney("camara", "senado", "short"), "Câmara → Senado");
assert.equal(formatHouseJourney("camara", "senado", "full"), "Câmara dos Deputados → Senado Federal");
assert.equal(formatHouseJourney("senado", "camara", "short"), "Senado → Câmara");
assert.equal(formatHouseJourney("camara", null, "short"), "Câmara");
assert.equal(formatHouseJourney("senado", "senado", "full"), "Senado Federal");
