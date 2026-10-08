import type { APIRoute } from 'astro';
import { API_BASE_URL } from 'astro:env/server';
import { getAuthorPaths, type AuthorPageProps } from '../../../../lib/author-paths';
import { renderAuthorOg } from '../../../../lib/author-og';

export async function getStaticPaths() {
    return getAuthorPaths(API_BASE_URL);
}

export const GET: APIRoute<AuthorPageProps> = async ({ props }) => {
    const png = await renderAuthorOg(props.initial);
    return new Response(new Uint8Array(png), {
        headers: { 'Content-Type': 'image/png' },
    });
};
