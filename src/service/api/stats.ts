/**
 * Agregações de proposições desfavoráveis — um endpoint por gráfico da home.
 *
 * A API responde com envelope (`{ "categories": [...] }`); aqui ele é
 * desembrulhado, então o componente recebe o array/objeto direto.
 *
 * Contagem, igual em todos os cortes: 1 desfavorável = 1 proposição distinta
 * com ao menos uma anotação desfavorável. Partido/estado/gênero atribuem a
 * proposição a todos os coautores — a soma dos grupos passa do total geral,
 * é ranking e não partição.
 */
import { apiGet } from './client';

const BASE = '/stats/propositions';

export type Stance = 'unfavorable' | 'favorable';

export type LegislatureStat = {
  number: number;
  from: number;
  to: number;
  label: string;
  unfavorable: number;
};

export type CategoryStat = {
  /** slug da taxonomia (ex.: `violencias_de_genero`), para filtrar sem depender do label */
  value: string;
  label: string;
  unfavorable: number;
};

/** Proporções que somam 1.0 dentro do próprio gênero. */
export type StanceRatio = {
  favorable: number;
  unfavorable: number;
};

export type GenderStats = {
  women: StanceRatio;
  men: StanceRatio;
};

export type GroupStat = {
  /** sigla do partido ou UF */
  label: string;
  favorable: number;
  unfavorable: number;
};

/** Ranking canônico de UFs, calculado e ordenado pela API. */
export type StateStat = GroupStat & {
  total: number;
  favorable_percentage: number;
  unfavorable_percentage: number;
};

type RankingOptions = {
  /** métrica que ordena o ranking (padrão: `unfavorable`) */
  stance?: Stance;
  /** tamanho do top N (padrão: 5) */
  limit?: number;
};

/** Proposições desfavoráveis por legislatura, da mais antiga para a mais nova. */
export async function getUnfavorableByLegislature(): Promise<LegislatureStat[]> {
  const data = await apiGet<{ legislatures: LegislatureStat[] }>(`${BASE}/legislatures`);
  return data.legislatures;
}

/** Proposições desfavoráveis por categoria, da maior para a menor. */
export async function getUnfavorableByCategory(): Promise<CategoryStat[]> {
  const data = await apiGet<{ categories: CategoryStat[] }>(`${BASE}/categories`);
  return data.categories;
}

/** Favorável × desfavorável dentro de cada gênero da autoria. */
export function getStanceByGender(): Promise<GenderStats> {
  return apiGet<GenderStats>(`${BASE}/genders`);
}

/** Top N partidos, ranqueados pela métrica de `stance`. */
export async function getStanceByParty({
  stance = 'unfavorable',
  limit = 5,
}: RankingOptions = {}): Promise<GroupStat[]> {
  const data = await apiGet<{ parties: GroupStat[] }>(`${BASE}/parties`, { stance, limit });
  return data.parties;
}

/** Top N UFs, ranqueadas pela porcentagem da métrica de `stance` na API. */
export async function getStanceByState({
  stance = 'unfavorable',
  limit = 5,
}: RankingOptions = {}): Promise<StateStat[]> {
  const data = await apiGet<{ states: StateStat[] }>(`${BASE}/states`, { stance, limit });
  return data.states;
}
