type WpImageSize = { source_url?: string };
type WpFeaturedMedia = {
  alt_text?: string;
  link?: string;
  source_url?: string;
  media_details?: { sizes?: Record<string, WpImageSize> };
};
type WpEmbedded = { 'wp:featuredmedia'?: [WpFeaturedMedia] };

export type WpPost = {
  modified?: string;
  link: string;
  title: { rendered: string };
  _embedded?: WpEmbedded;
};

export type WpPostsPage = {
  posts: WpPost[];
  total: number;
  totalPages: number;
};

export const WP_REPORTAGENS_ENDPOINT = "https://azmina.com.br/wp-json/wp/v2/az_reportagem";

export async function fetchReportagensPage(
  tagId: number | undefined,
  perPage: number,
  page = 1,
  orderByDate = false,
): Promise<WpPostsPage> {
  const params = new URLSearchParams({
    _embed: "wp:featuredmedia",
    _fields: "title,link,modified,_links.wp:featuredmedia",
    per_page: String(perPage),
    page: String(page),
  });

  if (tagId !== undefined) params.append("tags[]", String(tagId));
  if (orderByDate) {
    params.set("orderby", "date");
    params.set("order", "desc");
  }

  try {
    const res = await fetch(`${WP_REPORTAGENS_ENDPOINT}?${params}`);
    if (!res.ok) return { posts: [], total: 0, totalPages: 0 };

    return {
      posts: await res.json() as WpPost[],
      total: Number(res.headers.get("x-wp-total") ?? 0),
      totalPages: Number(res.headers.get("x-wp-totalpages") ?? 0),
    };
  } catch {
    return { posts: [], total: 0, totalPages: 0 };
  }
}

export async function fetchReportagens(tagId: number | undefined, perPage: number, orderByDate = false): Promise<WpPost[]> {
  return (await fetchReportagensPage(tagId, perPage, 1, orderByDate)).posts;
}
