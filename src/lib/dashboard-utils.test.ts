// Testes das regras dos painéis da página "Propostas e votações" (ETAPA 1).
// Rodar: node --experimental-strip-types src/lib/dashboard-utils.test.ts
//
// A fixture abaixo tem TODOS os valores esperados calculados manualmente.
// Nunca usar as funções de produção para gerar os valores esperados.
import assert from "node:assert/strict";
import {
    DESKTOP_ITEMS_PER_PAGE,
    MOBILE_ITEMS_PER_PAGE,
    getDefaultItemsPerPage,
    calculateUnfavorableRate,
    calculateFavorableRate,
    sortDashboardRows,
    deduplicateAuthorsByPerson,
    groupCanetadasByParty,
    aggregateAuthorships,
    countAuthorProposals,
    filterAuthorsByMinProposals,
    normalizeGenderCode,
    GENDER_LABELS,
    normalizeUfCode,
    normalizeCasa,
    CASA_LABELS,
    personKey,
    createQualityCollector,
    buildDashboardRow,
    getSingleDashboardResultMessage,
    DEFAULT_DASHBOARD_ORDER,
    MIN_PROPOSICOES_POR_PARLAMENTAR,
    PARTY_COUNT_MODE,
    GENDER_COUNT_MODE,
    UF_COUNT_MODE,
    normalizeUnavailable,
    type AuthorLike,
    type DashboardRow,
} from "./dashboard-utils.ts";

assert.strictEqual(getDefaultItemsPerPage(true), MOBILE_ITEMS_PER_PAGE);
assert.strictEqual(getDefaultItemsPerPage(false), DESKTOP_ITEMS_PER_PAGE);

const makeRow = (key: string, label: string, favorable: number, unfavorable: number): DashboardRow =>
    ({ key, label, favorable, unfavorable });

// ---------------------------------------------------------------------------
// Configurações provisórias (ETAPA 1, aguardando validação editorial).
// ---------------------------------------------------------------------------
assert.strictEqual(DEFAULT_DASHBOARD_ORDER, "unfavorable");
assert.strictEqual(MIN_PROPOSICOES_POR_PARLAMENTAR, 5);
assert.strictEqual(PARTY_COUNT_MODE, "all-unique-authorships");
assert.strictEqual(GENDER_COUNT_MODE, "all-unique-authorships");
assert.strictEqual(UF_COUNT_MODE, "all-unique-authorships");

const singleRow = [makeRow("PT", "PT", 1, 0)];
assert.strictEqual(getSingleDashboardResultMessage("party", singleRow), "Para ver mais partidos, tente remover filtros.");
assert.strictEqual(getSingleDashboardResultMessage("author", singleRow), "Para ver mais parlamentares, tente remover filtros.");
assert.strictEqual(getSingleDashboardResultMessage("party", []), null);

// ---------------------------------------------------------------------------
// Fixture determinística (valores esperados calculados à mão).
//
// P1: fav, Deputado, [Ana(PT,F,SP), Bruno(PT,M,RJ), Bruno repetido, Carla(PSDB,F,MG)]
// P2: desfav, Senador, [Bruno, Diego(PL,M,SP)]
// P3: sem avaliação (0), Deputado, [Elisa(sem partido,F,BA)]
// P4: fav, Poder Executivo, [Fábio(PT,M,RJ)]
// P5: desfav, Deputado, [Gilda(sem numero,PT,F,SP), Helena(sem numero,PSDB,F,MG)]
// P6: fav, Deputado, [Ivo(PT, genero "Ivo Nunes", estado "XX" — inválidos)]
//
// Resumo esperado: fav=3, desfav=2, sem avaliação=1, total=6, taxa=2/5=0.4.
// Autorias únicas: P1=3, P2=2, P3=1, P4=1, P5=2, P6=1 → total 10.
// ---------------------------------------------------------------------------
const ANA: AuthorLike = { numero: 1, nome: "Ana", partido: "PT", genero: "F", estado: "SP" };
const BRUNO: AuthorLike = { numero: 2, nome: "Bruno", partido: "PT", genero: "M", estado: "RJ" };
const CARLA: AuthorLike = { numero: 3, nome: "Carla", partido: "PSDB", genero: "F", estado: "MG" };
const DIEGO: AuthorLike = { numero: 4, nome: "Diego", partido: "PL", genero: "M", estado: "SP" };
const ELISA: AuthorLike = { numero: 5, nome: "Elisa", partido: "", genero: "F", estado: "BA" };
const FABIO: AuthorLike = { numero: 6, nome: "Fábio", partido: "PT", genero: "M", estado: "RJ" };
const GILDA: AuthorLike = { nome: "Gilda Santos", partido: "PT", genero: "F", estado: "SP" };
const HELENA: AuthorLike = { nome: "Helena Prado", partido: "PSDB", genero: "F", estado: "MG" };
const IVO: AuthorLike = { numero: 7, nome: "Ivo", partido: "PT", genero: "Ivo Nunes", estado: "XX" };

