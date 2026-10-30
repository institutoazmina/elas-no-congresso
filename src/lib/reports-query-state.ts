export function parseReportsPage(input: string | URL): number {
    const url = input instanceof URL ? input : new URL(input);
    const page = Number(url.searchParams.get("pagina"));
    return Number.isInteger(page) && page > 0 ? page : 1;
}

export function buildReportsPageUrl(input: string | URL, page: number): URL {
    const url = new URL(input instanceof URL ? input.href : input);
    if (Number.isInteger(page) && page > 1) url.searchParams.set("pagina", String(page));
    else url.searchParams.delete("pagina");
    return url;
}
