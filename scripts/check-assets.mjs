import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const walk = async (directory) => (await Promise.all(
    (await readdir(directory, { withFileTypes: true })).map(async (entry) => {
        const filename = path.join(directory, entry.name);
        return entry.isDirectory() ? walk(filename) : [filename];
    }),
)).flat();

// Knip follows imports; public URLs and CSS backgrounds need a separate check.
// Template substitutions match one path segment. A directory URL (papelada)
// means the caller selects filenames at runtime, so keep its contents.
const sources = (await walk('src')).filter((file) => /\.(astro|tsx?|css|less|js)$/.test(file));
const assets = await walk('public/assets');
const references = new Map();
for (const file of sources) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/(?:public)?(\/assets\/(?:\$\{[^}]+\}|[^\s"'`()<>{};,])+)/g)) {
        const reference = match[1].replace(/[?#].*$/, '');
        if (!references.has(reference)) references.set(reference, []);
        references.get(reference).push(file);
    }
}
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = [...references.keys()].map((reference) => {
    const parts = reference.split(/\$\{[^}]+\}/);
    return new RegExp(`^${parts.map(escape).join('[^/]+')}${reference.endsWith('/') ? '.+' : ''}$`);
});
const unused = assets.filter((file) => !patterns.some((pattern) => pattern.test(file.slice('public'.length))));
const missing = [];
for (const [reference, files] of references) {
    if (reference.includes('${') || reference.endsWith('/')) continue;
    try { await stat(`public${reference}`); }
    catch { missing.push({ reference, files }); }
}
if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ unused, missing }, null, 2));
} else {
    for (const file of unused) console.error(`Unused asset: ${file}`);
    for (const { reference, files } of missing) console.error(`Missing asset: ${reference} (${files.join(', ')})`);
    if (!unused.length && !missing.length) console.log(`Assets OK: ${assets.length} files, no unused or missing references.`);
}
if (unused.length || missing.length) process.exitCode = 1;
