export type ActivityParliamentarian = {
    nome: string;
    numero: number;
    foto?: string;
    genero?: string;
    partido?: string;
    cargo?: string;
    estado?: string;
    legislatura?: string[];
    slug?: string;
};

export type ActivityProposal = {
    i: number;
    casa: string;
    numero: string;
    link?: string;
    comentario?: string | null;
    slug: string;
    resumo: string;
    avaliador?: string | null;
    favoravel: number;
    relevancia?: number;
    autores?: Record<string, number>;
    legislatura: number;
    quiteria_prob?: number | null;
    categoria?: string | null;
    tema?: string | null;
};

export type ActivityData = {
    legislaturas: Record<string, {
        parlamentares: Record<string, ActivityParliamentarian>;
        proposicoes: Record<string, ActivityProposal>;
    }>;
};

export type AuthorProposal = ActivityProposal & {
    authors: ActivityParliamentarian[];
};

export type AuthorActivity = {
    author: ActivityParliamentarian;
    proposals: AuthorProposal[];
    favorable: number;
    unfavorable: number;
    unrated: number;
    favorabilityRate: number;
};

export type ParliamentarianTerm = {
    id: number | null;
    parliamentarian: number;
    legislature_number: number;
    party: number;
    house: string;
    role: string;
    state: string;
    external_id: number;
    start_date: string;
    end_date: string | null;
};

export type ApiParliamentarian = {
    id: number | null;
    full_name: string;
    social_name: string | null;
    photo_url: string | null;
    gender: string | null;
    birth_date: string | null;
    race: string | null;
    education: string | null;
    birthplace: string | null;
    profession: string | null;
    religion: string | null;
    bio: string | null;
    favorable_propositions_count: number;
    unfavorable_propositions_count: number;
    terms: ParliamentarianTerm[];
};

export type ApiParty = { id: number | null; acronym: string; name: string };

export type AuthorInitialData = {
    person: ApiParliamentarian;
    term: ParliamentarianTerm;
    parties: ApiParty[];
    activity: AuthorActivity;
};

const byNewestLegislature = ([a]: [string, unknown], [b]: [string, unknown]) => Number(b) - Number(a);

