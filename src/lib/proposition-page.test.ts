import assert from "node:assert/strict";
import test from "node:test";
import { propositionRoute, propositionSlug } from "./proposition-utils.ts";

test("slug da proposição usa tipo, número e ano", () => {
  assert.equal(propositionSlug("PL 69/2025"), "pl-69-2025");
  assert.equal(propositionSlug("PEC 17/2025"), "pec-17-2025");
  assert.equal(propositionSlug(" PL  1338/2022 "), "pl-1338-2022");
  assert.equal(propositionRoute("PRS 14/2023"), "/atividade-legislativa/proposicao/prs-14-2023");
});
