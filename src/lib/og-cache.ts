import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Length-prefix every input so distinct input lists cannot share a hash. */
export function ogCacheKey(parts: (string | Uint8Array)[]): string {
    const hash = createHash('sha256');
    for (const part of parts) {
        const bytes = typeof part === 'string' ? Buffer.from(part) : part;
        hash.update(`${bytes.byteLength}:`).update(bytes);
    }
    return hash.digest('hex');
}

export async function cachedOg(
    directory: string,
    key: string,
    render: () => Promise<Buffer>,
): Promise<{ image: Buffer; hit: boolean }> {
    const path = join(directory, `${key}.png`);
    try {
        return { image: await readFile(path), hit: true };
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    const image = await render();
    await mkdir(directory, { recursive: true });
    const temporary = `${path}.${randomUUID()}.tmp`;
    await writeFile(temporary, image);
    await rename(temporary, path);
    return { image, hit: false };
}