type FxItem = { id: string; casa: string; favorable: number; authors: AuthorLike[] };
const FIXTURE: FxItem[] = [
    { id: "P1", casa: "Deputado", favorable: 1, authors: [ANA, BRUNO, BRUNO, CARLA] },
    { id: "P2", casa: "Senador", favorable: -1, authors: [BRUNO, DIEGO] },
    { id: "P3", casa: "Deputado", favorable: 0, authors: [ELISA] },
    { id: "P4", casa: "Poder Executivo", favorable: 1, authors: [FABIO] },
    { id: "P5", casa: "Deputado", favorable: -1, authors: [GILDA, HELENA] },
    { id: "P6", casa: "Deputado", favorable: 1, authors: [IVO] },
];

// Resumo geral: total = fav + desfav + sem avaliação.
{
    const fav = FIXTURE.filter((p) => p.favorable > 0).length;
    const desfav = FIXTURE.filter((p) => p.favorable < 0).length;
    const unrated = FIXTURE.filter((p) => p.favorable === 0).length;
    assert.strictEqual(fav, 3);
    assert.strictEqual(desfav, 2);
    assert.strictEqual(unrated, 1);
    assert.strictEqual(fav + desfav + unrated, FIXTURE.length); // invariante
    assert.strictEqual(calculateUnfavorableRate(makeRow("x", "X", fav, desfav)), 0.4);
}

// Por partido (canetadas): PT 4F/2D; PSDB 1F/1D; PL 0F/1D; Indefinido 0F/0D.
{
    const groups = groupCanetadasByParty(FIXTURE);
    assert.deepStrictEqual(groups.get("PT"), { favorable: 4, unfavorable: 2 });
    assert.deepStrictEqual(groups.get("PSDB"), { favorable: 1, unfavorable: 1 });
    assert.deepStrictEqual(groups.get("PL"), { favorable: 0, unfavorable: 1 });
    assert.deepStrictEqual(groups.get("Indefinido"), { favorable: 0, unfavorable: 0 });
    // Invariante: soma das canetadas = total de autorias únicas válidas (10).
    let rated = 0;
    let unratedRecords = 0;
    for (const counts of groups.values()) {
        rated += counts.favorable + counts.unfavorable;
        if (counts.favorable === 0 && counts.unfavorable === 0) unratedRecords += 1;
    }
    assert.strictEqual(rated, 9);
    assert.strictEqual(unratedRecords, 1); // Elisa (P3, sem avaliação)
    assert.strictEqual(rated + unratedRecords, 10);
    // Ordem padrão: maior taxa desfavorável → PL(1.0), PSDB(0.5), PT(1/3), Indefinido(0).
    const rows = [...groups.entries()].map(([party, c]) => buildDashboardRow(party, party, c.favorable, c.unfavorable));
    assert.deepStrictEqual(sortDashboardRows(rows).map((r) => r.label), ["PL", "PSDB", "PT", "Indefinido"]);
}

// Por gênero (autorias únicas): F 2F/2D; M 2F/2D; Não informado 1F/0D.
{
    const rows = aggregateAuthorships(FIXTURE, (a) => {
        const code = normalizeGenderCode(a.genero);
        return { key: code, label: GENDER_LABELS[code] };
    });
    const byLabel = new Map(rows.map((r) => [r.label, r]));
    assert.deepStrictEqual({ f: byLabel.get("Feminino")!.favorable, d: byLabel.get("Feminino")!.unfavorable }, { f: 2, d: 2 });
    assert.deepStrictEqual({ f: byLabel.get("Masculino")!.favorable, d: byLabel.get("Masculino")!.unfavorable }, { f: 2, d: 2 });
    assert.deepStrictEqual({ f: byLabel.get("Não informado")!.favorable, d: byLabel.get("Não informado")!.unfavorable }, { f: 1, d: 0 });
    assert.strictEqual(rows.length, 3); // sem "Ivo Nunes" como categoria
    // Empate F=M (0.5, total 4) resolvido no alfabeto: Feminino antes de Masculino.
    assert.deepStrictEqual(sortDashboardRows(rows).map((r) => r.label), ["Feminino", "Masculino", "Não informado"]);
}

