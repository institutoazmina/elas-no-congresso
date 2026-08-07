type WpFeaturedMedia = { link: string };
type WpEmbedded = { 'wp:featuredmedia'?: [WpFeaturedMedia] };

export type WpPost = {
  link: string;
  title: { rendered: string };
  _embedded?: WpEmbedded;
};

export async function fetchReportagens(tagId: number | undefined, perPage: number, orderByDate = false): Promise<WpPost[]> {
  const tag = tagId === undefined ? "" : `tags[]=${tagId}&`;
  const ordering = orderByDate ? "&orderby=date&order=desc" : "";
  const url = `https://azmina.com.br/wp-json/wp/v2/az_reportagem?${tag}_embed&_fields=title,link,_links.wp:featuredmedia&per_page=${perPage}${ordering}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json() as WpPost[];
  } catch {
    return [];
  }
}
