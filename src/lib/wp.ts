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

export const WP_REPORTAGENS_ENDPOINT = "https://azmina.com.br/wp-json/wp/v2/az_reportagem";

export function resolveReportagemImage(media: WpFeaturedMedia | undefined, baseUrl = "https://azmina.com.br"): string | undefined {
  const imagePath = media?.media_details?.sizes?.["az-article-thumbnail-large"]?.source_url ?? media?.source_url ?? media?.link;
  if (!imagePath) return undefined;
  try { return new URL(imagePath, baseUrl).href; } catch { return undefined; }
}

export async function fetchReportagensPage(
  tagId: number | undefined,
  perPage: number,
  page = 1,
  orderByDate = false,
  search?: string,
): Promise<WpPostsPage> {
  const params = new URLSearchParams({
    _embed: "wp:featuredmedia",
    per_page: String(perPage),
    page: String(page),
  });

  if (search) params.set("search", search);
  if (tagId !== undefined) params.append("tags[]", String(tagId));
  if (orderByDate) {
    params.set("orderby", "date");
    params.set("order", "desc");
  }

  try {
    const res = await fetchPublicData(`${WP_REPORTAGENS_ENDPOINT}?${params}`);
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

export async function fetchReportagens(tagId: number, perPage: number, orderByDate = false): Promise<WpPost[]> {
  return (await fetchReportagensPage(tagId, perPage, 1, orderByDate)).posts;
}