// Por UF (autorias únicas): SP 1F/2D; RJ 2F/1D; MG 1F/1D; BA 0F/0D; "XX" excluída.
{
    const rows = aggregateAuthorships(FIXTURE, (a) => {
        const uf = normalizeUfCode(a.estado);
        return uf ? { key: uf, label: uf } : null;
    });
    const byLabel = new Map(rows.map((r) => [r.label, r]));
    assert.deepStrictEqual({ f: byLabel.get("SP")!.favorable, d: byLabel.get("SP")!.unfavorable }, { f: 1, d: 2 });
    assert.deepStrictEqual({ f: byLabel.get("RJ")!.favorable, d: byLabel.get("RJ")!.unfavorable }, { f: 2, d: 1 });
    assert.deepStrictEqual({ f: byLabel.get("MG")!.favorable, d: byLabel.get("MG")!.unfavorable }, { f: 1, d: 1 });
    assert.ok(byLabel.has("BA"));
    assert.ok(!byLabel.has("XX")); // UF inválida não vira categoria
    assert.deepStrictEqual(sortDashboardRows(rows).map((r) => r.label), ["SP", "MG", "RJ", "BA"]);
}

// Por casa (proposições únicas): Deputado 2F/1D; Senador 0F/1D; Executivo excluído.
{
    const seen = new Map<string, { favorable: number; unfavorable: number }>();
    for (const item of FIXTURE) {
        const casa = normalizeCasa(item.casa);
        if (!casa || casa === "executivo") continue;
        const label = CASA_LABELS[casa];
        const row = seen.get(label) || { favorable: 0, unfavorable: 0 };
        if (item.favorable > 0) row.favorable += 1;
        if (item.favorable < 0) row.unfavorable += 1;
        seen.set(label, row);
    }
    assert.deepStrictEqual(seen.get("Câmara"), { favorable: 2, unfavorable: 1 });
    assert.deepStrictEqual(seen.get("Senado"), { favorable: 0, unfavorable: 1 });
    assert.ok(!seen.has("Poder Executivo"));
    assert.strictEqual(normalizeCasa("Poder Executivo"), "executivo");
}

// Por autoria: contagem de proposições únicas (Bruno repetido em P1 conta 1x).
{
    const counts = countAuthorProposals(FIXTURE);
    assert.strictEqual(counts.get("num:1"), 1); // Ana
    assert.strictEqual(counts.get("num:2"), 2); // Bruno: P1 (1x apesar de repetido) + P2
    assert.strictEqual(counts.get(personKey(GILDA)), 1);
    assert.strictEqual(counts.get(personKey(HELENA)), 1);
    assert.strictEqual(counts.size, 9); // 9 pessoas distintas
    // Limite oficial >= 5: ninguém da fixture passa (prova que o filtro atua).
    const rows = [...counts.entries()].map(([key, n]) => buildDashboardRow(`person:${key}`, key, 0, 0));
    assert.strictEqual(filterAuthorsByMinProposals(rows, counts).length, 0);
    // Com limite 1, todos passam (recalibragem por conjunto).
    assert.strictEqual(filterAuthorsByMinProposals(rows, counts, 1).length, 9);
}

// Os níveis do subfiltro de autoria são aplicados sobre as proposições já
// filtradas e preservam o default editorial de 5+.
{
    const counts = new Map<string, number>([["a", 1], ["b", 5], ["c", 10], ["d", 20]]);
    const rows = [
        makeRow("person:a", "Um", 1, 0), makeRow("person:b", "Cinco", 1, 0),
        makeRow("person:c", "Dez", 1, 0), makeRow("person:d", "Vinte", 1, 0),
    ];
    assert.deepStrictEqual(filterAuthorsByMinProposals(rows, counts, 1).map((row) => row.label), ["Um", "Cinco", "Dez", "Vinte"]);
    assert.deepStrictEqual(filterAuthorsByMinProposals(rows, counts).map((row) => row.label), ["Cinco", "Dez", "Vinte"]);
    assert.deepStrictEqual(filterAuthorsByMinProposals(rows, counts, 10).map((row) => row.label), ["Dez", "Vinte"]);
    assert.deepStrictEqual(filterAuthorsByMinProposals(rows, counts, 20).map((row) => row.label), ["Vinte"]);
}

