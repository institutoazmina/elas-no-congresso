import assert from "node:assert/strict";
import { test } from "node:test";
import { activityAssessment } from "./activity-filters.ts";

test("assessment distinguishes favorable, unfavorable and unrated propositions", () => {
    for (const value of [1, 100, 0.5]) assert.equal(activityAssessment(value), "favorable");
    for (const value of [-1, -100, -0.5]) assert.equal(activityAssessment(value), "unfavorable");
    assert.equal(activityAssessment(0), "unrated");
});