export function parseAuthorId(value: unknown): number | null {
    const text = String(value ?? "").trim();
    if (!/^\d+$/.test(text)) return null;
    const id = Number(text);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function authorSlug(value: unknown): string | null {
    const slug = String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || null;
}

export function authorRoute(value: unknown): string | null {
    if (/^\d+$/.test(String(value ?? "").trim())) return null;
    const slug = authorSlug(value);
    return slug === null ? null : `/atividade-legislativa/autoria/${slug}`;
}

export function normalizePhotoUrl(primary: unknown, fallback?: unknown): string | null {
    const source = [primary, fallback].map((value) => String(value ?? "").trim()).find((value) => value && value !== "Indisponível");
    return source ? source.replace(/^http:/, "https:") : null;
}

export function assertSuccessfulApiStatus(status: number): void {
    if (!Number.isInteger(status) || status < 200 || status >= 300) throw new Error(`API respondeu com status ${status}`);
}

export function paginateItems<T>(items: T[], currentPage: number, pageSize: number) {
    const safeSize = Math.max(1, Math.trunc(pageSize));
    const pages = Math.max(1, Math.ceil(items.length / safeSize));
    const page = Math.min(Math.max(1, Math.trunc(currentPage) || 1), pages);
    const start = (page - 1) * safeSize;
    return { items: items.slice(start, start + safeSize), page, pages };
}

export function getActivityAuthorIds(data: ActivityData): number[] {
    const ids = new Set<number>();
    for (const legislature of Object.values(data.legislaturas)) {
        for (const person of Object.values(legislature.parlamentares || {})) {
            const id = parseAuthorId(person.numero);
            if (id !== null) ids.add(id);
        }
    }
    return [...ids].sort((a, b) => a - b);
}

export function proposalHasAuthor(proposal: ActivityProposal, authorId: number): boolean {
    return Object.prototype.hasOwnProperty.call(proposal.autores || {}, String(authorId));
}

export function buildAuthorActivity(data: ActivityData, authorId: number): AuthorActivity | null {
    let author: ActivityParliamentarian | undefined;
    const proposals = new Map<string, AuthorProposal>();

    for (const [legislatureId, legislature] of Object.entries(data.legislaturas).sort(byNewestLegislature)) {
        const people = legislature.parlamentares || {};
        author ??= Object.values(people).find((person) => person.numero === authorId);

        for (const proposal of Object.values(legislature.proposicoes || {})) {
            if (!proposalHasAuthor(proposal, authorId)) continue;
            const authors = Object.keys(proposal.autores || {}).map((id) => people[id]).filter(Boolean);
            const key = `${proposal.casa}:${proposal.numero}`;
            if (!proposals.has(key)) {
                proposals.set(key, { ...proposal, legislatura: Number(proposal.legislatura || legislatureId), authors });
            }
        }
    }

    if (!author) return null;
    const items = [...proposals.values()];
    const favorable = items.filter((proposal) => proposal.favoravel > 0).length;
    const unfavorable = items.filter((proposal) => proposal.favoravel < 0).length;
    const unrated = items.length - favorable - unfavorable;
    const rated = favorable + unfavorable;

    return {
        author,
        proposals: items,
        favorable,
        unfavorable,
        unrated,
        favorabilityRate: rated === 0 ? 0 : favorable / rated,
    };
}

export function resolveApiParliamentarian(items: ApiParliamentarian[], externalId: number) {
    for (const person of items) {
        const terms = (person.terms || []).filter((term) => term.external_id === externalId);
        if (terms.length === 0) continue;
        const term = terms.find((item) => item.end_date === null) ?? terms.sort((a, b) => b.legislature_number - a.legislature_number)[0];
        return { person, term };
    }
    return null;
}

export function partyForTerm(parties: ApiParty[], term: ParliamentarianTerm | undefined): string {
    if (!term) return "Indisponível";
    return parties.find((party) => party.id === term.party)?.acronym?.trim() || "Indisponível";
}

export function formatApiDate(value: string | null | undefined): string {
    const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : "Indisponível";
}

export function genderLabel(value: string | null | undefined): string {
    const gender = value?.trim().toUpperCase();
    if (gender === "F" || gender === "FEMININO") return "Feminino";
    if (gender === "M" || gender === "MASCULINO") return "Masculino";
    return "Indisponível";
}

export function houseLabel(value: string | null | undefined): string {
    const house = value?.trim().toLowerCase();
    if (house === "camara" || house === "câmara" || house === "deputado") return "Câmara dos Deputados";
    if (house === "senado" || house === "senador") return "Senado Federal";
    return "Congresso Nacional";
}

export type RatingGroup = { label: string; favorable: number; unfavorable: number };

export type AuthorReport = { date?: string; modified?: string; link: string; title: { rendered: string }; _embedded?: { "wp:featuredmedia"?: Array<{ source_url?: string; link?: string; alt_text?: string; media_details?: { sizes?: Record<string, { source_url?: string }> } }> } };

export function sortReportsByDate<T extends { date?: string; modified?: string }>(reports: T[]): T[] {
    return [...reports].sort((a, b) => Date.parse(b.date || b.modified || "") - Date.parse(a.date || a.modified || ""));
}

export function selectAuthorReports<T extends { date?: string; modified?: string }>(related: T[], latest: T[]): { title: "related" | "latest"; reports: T[] } {
    if (related.length > 0) return { title: "related", reports: sortReportsByDate(related).slice(0, 3) };
    return { title: "latest", reports: sortReportsByDate(latest).slice(0, 3) };
}

export function groupProposalRatings(proposals: AuthorProposal[], field: "categoria" | "tema"): RatingGroup[] {
    const groups = new Map<string, RatingGroup>();
    for (const proposal of proposals) {
        const label = proposal[field]?.trim();
        if (!label) continue;
        const group = groups.get(label) || { label, favorable: 0, unfavorable: 0 };
        if (proposal.favoravel > 0) group.favorable += 1;
        if (proposal.favoravel < 0) group.unfavorable += 1;
        groups.set(label, group);
    }
    return [...groups.values()].sort((a, b) => (b.favorable + b.unfavorable) - (a.favorable + a.unfavorable) || a.label.localeCompare(b.label, "pt-BR"));
}
