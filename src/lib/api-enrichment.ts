/**
 * Enriquecimento P0 com a API oficial do Elas no Congresso.
 *
 * Estratégia (Etapa 4): snapshots versionados em `src/data/` gerados da API
 * oficial em 2026-09-28 + consumo live SOMENTE de endpoints leves
 * (parlamentares/partidos já seguiam esse padrão no build).
 *
 * Motivo do snapshot para `/propositions` e `/dataset`: o pull integral
 * (~56MB + ~27MB) excede o orçamento de 15s por request do `apiGet` e
 * tornaria todo build dependente de ~80MB de rede. O refresh é manual e
 * documentado no relatório 1.3 (procedimento + comandos).
 *
 * Fallback: dados.json (curadoria existente) SEMPRE funciona sozinho.
 * API = enriquecimento. Nenhum campo técnico (`created_at/updated_at`)
 * é exposto aqui — nunca exibir como tramitação.
 */
import { canonicalPropositionKey } from "./canonical.ts";
import detalheApi from "../data/proposicoes-api-detalhe.json" with { type: "json" };
import categoriasDataset from "../data/categorias-proposicoes.json" with { type: "json" };
import taxonomia from "../data/taxonomia-categorias.json" with { type: "json" };

export type PropositionApiDetail = {
    apresentada_em: string | null;
    situacao: string | null;
    situacao_codigo: number | null;
    palavras_chave: string | null;
    url_texto: string | null;
    url_tramitacao: string | null;
    regime: string | null;
    ano_api: number;
    tipo: string;
};

export type PropositionCategoryEntry = {
    categoria: string;
    anotacoes: number;
};

export type TaxonomyCategory = { value: string; label: string };

type DetalheFile = { proposicoes: Record<string, PropositionApiDetail> };
type CategoriasFile = { categorias: Record<string, PropositionCategoryEntry> };
type TaxonomiaFile = { categorias: TaxonomyCategory[] };

const detalhe = (detalheApi as unknown as DetalheFile).proposicoes;
const categoriasMap = (categoriasDataset as unknown as CategoriasFile).categorias;
const taxonomiaList = (taxonomia as unknown as TaxonomiaFile).categorias;

/** Detalhe da API por chave canônica, ou null quando a proposição é das 88 sem match. */
export function getApiDetail(casa: unknown, numero: unknown): PropositionApiDetail | null {
    return detalhe[canonicalPropositionKey(casa, numero)] ?? null;
}

/** Categoria editorial (Categorias 2026) ou null. `dataset.theme` = categoria. */
export function getPropositionCategory(casa: unknown, numero: unknown): string | null {
    return categoriasMap[canonicalPropositionKey(casa, numero)]?.categoria ?? null;
}

/** As 10 categorias oficiais (labels para filtro/dashboard). */
export function getTaxonomyCategories(): TaxonomyCategory[] {
    return taxonomiaList;
}

/** Labels de categoria (ordenados pt-BR) para popular o filtro. */
export function getTaxonomyLabels(): string[] {
    return taxonomiaList.map((item) => item.label).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/**
 * Junta tema majoritário do dataset por proposição (usado no refresh).
 * Regra documentada: tema mais frequente vence; empate = primeiro visto.
 */
export function majorityTheme(rows: Array<{ theme?: string | null }>): string | null {
    const counts = new Map<string, number>();
    for (const row of rows) {
        const theme = row.theme?.trim();
        if (!theme) continue;
        counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
    let winner: string | null = null;
    let best = 0;
    for (const [theme, count] of counts) {
        if (count > best) {
            best = count;
            winner = theme;
        }
    }
    return winner;
}
