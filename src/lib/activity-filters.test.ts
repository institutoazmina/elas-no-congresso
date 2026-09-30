import assert from "node:assert/strict";
import {
    EMPTY_ACTIVITY_FILTERS,
    activityAssessment,
    filterActivityItems,
    getActivityCategories,
    getActivityStatuses,
    paginateActivityItems,
    type ActivityFilterItem,
    type ActivityFilterState,
} from "./activity-filters.ts";

const proposal = ({ numero, ...overrides }: Partial<ActivityFilterItem> & Pick<ActivityFilterItem, "numero">): ActivityFilterItem => ({
    numero,
    resumo: "Texto sobre proteção e direitos das mulheres",
    casa: "Deputado",
    year: 2024,
    favoravel: 1,
    situacao: "Em tramitação",
    movementsLast90Days: 2,
    avaliador: "Anis",
    comentario: "Parecer com ressalvas",
    categoria: null,
    parties: ["PT"],
    states: ["SP"],
    genders: ["F"],
    authors: [{ nome: "Ana Souza", partido: "PT", estado: "SP" }],
    ...overrides,
});

const ITEMS: ActivityFilterItem[] = [
    proposal({ numero: "PL 1/2024" }),
    proposal({
        numero: "PEC 20/2023",
        resumo: "Amplia o atendimento de saúde pública",
        casa: "Senador",
        year: 2023,
        favoravel: -1,
        situacao: "Arquivada",
        movementsLast90Days: 0,
        avaliador: "Themis",
        comentario: "",
        parties: ["PSD", "PVB"],
        states: ["RJ", "BA"],
        genders: ["M", "F"],
        authors: [
            { nome: "Bruno Lima", partido: "PSD", estado: "RJ" },
            { nome: "Carla Nunes", partido: "PVB", estado: "BA" },
        ],
    }),
    proposal({
        numero: "PLP 9/2022",
        resumo: "Cria política de educação inclusiva",
        year: 2022,
        favoravel: 0,
        situacao: null,
        movementsLast90Days: 0,
        avaliador: "Organização cadastrada",
        comentario: null,
        parties: ["PSOL"],
        states: ["MG"],
        authors: [{ nome: "Dora Alves", partido: "PSOL", estado: "MG" }],
    }),
];

const withFilters = (overrides: Partial<ActivityFilterState>): ActivityFilterState => ({ ...EMPTY_ACTIVITY_FILTERS, ...overrides });

// Busca: parlamentar, código e termo textual da ementa/resumo.
assert.deepStrictEqual(filterActivityItems(ITEMS, withFilters({ search: "Carla Nunes" })).map((item) => item.numero), ["PEC 20/2023"]);
assert.deepStrictEqual(filterActivityItems(ITEMS, withFilters({ search: "PLP 9/2022" })).map((item) => item.numero), ["PLP 9/2022"]);
assert.deepStrictEqual(filterActivityItems(ITEMS, withFilters({ search: "saúde pública" })).map((item) => item.numero), ["PEC 20/2023"]);

// Filtros principais e partido de qualquer pessoa que assina a proposição.
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ house: "Senador" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ year: "2024" })).length, 1);
assert.deepStrictEqual(filterActivityItems(ITEMS, withFilters({ party: "PVB" })).map((item) => item.numero), ["PEC 20/2023"]);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ assessment: "favorable" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ assessment: "unfavorable" })).length, 1);
assert.deepStrictEqual(filterActivityItems(ITEMS, withFilters({ assessment: "unrated" })).map((item) => item.numero), ["PLP 9/2022"]);
assert.strictEqual(activityAssessment(0), "unrated");
assert.deepStrictEqual(filterActivityItems(ITEMS, withFilters({ status: "Arquivada" })).map((item) => item.numero), ["PEC 20/2023"]);
assert.deepStrictEqual(filterActivityItems(ITEMS, withFilters({ movements: "with" })).map((item) => item.numero), ["PL 1/2024"]);
assert.deepStrictEqual(filterActivityItems(ITEMS, withFilters({ movements: "without" })).map((item) => item.numero), ["PEC 20/2023", "PLP 9/2022"]);
assert.deepStrictEqual(getActivityStatuses([{ situacao: " Arquivada " }, { situacao: "Arquivada" }, { situacao: null }]), ["Arquivada"]);

// Avançados e combinações.
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ gender: "M" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ state: "BA" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ evaluator: "Themis" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ comments: "yes" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ comments: "no" })).length, 2);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ house: "Senador", year: "2023" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ year: "2024", party: "PT" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ year: "2023", assessment: "unfavorable" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ party: "PVB", assessment: "unfavorable" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ search: "Bruno", house: "Senador" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ gender: "F", state: "BA", evaluator: "Themis", comments: "no" })).length, 1);

// Resultado único, zero resultados e reset para o estado integral.
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ year: "2022" })).length, 1);
assert.strictEqual(filterActivityItems(ITEMS, withFilters({ year: "1900" })).length, 0);
assert.deepStrictEqual(filterActivityItems(ITEMS, { ...EMPTY_ACTIVITY_FILTERS }), ITEMS);

// Categoria só é disponibilizada quando a fonte realmente a fornece.
assert.deepStrictEqual(getActivityCategories(ITEMS), []);
const categorized = [proposal({ numero: "PL 2/2024", categoria: "Saúde" })];
assert.deepStrictEqual(getActivityCategories(categorized), ["Saúde"]);
assert.strictEqual(filterActivityItems(categorized, withFilters({ category: "Saúde" })).length, 1);

// Paginação nunca deixa a interface em uma página vazia após redução do filtro.
assert.deepStrictEqual(paginateActivityItems([1, 2, 3], 10, 2), { page: 2, pageCount: 2, items: [3] });
assert.deepStrictEqual(paginateActivityItems([1], 10, 10), { page: 1, pageCount: 1, items: [1] });

console.log("ok");
