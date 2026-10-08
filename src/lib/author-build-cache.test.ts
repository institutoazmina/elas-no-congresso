import assert from 'node:assert/strict';
import test from 'node:test';
import { authorPageCacheKey, withAuthorReports } from './author-build-cache.ts';
import type { AuthorInitialData } from './author-page.ts';
import type { WpPostsPage } from './wp.ts';

// Only the name is consumed by this preparation step; full data is hashed.
const paths = Array.from({ length: 15 }, (_, index) => ({
    params: { slug: `author-${index}` },
    props: { initial: { person: { full_name: `Author ${index}` } } as AuthorInitialData },
}));
const empty: WpPostsPage = { posts: [], total: 0, totalPages: 0 };
const latest: WpPostsPage = {
    posts: [{ date: '2026-10-08', link: '/news', title: { rendered: 'News' } }],
    total: 1, totalPages: 1,
};

test('captures exact reports, preserves path order, bounds requests and shares the fallback', async () => {
    let active = 0;
    let maximum = 0;
    let fallbacks = 0;
    const result = await withAuthorReports(paths, async (name) => {
        if (!name) { fallbacks++; return latest; }
        active++;
        maximum = Math.max(maximum, active);
        await new Promise(resolve => setTimeout(resolve, 1));
        active--;
        return empty;
    }, 'https://example.com');
    assert.equal(fallbacks, 1);
    assert.equal(maximum, 6);
    assert.deepEqual(result.map(path => path.params), paths.map(path => path.params));
    for (const path of result) {
        assert.deepEqual(path.props.reports.reports, latest.posts);
        assert.ok(path.cacheKey);
    }
    const props = result[0].props;
    const key = authorPageCacheKey(props, 'https://example.com');
    assert.equal(key, authorPageCacheKey(structuredClone(props), 'https://example.com'));
    assert.notEqual(key, authorPageCacheKey(props, 'https://different.com'));
    assert.notEqual(key, authorPageCacheKey({ ...props, reports: empty }, 'https://example.com'));
    assert.notEqual(key, authorPageCacheKey({ ...props, initial: {} }, 'https://example.com'));
});

test('related and fallback failures disable HTML reuse, and later recovery is cacheable', async () => {
    const unavailable: WpPostsPage = { ...empty, unavailable: true };
    for (const failedSearch of [true, false]) {
        const [result] = await withAuthorReports(paths.slice(0, 1), async (name) =>
            (Boolean(name) === failedSearch ? unavailable : empty), '');
        assert.equal(result.cacheKey, undefined);
    }
    const [recovered] = await withAuthorReports(paths.slice(0, 1), async () => latest, '');
    assert.ok(recovered.cacheKey);
    assert.equal(recovered.props.reports.title, 'related');
});
