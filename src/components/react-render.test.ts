import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { test } from "node:test";
import { build } from "esbuild";
import { createElement, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { buildAuthorActivityFromApi, type AuthorInitialData } from "../lib/author-page.ts";
import type { ActivityProposition } from "../lib/activity-api.ts";

// Exercise the real JSX with React's server renderer. Only Astro's asset/env
// imports are replaced; no API or browser is needed for these regressions.
const components = [
    "activity/ActivityExplorer",
    "activity/ActivityResults",
    "activity/AuthorPage",
    "activity/PropositionProgress",
    "alerts/AlertsList",
    "alerts/AlertsSignup",
    "charts/PartyRightsChart",
    "charts/UfProjectsChart",
    "home/ProposalCarousel",
    "home/ParliamentariansCarousel",
    "home/ReportsList",
    "layout/Header",
    "charts/Paperwork",
];
const bundle = await build({
    stdin: {
        contents: components
            .map((file, index) => `export * as c${index} from "./src/components/${file}";`)
            .join("\n"),
        resolveDir: process.cwd(),
    },
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    packages: "external",
    jsx: "automatic",
    define: { "import.meta": "{}" },
    plugins: [
        {
            name: "astro-test-boundary",
            setup(builder) {
                builder.onResolve({ filter: /^astro:env\/client$/ }, () => ({
                    path: "env",
                    namespace: "astro-test",
                }));
                builder.onLoad({ filter: /.*/, namespace: "astro-test" }, () => ({
                    contents: 'export const PUBLIC_API_BASE_URL = "https://example.test/api/v1";',
                }));
                builder.onResolve({ filter: /\.(svg|png|webp)(\?raw)?$/ }, (args) => ({
                    path: path.resolve(args.resolveDir, args.path),
                    namespace: "asset-test",
                }));
                builder.onLoad({ filter: /.*/, namespace: "asset-test" }, (args) => ({
                    contents: `export default ${JSON.stringify(args.path.endsWith("?raw") ? readFileSync(args.path.slice(0, -4), "utf8") : { src: `/assets/${path.basename(args.path)}`, width: 100, height: 100 })};`,
                }));
            },
        },
    ],
});
const compiled = { exports: {} as Record<string, Record<string, ComponentType<any>>> };
new Function("require", "module", "exports", bundle.outputFiles[0].text)(
    createRequire(import.meta.url),
    compiled,
    compiled.exports,
);
const render = (index: number, props: Record<string, unknown>, name = "default") =>
    renderToString(createElement(compiled.exports[`c${index}`][name], props));
const proposal: ActivityProposition = {
    id: 10,
    house: "camara",
    number_label: "PL 10/2026",
    ementa: "Direitos das mulheres",
    presented_at: "2026-10-01",
    current_status: "Em tramitação",
    tramitation_url: null,
    category: "genero",
    category_label: "Gênero",
    is_favorable: true,
    assessment_organization: '<img src=x onerror="alert(1)">',
    assessment_comments: "Parecer",
    relevance: null,
    authors: [
        {
            id: 1,
            name: "Ana Silva",
            party: "PT",
            state: "SP",
            gender: "F",
            photo_url: null,
            role: "Deputada",
        },
    ],
    celerity: { label: "Rápida", days_without_movement: 2, movements_last_90_days: 7 },
    events: [],
};

test("API text is escaped in desktop and mobile proposition results", () => {
    for (const name of ["PropositionRow", "PropositionCard"]) {
        const html = render(1, { item: proposal }, name);
        assert.ok(html.includes("&lt;img src=x"));
        assert.ok(!html.includes('<img src="x"'));
        assert.ok(html.includes("Rápida"));
    }
});

test("both proposition views label original and current houses", () => {
    for (const name of ["PropositionRow", "PropositionCard"]) {
        assert.ok(render(1, { item: { ...proposal, current_house: "senado" } }, name).includes("Câmara → Senado"));
        assert.ok(render(1, { item: { ...proposal, house: "senado" } }, name).includes("Senado"));
    }
});

test("author proposals render on the server with the API pace, including the desktop table", () => {
    const activity = buildAuthorActivityFromApi([proposal], 1)!;
    const initial: AuthorInitialData = {
        activity,
        parties: [{ id: 1, acronym: "PT", name: "Partido" }],
        person: {
            id: 1,
            full_name: "Ana Silva",
            social_name: null,
            photo_url: null,
            gender: "F",
            birth_date: null,
            race: null,
            education: null,
            birthplace: null,
            profession: null,
            religion: null,
            bio: null,
            favorable_propositions_count: 1,
            unfavorable_propositions_count: 0,
            terms: [],
        },
        term: {
            id: 1,
            parliamentarian: 1,
            legislature_number: 57,
            party: 1,
            house: "camara",
            role: "Deputada",
            state: "SP",
            external_id: 1,
            start_date: "2023-02-01",
            end_date: null,
        },
    };
    const html = render(2, {
        authorId: 1,
        house: "camara",
        initial,
        reports: { title: "latest", reports: [] },
    });
    assert.match(html, /<tbody[^>]*>[\s\S]*PL 10\/2026[\s\S]*<\/tbody>/);
    assert.ok(html.includes("7 movimentações em 3 meses"));
    assert.ok(!html.includes("0% de chance"));
});

test("interactive islands render without browser globals or hydration-only data", () => {
    const homeContent = {
        party_title_before: "Estes são os partidos que mais têm",
        party_title_after: "Nossos direitos",
        party_subtitle: "Atuação dos partidos",
        party_caption: "Veja em detalhes",
        party_caption_url: "/atividade-legislativa",
        uf_title: "Projetos por UF",
        uf_subtitle: "Atuação das bancadas",
        uf_caption: "Veja os estados",
        uf_cta_text: "Veja o seu estado",
        uf_cta_url: "/atividade-legislativa",
        parliamentarians_title: "Parlamentares que jogam contra",
        parliamentarians_subtitle: "Projetos apresentados",
    };
    const fixtures: [number, Record<string, unknown>][] = [
        [0, {}],
        [3, { number: "PL 10/2026", house: "camara" }],
        [4, { propositions: [], total: 0 }],
        [5, { categories: [] }],
        [
            6,
            {
                views: [
                    {
                        stance: "unfavorable",
                        caption: "atacam",
                        parties: [{ name: "PT", percentage: "10%", width: 108, negative: 1, positive: 9 }],
                    },
                ],
                gap: 2,
                content: homeContent,
            },
        ],
        [
            7,
            {
                views: [
                    {
                        stance: "unfavorable",
                        heading: "Desfavoráveis",
                        rows: [{ uf: "SP", unfavorable: 1, favorable: 9, total: 10, share: 10 }],
                    },
                ],
                highlights: [],
                ufData: {},
                ufLabels: { SP: "São Paulo" },
                content: homeContent,
            },
        ],
        [8, { projects: [proposal], variant: "fast" }],
        [9, { people: [], content: homeContent }],
        [10, { initialPosts: [], totalPages: 0 }],
        [11, { currentPath: "/alertas" }],
    ];
    for (const [index, props] of fixtures) assert.ok(render(index, props).length > 0, components[index]);
});

test("alerts signup renders its trigger without the dialog open", () => {
    const html = render(5, { categories: [{ value: "saude", label: "Saúde" }] });
    assert.match(html, /<button[^>]*>Receber alertas por e-mail/);
    assert.doesNotMatch(html, /alerts-email-modal-title/);
});

test("paper canvases keep a CSS aspect ratio independent of their pixel buffer", () => {
    const html = render(12, { amount: 460, className: "pile-width", alt: "460 propositions" });
    assert.match(html, /height:auto/);
    assert.match(html, /aspect-ratio:/);
    assert.match(html, /class="pile-width"/);
    assert.match(html, /aria-label="460 propositions"/);
});

test("large carousels render nearby cards instead of triplicating every full card", () => {
    const projects = Array.from({ length: 50 }, (_, index) => ({ ...proposal, id: index + 1 }));
    const html = render(8, { projects, variant: "fast" });
    assert.equal((html.match(/data-featured=/g) ?? []).length, 7);
    assert.equal((html.match(/data-featured="true"/g) ?? []).length, 1);
});
