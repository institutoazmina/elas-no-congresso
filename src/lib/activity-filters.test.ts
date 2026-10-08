import assert from "node:assert/strict";
import { activityAssessment } from "./activity-filters.ts";
assert.strictEqual(activityAssessment(0), "unrated");

console.log("ok");
