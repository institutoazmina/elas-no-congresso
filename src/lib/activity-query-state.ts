export const ACTIVITY_PAGE_SIZES = [5, 10, 20, 50] as const;

export type ActivityPaginationState = {
    page: number;
    pageSize: (typeof ACTIVITY_PAGE_SIZES)[number] | null;
};

export const defaultActivityPagination: ActivityPaginationState = { page: 1, pageSize: null };

export function parseActivityPagination(input: string | URL): ActivityPaginationState {
    const url = input instanceof URL ? input : new URL(input);
    const page = Number(url.searchParams.get("pagina") ?? url.searchParams.get("page"));
    const pageSize = Number(url.searchParams.get("itens_por_pagina") ?? url.searchParams.get("page_size"));

    return {
        page: Number.isInteger(page) && page > 0 ? page : 1,
        pageSize: ACTIVITY_PAGE_SIZES.find((size) => size === pageSize) ?? null,
    };
}

export function buildActivityPaginationUrl(input: string | URL, state: ActivityPaginationState): URL {
    const url = new URL(input instanceof URL ? input.href : input);
    url.searchParams.delete("page");
    url.searchParams.delete("page_size");
    if (Number.isInteger(state.page) && state.page > 1) url.searchParams.set("pagina", String(state.page));
    else url.searchParams.delete("pagina");

    if (state.pageSize !== null && ACTIVITY_PAGE_SIZES.includes(state.pageSize)) {
        url.searchParams.set("itens_por_pagina", String(state.pageSize));
    } else {
        url.searchParams.delete("itens_por_pagina");
    }
    return url;
}
