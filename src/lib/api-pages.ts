// Largest page the API accepts (NINJA_PAGINATION_MAX_LIMIT); larger limits get a 422.
export const API_PAGE_SIZE = 1000;

type Page<T> = { items?: T[]; count: number };

/** Walks a limit/offset endpoint until `count` items arrive (or a page comes back empty). */
export async function fetchAllPages<T>(url: string, fetchJson: (url: string) => Promise<Page<T>>, pageSize = API_PAGE_SIZE): Promise<T[]> {
    const items: T[] = [];
    const separator = url.includes("?") ? "&" : "?";
    for (let offset = 0; ; offset += pageSize) {
        const page = await fetchJson(`${url}${separator}limit=${pageSize}&offset=${offset}`);
        const pageItems = page.items ?? [];
        items.push(...pageItems);
        if (!pageItems.length || items.length >= page.count) return items;
    }
}
