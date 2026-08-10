type WpFeaturedMedia = {
  link: string;
  source_url: string;
  alt_text: string;
};
type WpEmbedded = { 'wp:featuredmedia'?: [WpFeaturedMedia] };

export type WpPost = {
  date: string;
  modified: string;
  link: string;
  title: { rendered: string };
  _embedded?: WpEmbedded;
};

export async function fetchReportagens(tagId: number, perPage: number): Promise<WpPost[]> {
  const url = `https://azmina.com.br/wp-json/wp/v2/az_reportagem?tags[]=${tagId}&_embed&_fields=title,link,date,modified,_links.wp:featuredmedia&per_page=${perPage}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json() as WpPost[];
  } catch {
    return [];
  }
}
