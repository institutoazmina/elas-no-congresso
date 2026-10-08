/** Ordenação padrão dos painéis interativos: maior taxa desfavorável. */
export const DEFAULT_DASHBOARD_ORDER: DashboardSort = "unfavorable";
/** Limite oficial do painel "Por autoria": mínimo de proposições únicas. */
export const MIN_PROPOSICOES_POR_PARLAMENTAR = 5;
export const MOBILE_ITEMS_PER_PAGE = 5;
/** Códigos oficiais usados pelos paths interativos do vetor do mapa. */
export const MAP_UF_CODES = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"] as const;

export type DashboardSort = "unfavorable" | "favorable" | "total";
