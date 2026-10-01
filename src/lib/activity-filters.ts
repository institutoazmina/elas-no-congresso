import { normalizeEvaluatorKey } from "./canonical.ts";

export type ActivityAssessment = "favorable" | "unfavorable" | "unrated" | "";

export type ActivityFilterState = {
    search: string;
    house: string;
    year: string;
    party: string;
    category: string;
    assessment: ActivityAssessment;
    status: string;
    movements: "" | "with" | "without";
    gender: string;
    state: string;
    comments: string;
    evaluator: string;
};

export type ActivityFilterItem = {
    numero: string;
    resumo: string;
    casa: string;
    year: number;
    favoravel: number;
    situacao?: string | null;
    movementsLast90Days?: number | null;
    avaliador?: string | null;
    comentario?: string | null;
    categoria?: string | null;
    parties: string[];
    states: string[];
    genders: string[];
    authors: Array<{ nome?: string | null; partido?: string | null; estado?: string | null; genero?: string | null }>;
};

export const EMPTY_ACTIVITY_FILTERS: Readonly<ActivityFilterState> = Object.freeze({
    search: "",
    house: "",
    year: "",
    party: "",
    category: "",
    assessment: "",
    status: "",
    movements: "",
    gender: "",
    state: "",
    comments: "",
    evaluator: "",
});

export const normalizeActivitySearch = (value: unknown) => String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Status oficial, preservado para exibição e comparado sem espaços acidentais. */
export const normalizeActivityStatus = (value: unknown) => String(value ?? "").trim();

export function activityAssessment(value: number): Exclude<ActivityAssessment, ""> {
    if (value > 0) return "favorable";
    if (value < 0) return "unfavorable";
    return "unrated";
}

export function matchesActivityFilters(item: ActivityFilterItem, filters: ActivityFilterState) {
    const query = normalizeActivitySearch(filters.search.trim());
    const haystack = normalizeActivitySearch([
        item.numero,
        item.resumo,
        item.avaliador,
        ...item.authors.map((author) => `${author.nome ?? ""} ${author.partido ?? ""} ${author.estado ?? ""}`),
    ].join(" "));

    return (!query || haystack.includes(query))
        && (!filters.house || normalizeActivitySearch(item.casa).startsWith(normalizeActivitySearch(filters.house)))
        && (!filters.year || item.year === Number(filters.year))
        && (!filters.party || item.parties.includes(filters.party))
        && (!filters.category || normalizeActivitySearch(item.categoria) === normalizeActivitySearch(filters.category))
        && (!filters.assessment || activityAssessment(item.favoravel) === filters.assessment)
        && (!filters.status || normalizeActivityStatus(item.situacao) === normalizeActivityStatus(filters.status))
        && (!filters.movements || (filters.movements === "with"
            ? (item.movementsLast90Days ?? 0) > 0
            : (item.movementsLast90Days ?? 0) === 0))
        && (!filters.gender || item.genders.includes(filters.gender))
        && (!filters.state || item.states.includes(filters.state))
        && (!filters.evaluator || normalizeEvaluatorKey(item.avaliador) === normalizeEvaluatorKey(filters.evaluator))
        && (!filters.comments || (filters.comments === "yes" ? Boolean(item.comentario) : !item.comentario));
}

export function filterActivityItems<T extends ActivityFilterItem>(items: T[], filters: ActivityFilterState) {
    return items.filter((item) => matchesActivityFilters(item, filters));
}

/**
 * Nos painéis baseados em autoria, o recorte de UF/gênero precisa ser aplicado
 * à pessoa que assina — e não apenas à proposição que ela coassinou. Os demais
 * filtros já foram aplicados em `filterActivityItems`.
 */
export function filterDashboardAuthors<T extends ActivityFilterItem>(item: T, filters: Pick<ActivityFilterState, "state" | "gender">) {
    return item.authors.filter((author) =>
        (!filters.state || String(author.estado ?? "").trim().toUpperCase() === filters.state)
        && (!filters.gender || String(author.genero ?? "").trim().toUpperCase() === filters.gender),
    );
}

export function getActivityCategories(items: Array<Pick<ActivityFilterItem, "categoria">>) {
    return [...new Set(items.map((item) => item.categoria?.trim()).filter((category): category is string => Boolean(category)))]
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getActivityStatuses(items: Array<Pick<ActivityFilterItem, "situacao">>) {
    return [...new Set(items.map((item) => normalizeActivityStatus(item.situacao)).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function paginateActivityItems<T>(items: T[], requestedPage: number, itemsPerPage: number) {
    const pageCount = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const page = Math.min(Math.max(1, requestedPage), pageCount);
    const start = (page - 1) * itemsPerPage;
    return { page, pageCount, items: items.slice(start, start + itemsPerPage) };
}
