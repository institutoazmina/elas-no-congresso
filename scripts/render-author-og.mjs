import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

// Run from the repository root even when invoked from another directory.
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const slug = args.find(arg => !arg.startsWith('--')) || 'samia-bomfim';
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || args.some(arg => arg.startsWith('--') && arg !== '--refresh')) {
    throw new Error('Usage: npm run og:render -- [samia-bomfim] [--refresh]');
}
const cacheDir = resolve('node_modules/.cache/og-render');
await mkdir(cacheDir, { recursive: true });
await mkdir('previews', { recursive: true });
const modulePath = resolve(cacheDir, 'renderer.mjs');
// Compile the actual production template on every invocation, picking up edits.
await build({
    stdin: {
        contents: 'export { renderAuthorOg } from "./src/lib/author-og"; export { getAuthorPaths } from "./src/lib/author-paths";',
        resolveDir: process.cwd(),
        loader: 'ts',
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    packages: 'external',
    jsx: 'automatic',
    outfile: modulePath,
});
const { renderAuthorOg, getAuthorPaths } = await import(pathToFileURL(modulePath).href);
const cachePath = resolve(cacheDir, `${slug}.json`);
let initial;
if (!args.includes('--refresh')) {
    try { initial = JSON.parse(await readFile(cachePath, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (!initial) {
        // Reuse build data when available; no full rebuild required.
        try {
            const html = await readFile(`dist/atividade-legislativa/autoria/${slug}/index.html`, 'utf8');
            const payload = html.match(/<script\b[^>]*\bdata-author-initial\b[^>]*>([\s\S]*?)<\/script>/);
            if (payload) initial = JSON.parse(payload[1]);
        } catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
}
if (!initial) {
    const paths = await getAuthorPaths(process.env.API_BASE_URL || 'https://api.elasnocongresso.com.br/api/v1');
    initial = paths.find(path => path.params.slug === slug)?.props.initial;
    if (!initial) throw new Error(`Author not found: ${slug}`);
}
// Cache the original portrait as well as data, so repeat renders work offline.
const photoUrl = initial.person.photo_url || initial.activity.author.foto;
if (photoUrl && !photoUrl.startsWith('data:')) {
    const response = await fetch(photoUrl.replace(/^http:/, 'https:'), { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Portrait request failed: HTTP ${response.status}`);
    initial.person.photo_url = `data:${response.headers.get('content-type') || 'image/jpeg'};base64,${Buffer.from(await response.arrayBuffer()).toString('base64')}`;
}
await writeFile(cachePath, JSON.stringify(initial));
const output = resolve('previews', `${slug}.png`);
await writeFile(output, await renderAuthorOg(initial));
console.log(`Rendered: ${output}`);
console.log('Data and portrait are cached. Use --refresh to reload them from the API.');
