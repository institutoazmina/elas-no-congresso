type ActivityParliamentarian = {
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

type ActivityProposal = {
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
    tema?: string | string[] | null;
    /** Situação oficial da API (current_status). Nunca derivado de quiteria_prob. */
    situacao?: string | null;
    /** Data de apresentação (presented_at da API, YYYY-MM-DD). Alimenta "Atualização". */
    apresentadaEm?: string | null;
};

export type AuthorProposal = ActivityProposal & {
    celerity?: ActivityProposition["celerity"];
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
    const source = [primary, fallback]
        .map((value) => String(value ?? "").trim())
        .find((value) => value && value !== "Indisponível");
    return source ? source.replace(/^http:/, "https:") : null;
}

export function assertSuccessfulApiStatus(status: number): void {
    if (!Number.isInteger(status) || status < 200 || status >= 300)
        throw new Error(`API respondeu com status ${status}`);
}

export function paginateItems<T>(items: T[], currentPage: number, pageSize: number) {
    const safeSize = Math.max(1, Math.trunc(pageSize));
    const pages = Math.max(1, Math.ceil(items.length / safeSize));
    const page = Math.min(Math.max(1, Math.trunc(currentPage) || 1), pages);
    const start = (page - 1) * safeSize;
    return { items: items.slice(start, start + safeSize), page, pages };
}

export function buildAuthorActivityFromApi(
    data: ActivityProposition[],
    authorId: number,
): AuthorActivity | null {
    const sourceAuthor = data
        .flatMap((proposal) => proposal.authors)
        .find((author) => author.id === authorId);
    if (!sourceAuthor) return null;

    const author: ActivityParliamentarian = {
        nome: sourceAuthor.name,
        numero: authorId,
        foto: sourceAuthor.photo_url || undefined,
        genero: sourceAuthor.gender || undefined,
        partido: sourceAuthor.party || undefined,
        cargo: sourceAuthor.role || undefined,
        estado: sourceAuthor.state || undefined,
        slug: authorSlug(sourceAuthor.name) || undefined,
    };
    const proposals = new Map<string, AuthorProposal>();
    for (const item of data) {
        if (!item.authors.some((proposalAuthor) => proposalAuthor.id === authorId)) continue;
        const authors = item.authors.map((proposalAuthor) => ({
            nome: proposalAuthor.name,
            numero: proposalAuthor.id ?? 0,
            foto: proposalAuthor.photo_url || undefined,
            genero: proposalAuthor.gender || undefined,
            partido: proposalAuthor.party || undefined,
            cargo: proposalAuthor.role || undefined,
            estado: proposalAuthor.state || undefined,
            slug: authorSlug(proposalAuthor.name) || undefined,
        }));
        const proposal: AuthorProposal = {
            i: item.id,
            casa: item.house === "senado" ? "Senador" : item.house === "camara" ? "Deputado" : item.house,
            numero: item.number_label,
            link: item.tramitation_url || undefined,
            comentario: item.assessment_comments,
            slug: item.number_label,
            resumo: item.ementa,
            avaliador: item.assessment_organization,
            favoravel: item.is_favorable === true ? 1 : item.is_favorable === false ? -1 : 0,
            legislatura: 0,
            categoria: item.category_label || item.category,
            tema: item.themes?.length ? item.themes : item.category_label || item.category,
            situacao: item.current_status,
            apresentadaEm: item.presented_at,
            celerity: item.celerity,
            quiteria_prob: item.celerity.movements_last_90_days,
            authors,
        };
        proposals.set(`${proposal.casa}:${proposal.numero}`, proposal);
    }

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

function sortReportsByDate<T extends { date?: string; modified?: string }>(reports: T[]): T[] {
    return [...reports].sort(
        (a, b) => Date.parse(b.date || b.modified || "") - Date.parse(a.date || a.modified || ""),
    );
}

export function selectAuthorReports<T extends { date?: string; modified?: string }>(
    related: T[],
    latest: T[],
): { title: "related" | "latest"; reports: T[] } {
    if (related.length > 0) return { title: "related", reports: sortReportsByDate(related).slice(0, 3) };
    return { title: "latest", reports: sortReportsByDate(latest).slice(0, 3) };
}

export function groupProposalRatings(
    proposals: AuthorProposal[],
    field: "categoria" | "tema",
): RatingGroup[] {
    const groups = new Map<string, RatingGroup>();
    for (const proposal of proposals) {
        const source = proposal[field];
        const labels = Array.isArray(source) ? source : [source];
        for (const rawLabel of labels) {
            const label = rawLabel?.trim();
            if (!label) continue;
            const group = groups.get(label) || { label, favorable: 0, unfavorable: 0 };
            if (proposal.favoravel > 0) group.favorable += 1;
            if (proposal.favoravel < 0) group.unfavorable += 1;
            groups.set(label, group);
        }
    }
    return [...groups.values()].sort(
        (a, b) =>
            b.favorable + b.unfavorable - (a.favorable + a.unfavorable) ||
            a.label.localeCompare(b.label, "pt-BR"),
    );
}
import type { ActivityProposition } from "./activity-api";
