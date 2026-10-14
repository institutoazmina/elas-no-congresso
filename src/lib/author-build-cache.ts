import { createHash } from 'node:crypto';

/** All external page inputs are captured before Astro decides to reuse HTML. */
export function authorPageCacheKey(props: unknown, buildEnvironment: string): string {
    return createHash('sha256').update(JSON.stringify([props, buildEnvironment])).digest('hex');
}

// Reports are fetched by the page island in the browser, so only API data
// decides whether an author page must be regenerated.
export function withAuthorCacheKeys<T extends { props: unknown }>(paths: T[], buildEnvironment: string) {
    return paths.map((path) => ({ ...path, cacheKey: authorPageCacheKey(path.props, buildEnvironment) }));
}
