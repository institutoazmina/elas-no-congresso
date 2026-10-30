export type AlertsQueryState = {
    q: string;
    page: number;
    sort: AlertsSortOrder;
};

export type AlertsSortOrder = "newest" | "oldest";

export function parseAlertsQueryState(input: string | URL): AlertsQueryState {
    const url = input instanceof URL ? input : new URL(input);
    const parsedPage = Number(url.searchParams.get("pagina") ?? url.searchParams.get("page"));
    const order = url.searchParams.get("ordem") ?? url.searchParams.get("sort");

    return {
        q: (url.searchParams.get("busca") ?? url.searchParams.get("q"))?.trim() ?? "",
        page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
        sort: order === "antigos" || order === "oldest" ? "oldest" : "newest",
    };
}

export function buildAlertsQueryUrl(input: string | URL, state: AlertsQueryState): URL {
    const url = new URL(input instanceof URL ? input.href : input);
    const query = state.q.trim();
    url.searchParams.delete("q");
    url.searchParams.delete("page");
    url.searchParams.delete("sort");

    if (query) url.searchParams.set("busca", query);
    else url.searchParams.delete("busca");

    if (Number.isInteger(state.page) && state.page > 1) url.searchParams.set("pagina", String(state.page));
    else url.searchParams.delete("pagina");

    if (state.sort === "oldest") url.searchParams.set("ordem", "antigos");
    else url.searchParams.delete("ordem");

    return url;
}
