import { createHash } from 'node:crypto';
import { selectAuthorReports, type AuthorInitialData } from './author-page.ts';
import type { WpPost, WpPostsPage } from './wp.ts';

export type AuthorReports = ReturnType<typeof selectAuthorReports<WpPost>>;

/** All external page inputs are captured before Astro decides to reuse HTML. */
export function authorPageCacheKey(props: unknown, buildEnvironment: string): string {
    return createHash('sha256').update(JSON.stringify([props, buildEnvironment])).digest('hex');
}

export async function withAuthorReports<T extends { props: { initial: AuthorInitialData } }>(
    paths: T[],
    fetchReports: (search?: string) => Promise<WpPostsPage>,
    buildEnvironment: string,
) {
    let latest: Promise<WpPostsPage> | undefined;
    let cursor = 0;
    const result = new Array<T & { props: T['props'] & { reports: AuthorReports }; cacheKey?: string }>(paths.length);
    // Bound requests to WordPress; reuse the same fallback snapshot this build.
    await Promise.all(Array.from({ length: Math.min(6, paths.length) }, async () => {
        while (cursor < paths.length) {
            const index = cursor++;
            const path = paths[index];
            const initial = path.props.initial;
            const name = initial.person.social_name || initial.person.full_name || initial.activity.author.nome;
            const related = await fetchReports(name);
            const fallback = related.posts.length ? undefined : await (latest ??= fetchReports());
            const props = { ...path.props, reports: selectAuthorReports(related.posts, fallback?.posts ?? []) };
            result[index] = {
                ...path,
                props,
                // Transient upstream failures must never produce reusable HTML.
                ...(!related.unavailable && !fallback?.unavailable
                    ? { cacheKey: authorPageCacheKey(props, buildEnvironment) }
                    : {}),
            };
        }
    }));
    return result;
}
