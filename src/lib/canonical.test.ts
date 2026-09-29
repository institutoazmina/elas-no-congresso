import assert from "node:assert";
import {
    canonicalPropositionKey,
    extractPropositionYear,
    formatPresentedDate,
    isCanonicalNumero,
    isValidLegislativeYear,
    normalizeCasaKey,
    normalizeEvaluatorKey,
    normalizeNumero,
} from "./canonical.ts";

// Normalização de número: trim + colapso de whitespace + uppercase.
assert.equal(normalizeNumero("PL  1338/2022"), "PL 1338/2022");
assert.equal(normalizeNumero("  pdl 176/2021 "), "PDL 176/2021");
assert.equal(normalizeNumero(null), "");

// Whitespace duplicado: mesma chave canônica (os 11 pares do dados.json).
assert.equal(
    canonicalPropositionKey("Deputado", "PL  1338/2022"),
    canonicalPropositionKey("Deputado", "PL 1338/2022"),
);
assert.equal(canonicalPropositionKey("Deputado", "PL 1338/2022"), "CAMARA|PL 1338/2022");

// Casa: convenções das duas bases convergem.
assert.equal(normalizeCasaKey("Deputado"), "CAMARA");
assert.equal(normalizeCasaKey("camara"), "CAMARA");
assert.equal(normalizeCasaKey("Câmara"), "CAMARA");
assert.equal(normalizeCasaKey("Senador"), "SENADO");
assert.equal(normalizeCasaKey("senado"), "SENADO");
assert.equal(canonicalPropositionKey("Senado", "PEC 18/2021"), "SENADO|PEC 18/2021");
// Desconhecida nunca vira silenciosamente Câmara.
assert.equal(normalizeCasaKey("Poder Executivo"), "PODER EXECUTIVO");

// Avaliador: agrupamento sem alterar texto editorial.
assert.equal(normalizeEvaluatorKey("Cfemea"), normalizeEvaluatorKey("CFEMEA"));
assert.equal(normalizeEvaluatorKey("deFEMde"), normalizeEvaluatorKey("deFemde"));
assert.notEqual(normalizeEvaluatorKey("Anis"), normalizeEvaluatorKey("Themis"));

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

// Colisões: forma sem espaço duplo é a canônica (URL única).
assert.equal(isCanonicalNumero("PL 1338/2022"), true);
assert.equal(isCanonicalNumero("PL  1338/2022"), false);
assert.equal(isCanonicalNumero("  PL 1338/2022"), false);
assert.equal(isCanonicalNumero(""), false);

console.log("canonical.test.ts: OK");