// Limite oficial: quatro proposições excluem; cinco ou mais incluem.
{
    const counts = new Map<string, number>([["num:631", 4], ["num:5352", 5], ["num:89", 6]]);
    const rows = [
        makeRow("person:num:631", "Quatro", 2, 2),
        makeRow("person:num:5352", "Cinco", 3, 2),
        makeRow("person:num:89", "Seis", 4, 2),
    ];
    const filtered = filterAuthorsByMinProposals(rows, counts);
    assert.deepStrictEqual(filtered.map((row) => row.label), ["Cinco", "Seis"]);
}

// Filtros: painéis recalculados sobre o subconjunto (casa = Deputado).
{
    const subset = FIXTURE.filter((p) => p.casa === "Deputado"); // P1, P3, P5, P6
    const groups = groupCanetadasByParty(subset);
    assert.deepStrictEqual(groups.get("PT"), { favorable: 3, unfavorable: 1 }); // difere do total (4/2)
    assert.deepStrictEqual(groups.get("PSDB"), { favorable: 1, unfavorable: 1 });
    assert.ok(!groups.has("PL")); // Diego só aparece no Senado filtrado para fora
    // Filtros combinados: Deputado + favorável → P1, P6.
    const combined = subset.filter((p) => p.favorable > 0);
    assert.deepStrictEqual(groupCanetadasByParty(combined).get("PT"), { favorable: 3, unfavorable: 0 });
    // Remover filtros restaura os valores do conjunto completo.
    assert.deepStrictEqual(groupCanetadasByParty(FIXTURE).get("PT"), { favorable: 4, unfavorable: 2 });
}

// Ordenação: taxa, total, alfabeto; modo total usa taxa desfavorável no desempate.
{
    assert.strictEqual(sortDashboardRows([makeRow("a", "A", 1, 1), makeRow("b", "B", 0, 1)])[0].label, "B");
    const tied = sortDashboardRows([makeRow("c", "Charlie", 1, 1), makeRow("a", "Alpha", 1, 1)]);
    assert.deepStrictEqual(tied.map((r) => r.label), ["Alpha", "Charlie"]);
    const byTotal = sortDashboardRows(
        [makeRow("a", "A", 0, 2), makeRow("b", "B", 1, 1), makeRow("c", "C", 3, 0)],
        "total",
    );
    assert.deepStrictEqual(byTotal.map((r) => r.label), ["C", "A", "B"]); // total, depois taxa desfav.
    const byFav = sortDashboardRows([makeRow("a", "A", 0, 1), makeRow("b", "B", 1, 0)], "favorable");
    assert.deepStrictEqual(byFav.map((r) => r.label), ["B", "A"]);
    assert.strictEqual(sortDashboardRows([makeRow("a", "A", 1, 0)])[0].label, "A"); // padrão = desfavorável

    // Partido e autoria seguem a mesma regra oficial: taxa desfavorável,
    // maior total e, por fim, ordem alfabética pt-BR com numeric.
    const partyRows = [makeRow("P2", "P2", 2, 2), makeRow("P10", "P10", 1, 1), makeRow("PL", "PL", 0, 3)];
    assert.deepStrictEqual(sortDashboardRows(partyRows).map((row) => row.label), ["PL", "P2", "P10"]);
    const authorRows = [makeRow("person:b", "Bia", 1, 1), makeRow("person:a", "Ana", 2, 2), makeRow("person:c", "Caio", 0, 3)];
    assert.deepStrictEqual(sortDashboardRows(authorRows).map((row) => row.label), ["Caio", "Ana", "Bia"]);
}

// Taxas: 0 <= taxa <= 1; denominador zero retorna zero.
{
    assert.strictEqual(calculateUnfavorableRate(makeRow("a", "A", 0, 3)), 1);
    assert.strictEqual(calculateUnfavorableRate(makeRow("a", "A", 3, 0)), 0);
    assert.strictEqual(calculateUnfavorableRate(makeRow("a", "A", 0, 0)), 0);
    assert.strictEqual(calculateFavorableRate(makeRow("a", "A", 0, 3)), 0);
    assert.strictEqual(calculateFavorableRate(makeRow("a", "A", 3, 0)), 1);
    assert.strictEqual(calculateFavorableRate(makeRow("a", "A", 0, 0)), 0);
    for (const r of [makeRow("a", "A", 4, 2), makeRow("b", "B", 1, 1), makeRow("c", "C", 0, 0)]) {
        const rate = calculateUnfavorableRate(r);
        assert.ok(rate >= 0 && rate <= 1);
    }
}

