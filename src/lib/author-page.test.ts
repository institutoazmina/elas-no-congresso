import assert from "node:assert/strict";
import test from "node:test";
import {
    assertSuccessfulApiStatus,
    authorRoute,
    authorSlug,
    buildAuthorActivity,
    formatApiDate,
    getActivityAuthorIds,
    groupProposalRatings,
    parseAuthorId,
    normalizePhotoUrl,
    paginateItems,
    partyForTerm,
    proposalHasAuthor,
    resolveApiParliamentarian,
    selectAuthorReports,
    type ActivityData,
    type ApiParliamentarian,
} from "./author-page.ts";
import { resolveReportagemImage } from "./wp.ts";

test("resolve a imagem WordPress pela mesma prioridade da página Reportagens", () => {
    assert.equal(resolveReportagemImage({ media_details: { sizes: { "az-article-thumbnail-large": { source_url: "/large.jpg" } } } }), "https://azmina.com.br/large.jpg");
    assert.equal(resolveReportagemImage({ source_url: "https://cdn.example/image.jpg" }), "https://cdn.example/image.jpg");
    assert.equal(resolveReportagemImage(undefined), undefined);
});

test("slugs públicos normalizam nomes sem acentos nem caracteres inválidos", () => {
    assert.equal(authorSlug("Sâmia Bomfim"), "samia-bomfim");
    assert.equal(authorSlug("Erika Hilton"), "erika-hilton");
    assert.equal(authorSlug("Soraya Thronicke"), "soraya-thronicke");
    assert.equal(authorSlug("Fabiano Contarato"), "fabiano-contarato");
    assert.equal(authorSlug("  Jo\u00e3o   da Silva!! "), "joao-da-silva");
    assert.equal(authorSlug("Érica---Hilton"), "erica-hilton");
    assert.equal(authorRoute("Erika Hilton"), "/atividade-legislativa/autoria/erika-hilton");
});

test("reportagens relacionadas são priorizadas, ordenadas e limitadas a três", () => {
    const result = selectAuthorReports([
        { link: "a", date: "2024-01-01", title: { rendered: "A" } },
        { link: "b", date: "2025-01-01", title: { rendered: "B" } },
        { link: "c", date: "2023-01-01", title: { rendered: "C" } },
        { link: "d", date: "2022-01-01", title: { rendered: "D" } },
    ], [{ link: "latest", date: "2026-01-01", title: { rendered: "Latest" } }]);
    assert.equal(result.title, "related");
    assert.deepEqual(result.reports.map((item) => item.link), ["b", "a", "c"]);
});

test("sem relacionadas, reportagens mais recentes são usadas e limitadas a três", () => {
    const result = selectAuthorReports([], [
        { link: "old", date: "2024-01-01", title: { rendered: "Old" } },
        { link: "new", date: "2026-01-01", title: { rendered: "New" } },
        { link: "mid", date: "2025-01-01", title: { rendered: "Mid" } },
        { link: "extra", date: "2023-01-01", title: { rendered: "Extra" } },
    ]);
    assert.equal(result.title, "latest");
    assert.deepEqual(result.reports.map((item) => item.link), ["new", "mid", "old"]);
});

const data: ActivityData = {
    legislaturas: {
        "57": {
            parlamentares: {
                "101": { nome: "Ana", numero: 101, foto: "https://example.com/ana.jpg", partido: "PX", estado: "SP", cargo: "Deputado" },
                "202": { nome: "Bia", numero: 202, partido: "PY", estado: "RJ", cargo: "Deputado" },
            },
            proposicoes: {
                one: { i: 1, casa: "Deputado", numero: "PL 1/2025", slug: "pl_1", resumo: "Uma", favoravel: 1, autores: { "101": 101, "202": 202 }, legislatura: 57, categoria: "Saúde", tema: "Cuidado" },
                two: { i: 2, casa: "Deputado", numero: "PL 2/2025", slug: "pl_2", resumo: "Duas", favoravel: -1, autores: { "101": 101 }, legislatura: 57, categoria: "Saúde", tema: "Cuidado" },
                three: { i: 3, casa: "Deputado", numero: "PL 3/2025", slug: "pl_3", resumo: "Três", favoravel: 0, autores: { "101": 101 }, legislatura: 57 },
                other: { i: 4, casa: "Deputado", numero: "PL 4/2025", slug: "pl_4", resumo: "Outra", favoravel: 1, autores: { "202": 202 }, legislatura: 57 },
            },
        },
    },
};

