import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { cachedOg, ogCacheKey } from './og-cache.ts';

test('identical inputs reuse bytes; changed data, artwork or portrait renders again', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'author-og-test-'));
    try {
        let renders = 0;
        const render = async () => Buffer.from(`image-${++renders}`);
        const inputs = ['renderer', 'data', 'portrait'];
        const cold = await cachedOg(directory, ogCacheKey(inputs), render);
        const warm = await cachedOg(directory, ogCacheKey(inputs), render);
        assert.equal(cold.hit, false);
        assert.equal(warm.hit, true);
        assert.deepEqual(warm.image, cold.image);
        assert.equal(renders, 1);
        for (let index = 0; index < inputs.length; index++) {
            const changed = [...inputs];
            changed[index] += '-changed';
            assert.equal((await cachedOg(directory, ogCacheKey(changed), render)).hit, false);
        }
        assert.equal(renders, 4);
        assert.notEqual(ogCacheKey(['ab', 'c']), ogCacheKey(['a', 'bc']));
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

test('failed renders are not cached', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'author-og-test-'));
    try {
        const key = ogCacheKey(['retry']);
        await assert.rejects(cachedOg(directory, key, async () => { throw new Error('failed'); }));
        assert.equal((await cachedOg(directory, key, async () => Buffer.from('recovered'))).hit, false);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
