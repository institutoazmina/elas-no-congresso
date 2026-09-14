export type AlertsQueryState = {
    q: string;
    page: number;
    sort: AlertsSortOrder;
};

export type AlertsSortOrder = "newest" | "oldest";
export type HistoryMode = "push" | "replace" | "none";

export function parseAlertsQueryState(input: string | URL): AlertsQueryState {
    const url = input instanceof URL ? input : new URL(input);
    const parsedPage = Number(url.searchParams.get("page"));

    return {
        q: url.searchParams.get("q")?.trim() ?? "",
        page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
        sort: url.searchParams.get("sort") === "oldest" ? "oldest" : "newest",
    };
}

export function buildAlertsQueryUrl(input: string | URL, state: AlertsQueryState): URL {
    const url = new URL(input instanceof URL ? input.href : input);
    const query = state.q.trim();

    if (query) url.searchParams.set("q", query);
    else url.searchParams.delete("q");

    if (Number.isInteger(state.page) && state.page > 1) url.searchParams.set("page", String(state.page));
    else url.searchParams.delete("page");

    if (state.sort === "oldest") url.searchParams.set("sort", "oldest");
    else url.searchParams.delete("sort");

    return url;
}

export function updateAlertsQueryState(state: AlertsQueryState, mode: HistoryMode = "replace"): void {
    if (mode === "none") return;
    const url = buildAlertsQueryUrl(window.location.href, state);
    window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", url);
}

export function onAlertsQueryStateChange(listener: (state: AlertsQueryState) => void): () => void {
    const handlePopState = () => listener(parseAlertsQueryState(window.location.href));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
}
