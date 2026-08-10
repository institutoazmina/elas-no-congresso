/**
 * Opções do modal de alertas, lidas da API no build.
 *
 * Os valores aqui não são rótulos: são os tokens que o matcher da API gera para
 * cada proposição (categoria da anotação, sigla da comissão). Hardcodar essa
 * lista já quebrou uma vez — valor fora da taxonomia nunca casa com nada.
 *
 * Tema no modal = "Categorias 2026" (`/taxonomy/categories`, 10 itens), a
 * taxonomia editorial das avaliadoras — não `/taxonomy/themes`, que são as
 * ~60 palavras-chave granulares do raspador.
 */
import { apiGet } from './client';

export type CategoryOption = { value: string; label: string };
export type CommitteeOption = { acronym: string; name: string; house: string };

type Paginated<T> = { items: T[] };

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  return apiGet<CategoryOption[]>('/taxonomy/categories');
}

export async function getCommitteeOptions(): Promise<CommitteeOption[]> {
  const { items } = await apiGet<Paginated<CommitteeOption>>('/committees/', {
    active: 'true',
    limit: 200,
  });
  return items.map(({ acronym, name, house }) => ({ acronym, name, house }));
}
