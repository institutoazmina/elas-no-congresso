import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

// Run after a production build. No server, browser, API requests or AWS access.
const output = path.resolve("dist");
const origin = "https://www.elasnocongresso.com.br";
const routes = ["", "atividade-legislativa", "alertas", "reportagens", "sobre", "ia-feminista"];

async function checkPage(file) {
    const html = await readFile(path.join(output, file), "utf8");
    assert.match(html, /<html\b[^>]*lang="pt-BR"/, `${file}: document language`);
    assert.match(html, /<title>[^<]+<\/title>/, `${file}: title`);
    assert.match(html, /<(?:main|section)\b/, `${file}: page content rendered`);
    const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/);
    assert.ok(canonical, `${file}: canonical URL`);
    const url = new URL(canonical[1]);
    assert.equal(url.origin, origin, `${file}: production canonical origin`);
    assert.equal(url.pathname.replace(/\/$/, ""), `/${file.replace(/(?:\/)?index\.html$/, "")}`.replace(/\/$/, ""), `${file}: canonical route`);

    const assets = new Set([...html.matchAll(/(?:src|href)="(\/_astro\/[^"?#]+)(?:[^"\s]*)"/g)].map((match) => match[1]));
    assert.ok(assets.size > 0, `${file}: generated assets referenced`);
    for (const asset of assets) await access(path.join(output, decodeURIComponent(asset.slice(1))));
    return html;
}

for (const route of routes) {
    test(`built /${route} has content, metadata and resolvable generated assets`, async () => {
        await checkPage(path.posix.join(route, "index.html"));
    });
}

test("CMS hero images preserve their managed alt descriptions", async () => {
    const activity = await readFile(path.join(output, "atividade-legislativa/index.html"), "utf8");
    const feministAI = await readFile(path.join(output, "ia-feminista/index.html"), "utf8");

    assert.match(activity, /<img\b[^>]*alt="Ilustração de um robô feito de papel"[^>]*>/);
    assert.match(feministAI, /<img\b[^>]*alt="Ilustração de Maria Quitéria"[^>]*>/);
});

test("CMS editorial output preserves the pre-CMS partner list and table labels", async () => {
    const about = await readFile(path.join(output, "sobre/index.html"), "utf8");
    const feministAI = await readFile(path.join(output, "ia-feminista/index.html"), "utf8");

    assert.match(about, /Fazem parte da rede:<\/strong> Anis Bioética,[\s\S]* Instituto Update,[\s\S]* e TretAqui\./);
    assert.doesNotMatch(feministAI, />Tendência<\/th>/);
    assert.doesNotMatch(feministAI, />Métricas<\/th>\s*<th>Valor<\/th>/);
});

for (const kind of ["autoria", "proposicao"]) {
    test(`build includes populated ${kind} pages from the API`, async () => {
        const directory = `atividade-legislativa/${kind}`;
        const entries = await readdir(path.join(output, directory), { withFileTypes: true });
        const page = entries.filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))[0];
        assert.ok(page, `No ${kind} pages generated`);
        const html = await checkPage(`${directory}/${page.name}/index.html`);
        assert.match(html, /<h1\b[^>]*>[\s\S]*?<\/h1>/);
    });
}

test("sitemap lists canonical activity pages and excludes legacy and noindex routes", async () => {
    const index = await readFile(path.join(output, "sitemap-index.xml"), "utf8");
    const locations = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
    assert.ok(locations.length > 0, "Sitemap index must reference sitemap files");
    const sitemaps = await Promise.all(locations.map(async (url) => {
        assert.equal(url.origin, origin);
        return readFile(path.join(output, url.pathname.slice(1)), "utf8");
    }));
    const urls = sitemaps.flatMap((xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1])));
    for (const kind of ["autoria", "proposicao"]) {
        assert.ok(urls.some((url) => url.pathname.startsWith(`/atividade-legislativa/${kind}/`)), `Sitemap missing ${kind}`);
    }
    for (const url of urls) {
        assert.equal(url.origin, origin);
        assert.doesNotMatch(url.pathname, /^\/(?:perfil|proposta|propostas-e-votacoes)(?:\/|$)|^\/alertas\/(?:confirmado|cancelado)\/?$|^\/(?:acompanhe|apoiadores|metodologia|newsletter|quiteria|ranking)\/?$/);
    }
    const robots = await readFile(path.join(output, "robots.txt"), "utf8");
    assert.ok(robots.includes(`Sitemap: ${origin}/sitemap-index.xml`));
    await access(path.join(output, "404.html"));
});
