/**
 * Regras de cálculo dos painéis estatísticos da página "Propostas e votações".
 *
 * Unidades por painel:
 * - resumo geral, Por casa: proposições únicas;
 * - Por partido: canetadas (autorias/assinaturas únicas por proposição);
 * - Por autoria: proposições únicas por parlamentar;
 * - Por gênero, Por UF: autorias únicas por proposição.
 */

// ---------------------------------------------------------------------------
// Regras editoriais oficiais da Atividade Legislativa.
// Não espalhar o modo de ordenação ou o limite de autoria pelo código:
// usar estas constantes nos controles, mensagens e parâmetros das funções.
// ---------------------------------------------------------------------------
/** Ordenação padrão dos painéis interativos: maior taxa desfavorável. */
export const DEFAULT_DASHBOARD_ORDER: DashboardSort = "unfavorable";
/** Limite oficial do painel "Por autoria": mínimo de proposições únicas. */
export const MIN_PROPOSICOES_POR_PARLAMENTAR = 5;
export const DESKTOP_ITEMS_PER_PAGE = 10;
export const MOBILE_ITEMS_PER_PAGE = 5;
export function getDefaultItemsPerPage(isMobile: boolean): number {
    return isMobile ? MOBILE_ITEMS_PER_PAGE : DESKTOP_ITEMS_PER_PAGE;
}
/** Unidade do painel "Por partido": todas as autorias únicas. */
export const PARTY_COUNT_MODE = "all-unique-authorships" as const;
/** Unidade do painel "Por gênero": todas as autorias únicas. */
export const GENDER_COUNT_MODE = "all-unique-authorships" as const;
/** Unidade do painel "Por UF": todas as autorias únicas. */
export const UF_COUNT_MODE = "all-unique-authorships" as const;
/** Códigos oficiais usados pelos paths interativos do vetor do mapa. */
export const MAP_UF_CODES = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"] as const;
export function isMapUfCode(value: string): boolean {
    return (MAP_UF_CODES as readonly string[]).includes(value.trim().toUpperCase());
}

/** Domínio absoluto da taxa favorável no mapa, independente dos filtros. */
export const MAP_FAVORABILITY_DOMAIN = [0.6, 0.9] as const;
export const MAP_FAVORABILITY_COLORS = {
    unfavorable: "#FF5865",
    midpoint: "#FFFFFF",
    favorable: "#C1E639",
    unavailable: "#998D96",
} as const;
/** Sete amostras exatas exportadas da legenda divergente do Figma. */
export const MAP_FAVORABILITY_STOPS = [
    { rate: 0.60, color: "#FF5865" },
    { rate: 0.65, color: "#FF9098" },
    { rate: 0.70, color: "#FFC7CC" },
    { rate: 0.75, color: "#FFFFFF" },
    { rate: 0.80, color: "#EAF7BD" },
    { rate: 0.85, color: "#D6EE7B" },
    { rate: 0.90, color: "#C1E639" },
] as const;

export type DashboardSort = "unfavorable" | "favorable" | "total";
export type CountMode = "all-unique-authorships";

export type DashboardRow = { key: string; label: string; favorable: number; unfavorable: number; photo?: string; meta?: string };

/** Taxa desfavorável: desfavoráveis / (favoráveis + desfavoráveis). Sem avaliação não entra. */
export function calculateUnfavorableRate(row: DashboardRow): number {
    const total = row.favorable + row.unfavorable;
    return total ? row.unfavorable / total : 0;
}

/** Taxa favorável: favoráveis / (favoráveis + desfavoráveis). Sem avaliação não entra. */
export function calculateFavorableRate(row: DashboardRow): number {
    const total = row.favorable + row.unfavorable;
    return total ? row.favorable / total : 0;
}

/** Taxa favorável do mapa. Sem proposição avaliada, a taxa não existe. */
export function calculateMapFavorableRate(row: DashboardRow): number | null {
    const total = row.favorable + row.unfavorable;
    return total > 0 ? row.favorable / total : null;
}

const interpolateRgb = (fromHex: string, toHex: string, amount: number): string => {
    const from = Number.parseInt(fromHex.slice(1), 16);
    const to = Number.parseInt(toHex.slice(1), 16);
    const channel = (shift: number) => {
        const start = (from >> shift) & 255;
        const end = (to >> shift) & 255;
        return Math.round(start + (end - start) * amount).toString(16).padStart(2, "0");
    };
    return `#${channel(16)}${channel(8)}${channel(0)}`.toUpperCase();
};

/**
 * Cor absoluta do mapa. A taxa é normalizada no domínio fixo de 60% a 90%,
 * com branco em 75%; filtros nunca alteram esse domínio.
 */
