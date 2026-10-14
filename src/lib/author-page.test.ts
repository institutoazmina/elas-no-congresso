import assert from "node:assert/strict";
import test from "node:test";
import { assertSuccessfulApiStatus, authorRoute, authorSlug, formatApiDate, genderLabel, partyForTerm, normalizePhotoUrl, paginateItems, selectAuthorReports } from "./author-page.ts";
import { resolveNewsImage } from "./wp.ts";

test("resolve a imagem WordPress pela mesma prioridade da página Reportagens", () => {
    assert.equal(resolveNewsImage({ media_details: { sizes: { "az-article-thumbnail-large": { source_url: "/large.jpg" } } } }), "https://azmina.com.br/large.jpg");
    assert.equal(resolveNewsImage({ source_url: "https://cdn.example/image.jpg" }), "https://cdn.example/image.jpg");
    assert.equal(resolveNewsImage(undefined), undefined);
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

test("P0: fallbacks da API nunca inventam dado biográfico ou partidário", () => {
    assert.equal(partyForTerm([], undefined), "Indisponível");
    assert.equal(partyForTerm([{ id: 4, acronym: "PX", name: "Partido X" }], undefined), "Indisponível");
    assert.equal(
        partyForTerm(
            [{ id: 4, acronym: "PX", name: "Partido X" }],
            { id: 1, parliamentarian: 9, legislature_number: 57, party: 999, house: "camara", role: "Deputado", state: "SP", external_id: 101, start_date: "2023-02-01", end_date: null },
        ),
        "Indisponível",
    );
    assert.equal(formatApiDate(null), "Indisponível");
    assert.equal(formatApiDate("não-data"), "Indisponível");
    assert.equal(genderLabel(null), "Indisponível");
});
