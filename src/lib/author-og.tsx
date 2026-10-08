import { readFile } from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import { normalizePhotoUrl, partyForTerm, type AuthorInitialData } from './author-page';
import { cachedOg, ogCacheKey } from './og-cache';

const nameFont = readFile('src/assets/fonts/Anybody-Bold-Width75.ttf');
const bodyFont = readFile('src/assets/fonts/PlusJakartaSans-SemiBold.ttf');
const background = readFile('src/assets/images/og-background.png');
const thumbsUp = readFile('src/assets/images/activity/thumbs-up.svg').then(data => `data:image/svg+xml;base64,${data.toString('base64')}`);
const thumbsDown = readFile('src/assets/images/activity/thumbs-down.svg').then(data => `data:image/svg+xml;base64,${data.toString('base64')}`);
const colorTokens = readFile('src/styles/tailwind.css', 'utf8').then(css => {
    const color = (name: string) => {
        const value = css.match(new RegExp(`--color-${name}:\\s*([^;]+);`))?.[1].trim();
        if (!value) throw new Error(`Missing design token: --color-${name}`);
        return value;
    };
    return { favorable: color('favorable'), unfavorable: color('unfavorable') };
});

// Include files read outside Vite's import graph and renderer dependencies.
const rendererFingerprint = Promise.all([
    readFile('src/lib/author-og.tsx'),
    readFile('package-lock.json'),
    nameFont, bodyFont, background, thumbsUp, thumbsDown,
]).then(ogCacheKey);
const cacheStats = { hits: 0, misses: 0, uncached: 0 };
process.once('exit', () => console.log('[author-og-cache]', JSON.stringify(cacheStats)));

async function loadPortrait(url: string | null): Promise<Buffer | null> {
    if (!url) return null;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await sharp(Buffer.from(await response.arrayBuffer()))
            .resize(208, 277, { fit: 'cover', position: 'north' }).png().toBuffer();
    } catch (error) {
        console.warn(`[author-og] Portrait unavailable: ${url}`, error);
        return null;
    }
}

export async function renderAuthorOg(initial: AuthorInitialData): Promise<Buffer> {
    const { person, term, parties, activity } = initial;
    const name = person.social_name || person.full_name || activity.author.nome;
    const affiliation = [partyForTerm(parties, term), term.state || activity.author.estado].filter(Boolean).join('/');
    // Re-fetch the portrait even on a warm build: remote bytes can change at
    // the same URL. Cache the expensive rendering, not unversioned remote data.
    const portraitUrl = normalizePhotoUrl(person.photo_url, activity.author.foto);
    const portraitBytes = await loadPortrait(portraitUrl);
    const rated = activity.favorable + activity.unfavorable;
    const share = rated ? activity.favorabilityRate : 0;
    const colors = await colorTokens;
    const render = async () => {
        const portrait = portraitBytes
            ? `data:image/png;base64,${portraitBytes.toString('base64')}`
            : null;
        const separatorWidth = activity.favorable > 0 && activity.unfavorable > 0 ? 4 : 0;
        const barWidth = 650 - 2 * 54 - 2 * 20;
        const segmentWidth = barWidth - separatorWidth;
        const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('');
        const svg = await satori(
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100%', color: '#0b0f5e', fontFamily: 'Plus Jakarta Sans', fontWeight: 600, padding: '70px 64px 0' }}>
                <div style={{ display: 'flex', position: 'relative', width: 208, height: 277, flexShrink: 0, background: '#26269e', color: 'white', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {portrait ? <img src={portrait} width={208} height={277} style={{ objectFit: 'cover' }} /> : <span style={{ fontSize: 64 }}>{initials}</span>}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 208, height: 277, boxSizing: 'border-box', border: '1.5px solid #998D96' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: 20, maxWidth: 1072, fontFamily: 'Anybody', fontSize: 50, fontWeight: 700, color: '#0B0F5E', lineHeight: 1, flexShrink: 0 }}>{name.toLocaleUpperCase('pt-BR')}</div>
                <div style={{ display: 'flex', marginTop: 8, fontSize: 28, fontWeight: 600, lineHeight: 1, flexShrink: 0 }}>{affiliation || 'Partido/UF não informados'}</div>
                <div style={{ display: 'flex', alignItems: 'center', width: 650, maxWidth: 650, gap: 20, marginTop: 36, height: 54, flexShrink: 0 }}>
                    <img src={await thumbsUp} width={54} height={54} />
                    <div style={{ display: 'flex', width: barWidth, height: 20, background: rated ? 'white' : '#7777e8' }}>
                        {rated > 0 && <div style={{ width: segmentWidth * share, height: 20, background: colors.favorable }} />}
                        {separatorWidth > 0 && <div style={{ width: separatorWidth, height: 20, background: 'white' }} />}
                        {rated > 0 && <div style={{ width: segmentWidth * (1 - share), height: 20, background: colors.unfavorable }} />}
                    </div>
                    <img src={await thumbsDown} width={54} height={54} />
                </div>
            </div>,
            { width: 1200, height: 630, fonts: [
                { name: 'Anybody', data: await nameFont, weight: 700, style: 'normal' },
                { name: 'Plus Jakarta Sans', data: await bodyFont, weight: 600, style: 'normal' },
            ] },
        );
        return sharp(await background)
            .composite([{ input: Buffer.from(svg) }])
            .png().toBuffer();
    };
    // A transient portrait failure must be retried on the next build.
    if (process.env.OG_CACHE === 'off' || (portraitUrl && !portraitBytes)) {
        cacheStats.uncached++;
        return render();
    }
    const key = ogCacheKey([
        await rendererFingerprint,
        JSON.stringify({ name, affiliation, rated, share, colors, favorable: activity.favorable, unfavorable: activity.unfavorable }),
        portraitBytes ?? '',
    ]);
    const result = await cachedOg(process.env.OG_CACHE_DIR || 'node_modules/.cache/author-og', key, render);
    cacheStats[result.hit ? 'hits' : 'misses']++;
    return result.image;
}