export function mapFavorableRateToColor(rate: number | null): string {
    if (rate === null) return MAP_FAVORABILITY_COLORS.unavailable;
    if (rate <= MAP_FAVORABILITY_STOPS[0].rate) return MAP_FAVORABILITY_STOPS[0].color;
    if (rate >= MAP_FAVORABILITY_STOPS.at(-1)!.rate) return MAP_FAVORABILITY_STOPS.at(-1)!.color;
    const upperIndex = MAP_FAVORABILITY_STOPS.findIndex((stop) => rate <= stop.rate);
    const lower = MAP_FAVORABILITY_STOPS[upperIndex - 1];
    const upper = MAP_FAVORABILITY_STOPS[upperIndex];
    const amount = (rate - lower.rate) / (upper.rate - lower.rate);
    return interpolateRgb(lower.color, upper.color, amount);
}

export function getSingleDashboardResultMessage(kind: "party" | "author", rows: DashboardRow[]): string | null {
    if (rows.length !== 1) return null;
    return kind === "party"
        ? "Para ver mais partidos, tente remover filtros."
        : "Para ver mais parlamentares, tente remover filtros.";
}

export function normalizeUnavailable(value: unknown, fallback = "Indefinido"): string {
    if (value == null) return fallback;
    const str = String(value).trim();
    return str !== "" ? str : fallback;
}

export function sortDashboardRows(rows: DashboardRow[], mode: DashboardSort = DEFAULT_DASHBOARD_ORDER): DashboardRow[] {
    const tiebreakByTotal = (a: DashboardRow, b: DashboardRow) => (b.favorable + b.unfavorable) - (a.favorable + a.unfavorable);
    const tiebreakByName = (a: DashboardRow, b: DashboardRow) => a.label.localeCompare(b.label, "pt-BR", { numeric: true });
    return [...rows].sort((a, b) => {
        if (mode === "total") {
            // Maior total; desempate técnico pela maior taxa desfavorável; depois A–Z.
            return tiebreakByTotal(a, b) || calculateUnfavorableRate(b) - calculateUnfavorableRate(a) || tiebreakByName(a, b);
        }
        const primary = mode === "favorable"
            ? calculateFavorableRate(b) - calculateFavorableRate(a)
            : calculateUnfavorableRate(b) - calculateUnfavorableRate(a);
        return primary || tiebreakByTotal(a, b) || tiebreakByName(a, b);
    });
}

// ---------------------------------------------------------------------------
// Identificação de parlamentares.
// Chave preferencial: `numero` (identificador único estável da base).
// Fallback determinístico quando ausente: slug estável ou nome normalizado.
// Nunca agrupa pessoas distintas sem número na mesma chave; nunca usa índice,
// posição ou valor aleatório. Limitação conhecida: homônimos sem número e sem
// slug colidem no fallback por nome (documentado; base atual não tem o caso).
// ---------------------------------------------------------------------------
export type AuthorLike = {
    numero?: number | null;
    nome?: string | null;
    slug?: string | null;
    partido?: string | null;
    genero?: string | null;
    estado?: string | null;
};

const normalizeToken = (value: unknown): string =>
    String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

export function personKey(author: AuthorLike): string {
    if (author.numero !== undefined && author.numero !== null && String(author.numero).trim() !== "") {
        return `num:${author.numero}`;
    }
    const slug = normalizeToken(author.slug);
    if (slug) return `slug:${slug}`;
    return `nome:${normalizeToken(author.nome) || "desconhecido"}`;
}

export function deduplicateAuthorsByPerson(authors: AuthorLike[]): Array<{ key: string; partido: string }> {
    const seen = new Set<string>();
    const result: Array<{ key: string; partido: string }> = [];
    for (const author of authors) {
        const key = personKey(author);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ key, partido: normalizeUnavailable(author.partido, "Indefinido") });
    }
    return result;
}

export function groupCanetadasByParty(
    items: Array<{ authors: AuthorLike[]; favorable: number }>,
    mode: CountMode = PARTY_COUNT_MODE,
): Map<string, { favorable: number; unfavorable: number }> {
    if (mode !== "all-unique-authorships") throw new Error(`PARTY_COUNT_MODE não suportado: ${mode}`);
    const groups = new Map<string, { favorable: number; unfavorable: number }>();
    for (const item of items) {
        const uniqueAuthors = deduplicateAuthorsByPerson(item.authors);
        for (const author of uniqueAuthors) {
            // A base fornece um único `partido` por pessoa (partido atual do
            // cadastro); não há partido histórico por proposição — não inventar.
            // "Poder Executivo" nunca é partido parlamentar: pessoas sem partido
            // válido caem em "Indefinido", nunca em agrupamento incorreto.
            const party = author.partido;
            const existing = groups.get(party) || { favorable: 0, unfavorable: 0 };
            if (item.favorable > 0) existing.favorable += 1;
            if (item.favorable < 0) existing.unfavorable += 1;
            groups.set(party, existing);
        }
    }
    return groups;
}

/**
 * Agrega autorias únicas por proposição segundo uma dimensão (gênero, UF).
 * `getGroup` devolve `{ key, label }` ou `null` para ignorar a autoria
 * (ex.: UF inválida). Uma proposição com N autorias válidas contribui N vezes.
 */
