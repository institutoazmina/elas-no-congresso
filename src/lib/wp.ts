import { fetchPublicData } from "./public-data-fetch.ts";

type WpImageSize = { source_url?: string };
export type WpFeaturedMedia = {
  alt_text?: string;
  link?: string;
  source_url?: string;
  media_details?: { sizes?: Record<string, WpImageSize> };
};
type WpEmbedded = { 'wp:featuredmedia'?: [WpFeaturedMedia] };

export type WpPost = {
  date: string;
  modified?: string;
  link: string;
  title: { rendered: string };
  _embedded?: WpEmbedded;
};

export type WpPostsPage = {
  posts: WpPost[];
  total: number;
  totalPages: number;
  unavailable?: true;
};

const WP_NEWS_ENDPOINT = "https://azmina.com.br/wp-json/wp/v2/az_reportagem";

export function resolveNewsImage(media: WpFeaturedMedia | undefined, baseUrl = "https://azmina.com.br"): string | undefined {
  const imagePath = media?.media_details?.sizes?.["az-article-thumbnail-large"]?.source_url ?? media?.source_url ?? media?.link;
  if (!imagePath) return undefined;
  try { return new URL(imagePath, baseUrl).href; } catch { return undefined; }
}

export type NewsQuery = {
  perPage: number;
  page?: number;
  /** Skips this many posts; takes precedence over ``page`` in WordPress. */
  offset?: number;
  tagId?: number;
  search?: string;
  orderByDate?: boolean;
  signal?: AbortSignal;
};

// Called from the browser: reports are never fetched at build time.
export async function fetchNewsPage({
  perPage,
  page = 1,
  offset,
  tagId,
  search,
  orderByDate = false,
  signal,
}: NewsQuery): Promise<WpPostsPage> {
  const params = new URLSearchParams({
    _embed: "wp:featuredmedia",
    per_page: String(perPage),
    page: String(page),
  });

  if (offset !== undefined) params.set("offset", String(offset));
  if (search) params.set("search", search);
  if (tagId !== undefined) params.append("tags[]", String(tagId));
  if (orderByDate) {
    params.set("orderby", "date");
    params.set("order", "desc");
  }

  try {
    const res = await fetchPublicData(`${WP_NEWS_ENDPOINT}?${params}`, signal);
    if (!res.ok) return { posts: [], total: 0, totalPages: 0, unavailable: true };

    return {
      posts: await res.json() as WpPost[],
      total: Number(res.headers.get("x-wp-total") ?? 0),
      totalPages: Number(res.headers.get("x-wp-totalpages") ?? 0),
    };
  } catch {
    return { posts: [], total: 0, totalPages: 0, unavailable: true };
  }
}
