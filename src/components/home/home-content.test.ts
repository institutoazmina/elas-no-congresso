import assert from "node:assert/strict";
import test from "node:test";
import preview from "../../service/api/home-preview.json" with { type: "json" };
import { parseHomeContent } from "./home-content.ts";

test("Home Markdown preserves the ordered custom components and editorial copy", () => {
    const sections = parseHomeContent(preview.content);

    assert.equal(preview.title, "**De olho** nas **pautas de gênero**\nno **Congresso Nacional**");
    assert.deepEqual(sections.map(({ component }) => component), [
        "chart rights-under-attack",
        "chart legislative-setbacks",
        "reports",
        "chart women-in-defense",
        "chart party-rights",
        "chart state-projects",
        "alerts",
        "proposals fast",
        "proposals slow",
        "proposals enacted",
        "explore",
        "parliamentarians",
        "quiteria",
    ]);
    assert.equal(sections[0].content.rights_title, "Os direitos das mulheres e pessoas LGBTQIA+ nunca foram tão atacados");
    assert.equal(sections[3].content.women_postit_before, "A cada 100 proposições sobre gênero assinadas por mulheres,");
    assert.equal(sections[4].content.party_title_after, "Nossos direitos");
    assert.equal(sections[6].content.alerts_detail_highlight, "monitoramento");
    assert.equal(sections[10].content.explore_image_alt, "Prévia da ferramenta de atividade legislativa");
    assert.match(sections[10].content.explore_image_url, /74f5b946d93741f6a9c735e6df082cf5\.webp$/);
    assert.equal(sections[12].content.quiteria_name, "QuitérIA");
    assert.equal(sections[12].content.quiteria_image_alt, "QuitérIA, inteligência artificial feminista");
});

test("Home Markdown rejects unsafe component links", () => {
    const unsafe = preview.content.replace(
        "https://azmina.com.br/reportagens/ataques-direitos-lgbtqia-aborto-congresso/",
        "javascript:alert(1)",
    );

    assert.throws(() => parseHomeContent(unsafe), /rights note/);
});

test("Home Markdown rejects unsafe component images", () => {
    const unsafe = preview.content.replace(
        "/media/cms/markdown/74f5b946d93741f6a9c735e6df082cf5.webp",
        "javascript:alert(1)",
    );

    assert.throws(() => parseHomeContent(unsafe), /Explore image/);
});

test("Home Markdown accepts line endings saved by different editors", () => {
    const sections = parseHomeContent(preview.content.replace(/\n/g, "\r\n"));

    assert.equal(sections.length, 13);
    assert.equal(sections[0].content.rights_footnote, "*Foram avaliadas proposições até março de 2026");
});
