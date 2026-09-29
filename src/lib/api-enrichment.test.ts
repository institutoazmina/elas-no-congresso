import assert from "node:assert/strict";
import {
    getApiDetail,
    getPropositionCategory,
    getTaxonomyCategories,
    getTaxonomyLabels,
    majorityTheme,
} from "./api-enrichment.ts";

// Match API: proposição curada conhecida (PDL 176/2021, Câmara).
const pdl176 = getApiDetail("Deputado", "PDL 176/2021");
assert.ok(pdl176, "PDL 176/2021 deve ter match na API");
assert.equal(pdl176?.apresentada_em, "2021-04-26");
assert.ok(typeof pdl176?.situacao === "string" || pdl176?.situacao === null);
// Nunca expomos datas técnicas do sistema.
assert.ok(!("created_at" in (pdl176 ?? {})), "created_at não pode vazar");
assert.ok(!("updated_at" in (pdl176 ?? {})), "updated_at não pode vazar");

// Whitespace duplicado resolve para o mesmo detalhe.
assert.deepEqual(getApiDetail("Deputado", "PL  1338/2022"), getApiDetail("Deputado", "PL 1338/2022"));

// Sem match (uma das 88): null, fallback local assume.
assert.equal(getApiDetail("Senador", "PEC 18/2021"), null);

// Categoria editorial via dataset.theme.
assert.equal(getPropositionCategory("Deputado", "PDL 176/2021"), "Direitos Sexuais e Reprodutivos");
// Com match mas sem anotação (PL 6113/2023): null, não inventar.
assert.equal(getPropositionCategory("Deputado", "PL 6113/2023"), null);
// Sem match: null.
assert.equal(getPropositionCategory("Senador", "PEC 18/2021"), null);

// Taxonomia oficial: 10 categorias, sem fictícias.
const cats = getTaxonomyCategories();
assert.equal(cats.length, 10);
assert.ok(cats.some((c) => c.value === "saude" && c.label === "Saúde"));
assert.deepEqual(getTaxonomyLabels(), [...getTaxonomyLabels()].sort((a, b) => a.localeCompare(b, "pt-BR")));

// Tema majoritário: mais frequente vence; empate = primeiro; vazio = null.
assert.equal(majorityTheme([{ theme: "Saúde" }, { theme: "Saúde" }, { theme: "Gênero" }]), "Saúde");
assert.equal(majorityTheme([{ theme: "A" }, { theme: "B" }]), "A");
assert.equal(majorityTheme([{ theme: null }, {}]), null);
assert.equal(majorityTheme([]), null);

// quiteria_prob=false (691 casos) NÃO é celeridade: nenhum helper aqui o converte.
// (garantia por ausência: este módulo não importa propositionStatus.)

console.log("api-enrichment.test.ts: OK");