// Normalização de gênero: só F/M viram categorias; resto é "Não informado".
{
    assert.strictEqual(normalizeGenderCode("F"), "F");
    assert.strictEqual(normalizeGenderCode(" f "), "F");
    assert.strictEqual(normalizeGenderCode("Feminino"), "F");
    assert.strictEqual(normalizeGenderCode("M"), "M");
    assert.strictEqual(normalizeGenderCode("masculino"), "M");
    assert.strictEqual(normalizeGenderCode("Alê Silva"), "U");
    assert.strictEqual(normalizeGenderCode("Olival Marques"), "U");
    assert.strictEqual(normalizeGenderCode(""), "U");
    assert.strictEqual(normalizeGenderCode(null), "U");
    assert.strictEqual(normalizeGenderCode(undefined), "U");
    assert.strictEqual(GENDER_LABELS.F, "Feminino");
    assert.strictEqual(GENDER_LABELS.M, "Masculino");
    assert.strictEqual(GENDER_LABELS.U, "Não informado");
}

// Normalização de UF e casa.
{
    assert.strictEqual(normalizeUfCode("SP"), "SP");
    assert.strictEqual(normalizeUfCode(" sp "), "SP");
    assert.strictEqual(normalizeUfCode("XX"), null);
    assert.strictEqual(normalizeUfCode("São Paulo"), null);
    assert.strictEqual(normalizeUfCode(""), null);
    assert.strictEqual(normalizeUfCode(null), null);
    assert.strictEqual(normalizeCasa("Deputado"), "camara");
    assert.strictEqual(normalizeCasa("SENADOR"), "senado");
    assert.strictEqual(normalizeCasa("Poder Executivo"), "executivo");
    assert.strictEqual(normalizeCasa("Comissão"), null);
    assert.strictEqual(normalizeCasa(""), null);
    assert.strictEqual(normalizeCasa(null), null);
    assert.strictEqual(CASA_LABELS.camara, "Câmara");
    assert.strictEqual(CASA_LABELS.senado, "Senado");
}

// personKey: numero prevalece; fallback determinístico sem agrupar estranhos.
{
    assert.strictEqual(personKey({ numero: 1, nome: "Ana" }), "num:1");
    assert.strictEqual(personKey(GILDA), personKey({ nome: "Gilda Santos", partido: "PT" }));
    assert.notStrictEqual(personKey(GILDA), personKey(HELENA)); // duas pessoas distintas sem numero
    assert.strictEqual(personKey({ nome: "Gilda  Santos" }), personKey(GILDA)); // normalizado
    assert.strictEqual(personKey({ slug: "gilda_santos" }), "slug:gilda_santos"); // slug antes do nome
}

// Deduplicação inclui pessoas sem número (sem agrupar distintas).
{
    const unique = deduplicateAuthorsByPerson([GILDA, GILDA, HELENA, ANA, ANA]);
    assert.strictEqual(unique.length, 3);
    const gilda = unique.find((u) => u.key === personKey(GILDA))!;
    assert.strictEqual(gilda.partido, "PT");
    const noParty = deduplicateAuthorsByPerson([{ nome: "Sem Partido" }]);
    assert.strictEqual(noParty[0].partido, "Indefinido");
}

// Relatório de qualidade.
{
    const qc = createQualityCollector();
    qc.record("genero-invalido", "X: genero=Y");
    qc.record("genero-invalido", "Z: genero=W");
    qc.record("partido-ausente", "Q");
    const summary = qc.summary();
    assert.strictEqual(summary.total, 3);
    assert.strictEqual(summary.byKind["genero-invalido"], 2);
    assert.strictEqual(summary.byKind["partido-ausente"], 1);
}

// normalizeUnavailable (usado no fallback de partido).
{
    assert.strictEqual(normalizeUnavailable("PT"), "PT");
    assert.strictEqual(normalizeUnavailable(""), "Indefinido");
    assert.strictEqual(normalizeUnavailable(null), "Indefinido");
    assert.strictEqual(normalizeUnavailable(undefined), "Indefinido");
}

console.log("ok");
