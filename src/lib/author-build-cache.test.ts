import assert from 'node:assert/strict';
import test from 'node:test';
import { authorPageCacheKey, withAuthorCacheKeys } from './author-build-cache.ts';

const paths = Array.from({ length: 3 }, (_, index) => ({
    params: { slug: `author-${index}` },
    props: { authorId: index, initial: { person: { full_name: `Author ${index}` } } },
}));

test('cache key follows the page props and the build environment', () => {
    const props = paths[0].props;
    const key = authorPageCacheKey(props, 'https://example.com');
    assert.equal(key, authorPageCacheKey(structuredClone(props), 'https://example.com'));
    assert.notEqual(key, authorPageCacheKey(props, 'https://different.com'));
    assert.notEqual(key, authorPageCacheKey({ ...props, initial: {} }, 'https://example.com'));
});

test('every path gets its own key and keeps its order', () => {
    const result = withAuthorCacheKeys(paths, '');
    assert.deepEqual(result.map(path => path.params), paths.map(path => path.params));
    assert.equal(new Set(result.map(path => path.cacheKey)).size, paths.length);
});