export function aggregateAuthorships(
    items: Array<{ authors: AuthorLike[]; favorable: number }>,
    getGroup: (author: AuthorLike) => { key: string; label: string } | null,
    mode: CountMode = GENDER_COUNT_MODE,
): DashboardRow[] {
    if (mode !== "all-unique-authorships") throw new Error(`COUNT_MODE não suportado: ${mode}`);
    const rows = new Map<string, DashboardRow>();
    for (const item of items) {
        const seen = new Set<string>();
        for (const author of item.authors) {
            const key = personKey(author);
            if (seen.has(key)) continue;
            seen.add(key);
            const group = getGroup(author);
            if (!group) continue;
            const row = rows.get(group.key) || { ...group, favorable: 0, unfavorable: 0 };
            if (item.favorable > 0) row.favorable += 1;
            if (item.favorable < 0) row.unfavorable += 1;
            rows.set(group.key, row);
        }
    }
    return [...rows.values()];
}

export function countAuthorProposals(items: Array<{ authors: AuthorLike[] }>): Map<string, number> {
    const counts = new Map<string, number>();
    for (const item of items) {
        const seen = new Set<string>();
        for (const author of item.authors) {
            const key = personKey(author);
            if (seen.has(key)) continue;
            seen.add(key);
            counts.set(key, (counts.get(key) || 0) + 1);
        }
    }
    return counts;
}

export function filterAuthorsByMinProposals(
    rows: DashboardRow[],
    proposalCounts: Map<string, number>,
    min: number = MIN_PROPOSICOES_POR_PARLAMENTAR,
): DashboardRow[] {
    return rows.filter((row) => {
        if (!row.key.startsWith("person:")) return false;
        const key = row.key.slice("person:".length);
        if (!key) return false;
        return (proposalCounts.get(key) || 0) >= min;
    });
}

export function buildDashboardRow(
    key: string,
    label: string,
    favorable: number,
    unfavorable: number,
    options?: { photo?: string; meta?: string },
): DashboardRow {
    return { key, label, favorable, unfavorable, ...options };
}

// ---------------------------------------------------------------------------
// Normalização de gênero.
// Origem do erro "Alê Silva"/"Olival Marques": dois cadastros trazem o nome
// da própria pessoa no campo `genero` (leg 56 pid 204545; leg 57 pid 204498).
// A correção é na normalização, não nos nomes: só F/M entram como categorias.
// ---------------------------------------------------------------------------
export type GenderCode = "F" | "M" | "U";
export const GENDER_LABELS: Record<GenderCode, string> = { F: "Feminino", M: "Masculino", U: "Não informado" };

export function normalizeGenderCode(value: unknown): GenderCode {
    const token = normalizeToken(value).toUpperCase();
    if (token === "F" || token === "FEMININO") return "F";
    if (token === "M" || token === "MASCULINO") return "M";
    return "U";
}

// ---------------------------------------------------------------------------
// Normalização de UF: somente as 27 siglas oficiais. Sem inferência.
// ---------------------------------------------------------------------------
const VALID_UFS = new Set([
    "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT",
    "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO",
]);

export function normalizeUfCode(value: unknown): string | null {
    const token = normalizeToken(value).toUpperCase();
    return token.length === 2 && VALID_UFS.has(token) ? token : null;
}

// ---------------------------------------------------------------------------
// Normalização de casa: Senado, Câmara ou Poder Executivo; demais valores
// retornam null (registrar no relatório de qualidade, sem conversão silenciosa).
// ---------------------------------------------------------------------------
export type CasaCode = "senado" | "camara" | "executivo";
export const CASA_LABELS: Record<CasaCode, string> = { senado: "Senado", camara: "Câmara", executivo: "Poder Executivo" };

export function normalizeCasa(value: unknown): CasaCode | null {
    const token = normalizeToken(value);
    if (!token) return null;
    if (token.startsWith("sen")) return "senado";
    if (token.startsWith("dep") || token.includes("cam")) return "camara";
    if (token.includes("executivo")) return "executivo";
    return null;
}

// ---------------------------------------------------------------------------
// Relatório de qualidade dos dados: valores inválidos/ausentes encontrados
// durante a hidratação (gênero, UF, casa, partido, autores sem número,
// autorias sem cadastro correspondente).
// ---------------------------------------------------------------------------
export type QualityKind = "genero-invalido" | "uf-invalida" | "casa-desconhecida" | "partido-ausente" | "autor-sem-numero" | "autoria-nao-resolvida";
export type QualityIssue = { kind: QualityKind; detail: string };

export function createQualityCollector() {
    const issues: QualityIssue[] = [];
    return {
        record(kind: QualityKind, detail: string) {
            issues.push({ kind, detail });
        },
        get issues() {
            return issues;
        },
        summary() {
            const byKind = {} as Record<QualityKind, number>;
            for (const issue of issues) byKind[issue.kind] = (byKind[issue.kind] || 0) + 1;
            return { total: issues.length, byKind, samples: issues.slice(0, 10) };
        },
    };
}

export type QualityCollector = ReturnType<typeof createQualityCollector>;
