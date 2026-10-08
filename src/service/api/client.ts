import { API_BASE_URL } from 'astro:env/server';
import { fetchPublicData } from '../../lib/public-data-fetch';

const localPreviewData = (path: string, params: Record<string, string | number | undefined>): unknown => {
  if (!import.meta.env.DEV) return undefined;

  if (path === '/stats/propositions/genders') {
    return { women: { favorable: 0.8331, unfavorable: 0.1669 }, men: { favorable: 0.7346, unfavorable: 0.2654 } };
  }

  if (path === '/stats/propositions/parties') {
    const parties = params.stance === 'favorable'
      ? [['PT', 85, 12], ['PSOL', 70, 8], ['PCdoB', 53, 7], ['PV', 42, 6], ['PSB', 38, 9]]
      : [['PL', 11, 67], ['PP', 15, 49], ['REPUBLICANOS', 13, 45], ['UNIÃO', 18, 41], ['PSD', 20, 35]];
    return { parties: parties.map(([label, favorable, unfavorable]) => ({ label, favorable, unfavorable })) };
  }

  if (path === '/stats/propositions/states') {
    const states = params.stance === 'favorable'
      ? [['BA', 38, 7], ['CE', 36, 8], ['PE', 31, 8], ['PA', 28, 9], ['MA', 26, 10]]
      : [['RO', 8, 39], ['SC', 11, 36], ['ES', 10, 32], ['GO', 12, 30], ['MT', 9, 28]];
    return { states: states.map(([label, favorable, unfavorable]) => ({ label, favorable, unfavorable })) };
  }

  if (path === '/stats/propositions/legislatures') {
    return {
      legislatures: [
        { number: 55, from: 2015, to: 2019, unfavorable: 160 },
        { number: 56, from: 2019, to: 2023, unfavorable: 242 },
        { number: 57, from: 2023, to: 2027, unfavorable: 460 },
      ],
    };
  }

  if (path === '/stats/propositions/categories') {
    return {
      categories: [
        { value: 'dignidade_sexual', label: 'Dignidade sexual', unfavorable: 136 },
        { value: 'violencia_contra_a_mulher', label: 'Violência contra a mulher', unfavorable: 91 },
        { value: 'direitos_sociais', label: 'Direitos sociais', unfavorable: 89 },
        { value: 'genero', label: 'Gênero', unfavorable: 85 },
        { value: 'direitos_sexuais_reprodutivos', label: 'Direitos sexuais e reprodutivos', unfavorable: 81 },
        { value: 'lei_maria_da_penha', label: 'Lei Maria da Penha', unfavorable: 68 },
        { value: 'maternidade', label: 'Maternidade', unfavorable: 52 },
        { value: 'feminicidio', label: 'Feminicídio', unfavorable: 22 },
      ],
    };
  }

  if (path === '/legislatures/parliamentarians') {
    return {
      items: [
        {
          id: 1,
          full_name: 'Ana Souza',
          social_name: null,
          photo_url: null,
          birth_date: '1989-08-22',
          profession: 'Indisponível',
          education: 'Indisponível',
          race: 'Indisponível',
          religion: null,
          favorable_propositions_count: 1,
          unfavorable_propositions_count: 0,
          terms: [{ party: 1, house: 'camara', state: 'SP', end_date: null }],
        },
      ],
      count: 1,
    };
  }

  if (path === '/legislatures/parties') {
    return { count: 1, items: [{ id: 1, acronym: 'PSOL', name: 'Partido Socialismo e Liberdade' }] };
  }

  return undefined;
};

/**
 * GET tipado na API do Elas no Congresso.
 *
 * Roda só no build (site estático). Em produção falha ALTO de propósito: melhor o
 * build quebrar e o site anterior continuar no ar do que publicar um gráfico
 * silenciosamente vazio. Em desenvolvimento, quando não há permissão de rede,
 * usa dados de preview local para manter o build utilizável.
 */
export async function apiGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(API_BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  try {
    const response = await fetchPublicData(url);
    if (!response.ok) {
      throw new Error(`API ${response.status} em ${url.pathname}${url.search}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    const previewData = localPreviewData(path, params);
    if (previewData !== undefined) {
      console.warn(`Não foi possível carregar ${path}; usando dados de preview local.`, error);
      return previewData as T;
    }
    throw error;
  }
}
