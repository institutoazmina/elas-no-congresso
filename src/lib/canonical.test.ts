import assert from "node:assert";
import { extractPropositionYear, formatPresentedDate, isValidLegislativeYear } from "./canonical.ts";

// year=0 da API é inválido; nunca gerar "Ano 0".
assert.equal(isValidLegislativeYear(0), false);
assert.equal(isValidLegislativeYear(2021), true);
assert.equal(isValidLegislativeYear(1899), false);
assert.equal(isValidLegislativeYear("2021"), false);

// Ano: presented_at (legislativo) tem prioridade; fallback número; 0 se nenhum.
assert.equal(extractPropositionYear("2021-04-26", "PDL 176/2021"), 2021);
assert.equal(extractPropositionYear(null, "PDL 176/2021"), 2021);
assert.equal(extractPropositionYear("2026-09-25", "SBT 2/0"), 2026);
assert.equal(extractPropositionYear(null, "SBT 2/0"), 0);

// Formatação pt-BR; inválido vira "Indisponível" (nunca data técnica).
assert.equal(formatPresentedDate("2021-04-26"), "26/04/2021");
assert.equal(formatPresentedDate(null), "Indisponível");
assert.equal(formatPresentedDate("não-data"), "Indisponível");

console.log("canonical.test.ts: OK");