test("a rota usa somente um ID numérico real", () => {
    assert.equal(parseAuthorId("101"), 101);
    assert.equal(parseAuthorId("ana"), null);
    assert.deepEqual(getActivityAuthorIds(data), [101, 202]);
    assert.equal(authorRoute("Ana"), "/atividade-legislativa/autoria/ana");
    assert.equal(authorRoute(101), null);
});

test("foto real é normalizada e fallback vazio não produz imagem quebrada", () => {
    assert.equal(normalizePhotoUrl("http://example.com/foto.jpg"), "https://example.com/foto.jpg");
    assert.equal(normalizePhotoUrl(null, "https://example.com/fallback.jpg"), "https://example.com/fallback.jpg");
    assert.equal(normalizePhotoUrl(null, null), null);
});

test("erro da API é distinguido de resposta bem-sucedida", () => {
    assert.doesNotThrow(() => assertSuccessfulApiStatus(200));
    assert.throws(() => assertSuccessfulApiStatus(500), /status 500/);
});

test("paginação limita resultados e corrige página fora do intervalo", () => {
    assert.deepEqual(paginateItems([1, 2, 3, 4, 5], 2, 2), { items: [3, 4], page: 2, pages: 3 });
    assert.deepEqual(paginateItems([1, 2], 99, 2), { items: [1, 2], page: 1, pages: 1 });
});

test("autoria e coautoria usam a mesma associação por autores da atividade", () => {
    assert.equal(proposalHasAuthor(data.legislaturas["57"].proposicoes.one, 101), true);
    assert.equal(proposalHasAuthor(data.legislaturas["57"].proposicoes.one, 202), true);
    assert.equal(proposalHasAuthor(data.legislaturas["57"].proposicoes.two, 202), false);
});

test("carrega parlamentar, foto, partido local e somente suas proposições", () => {
    const activity = buildAuthorActivity(data, 101)!;
    assert.equal(activity.author.nome, "Ana");
    assert.equal(activity.author.foto, "https://example.com/ana.jpg");
    assert.equal(activity.author.partido, "PX");
    assert.deepEqual(activity.proposals.map((item) => item.numero), ["PL 1/2025", "PL 2/2025", "PL 3/2025"]);
});

test("sem avaliação fica fora do denominador de favorabilidade", () => {
    const activity = buildAuthorActivity(data, 101)!;
    assert.equal(activity.favorable, 1);
    assert.equal(activity.unfavorable, 1);
    assert.equal(activity.unrated, 1);
    assert.equal(activity.favorabilityRate, 0.5);
});

test("parlamentar inexistente e pessoa sem proposições são tratados", () => {
    assert.equal(buildAuthorActivity(data, 999), null);
    const noProposals: ActivityData = { legislaturas: { "57": { parlamentares: { "303": { nome: "Cris", numero: 303 } }, proposicoes: {} } } };
    assert.deepEqual(buildAuthorActivity(noProposals, 303)?.proposals, []);
});

test("resolve o cadastro da API pelo external_id, não pelo nome", () => {
    const person = {
        id: 9, full_name: "Nome oficial", social_name: "Ana", photo_url: null, gender: "F", birth_date: "1990-05-04", race: null,
        education: null, birthplace: null, profession: null, religion: null, bio: null, favorable_propositions_count: 1,
        unfavorable_propositions_count: 0, terms: [{ id: 1, parliamentarian: 9, legislature_number: 57, party: 4, house: "camara", role: "Deputado", state: "SP", external_id: 101, start_date: "2023-02-01", end_date: null }],
    } satisfies ApiParliamentarian;
    const resolved = resolveApiParliamentarian([person], 101);
    assert.equal(resolved?.person.id, 9);
    assert.equal(resolved?.term.external_id, 101);
    assert.equal(partyForTerm([{ id: 4, acronym: "PX", name: "Partido X" }], resolved?.term), "PX");
    assert.equal(formatApiDate(person.birth_date), "04/05/1990");
});

test("agrupamentos usam apenas categorias/temas reais presentes nas proposições", () => {
    const activity = buildAuthorActivity(data, 101)!;
    assert.deepEqual(groupProposalRatings(activity.proposals, "categoria"), [{ label: "Saúde", favorable: 1, unfavorable: 1 }]);
});
