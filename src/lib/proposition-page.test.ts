import assert from "node:assert/strict";
import test from "node:test";
import { propositionAssessment, propositionRoute, propositionSlug, propositionStatus } from "./proposition-utils.ts";

test("slug da proposição usa tipo, número e ano", () => {
  assert.equal(propositionSlug("PL 69/2025"), "pl-69-2025");
  assert.equal(propositionSlug("PEC 17/2025"), "pec-17-2025");
  assert.equal(propositionSlug(" PL  1338/2022 "), "pl-1338-2022");
  assert.equal(propositionRoute("PRS 14/2023"), "/propostas-e-votacoes/proposicao/prs-14-2023");
});

test("avaliação e status preservam as regras da atividade", () => {
  assert.equal(propositionAssessment(1), "Favorável");
  assert.equal(propositionAssessment(-1), "Desfavorável");
  assert.equal(propositionAssessment(0), "Sem avaliação");
  assert.equal(propositionStatus(0.55), "Rápida");
  assert.equal(propositionStatus(0.2), "Lenta");
  assert.equal(propositionStatus(null), "Indisponível");
});
