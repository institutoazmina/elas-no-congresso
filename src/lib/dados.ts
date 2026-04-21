import dadosJson from '../data/dados.json';

export type ParlamentarData = {
  nome: string;
  numero: number;
  foto: string;
  genero: string;
  partido: string;
  cargo: string;
  estado: string;
  legislatura: string[];
  slug: string;
  autorias: Record<string, number>;
  media: number;
  variancia: number;
  soma: number;
  valor: number | null;
  pos_estado: number;
  pos_ranking: number;
  pos_partido: number;
  v: number;
};

export type ProposicaoData = {
  i: number;
  casa: string;
  numero: string;
  link: string;
  comentario: string | null;
  slug: string;
  resumo: string;
  avaliador: string;
  favoravel: number;
  relevancia: number;
  autores: number[];
  legislatura: string[];
  quiteria_prob: number | null;
};

export type LegislaturaData = {
  parlamentares: Record<string, ParlamentarData>;
  proposicoes: Record<string, ProposicaoData>;
};

export const dados = dadosJson as unknown as { legislaturas: Record<string, LegislaturaData> };
export const legislaturas = dados.legislaturas;
export const legislaturasKeys = Object.keys(legislaturas).sort((a, b) => Number(b) - Number(a));
export const legislaturaAtualDefault = legislaturasKeys[0];

export function getLegislatura(id?: string): { key: string; data: LegislaturaData } {
  const key = id && id in legislaturas ? id : legislaturaAtualDefault;
  return { key, data: legislaturas[key] };
}
