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
export type AlertProposition = {
  id: number;
  typeCode: string;
  numberLabel: string;
  presentedAt: string;
  summary: string;
  url: string;
};
export type AlertPropositionsPage = { items: AlertProposition[]; count: number };

type Paginated<T> = { items: T[]; count: number };

type PropositionResponse = {
  id: number;
  type_code: string;
  number_label: string;
  presented_at: string;
  ementa: string;
  tramitation_url: string;
};

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  return apiGet<CategoryOption[]>('/taxonomy/categories');
}

export async function getAlertPropositions(): Promise<AlertPropositionsPage> {
  const { items, count } = await apiGet<Paginated<PropositionResponse>>('/propositions/', {
    limit: 20,
    offset: 0,
    sort: 'newest',
  });

  return {
    count,
    items: items.map((item) => ({
      id: item.id,
      typeCode: item.type_code,
      numberLabel: item.number_label,
      presentedAt: item.presented_at,
      summary: item.ementa,
      url: item.tramitation_url,
    })),
  };
}
