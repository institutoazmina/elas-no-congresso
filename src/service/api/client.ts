import { API_BASE_URL } from 'astro:env/server';
import { fetchPublicData } from '../../lib/public-data-fetch';
import feministAIPreview from './feminist-ai-preview.json';
import aboutPreview from './about-preview.json';
import homePreview from './home-preview.json';
import feministAIHero from '../../assets/images/quiteria.png';
import aboutHero from '../../assets/images/birds.png';
import homeHero from '../../assets/images/hero/hero-congress-illustration.webp';
import homeExplore from '../../assets/images/explore/screen-tool-@3x.png';
import homeQuiteria from '../../assets/images/quiteria-banner.png';
import feministAIFlowDesktop from '../../assets/images/ia-feminista/processing-flow.svg';
import feministAIFlowMobile from '../../assets/images/ia-feminista/processing-flow-mobile.png';
import codesInfo from '../../assets/images/funders/codesinfo.png';
import iaFeminista from '../../assets/images/funders/ia-feminista-figma-original.png';
import projor from '../../assets/images/funders/projor.png';
import franceAfd from '../../assets/images/funders/france-afd.png';
import elasFunder from '../../assets/images/funders/elas.png';

const localPreviewData = (path: string, params: Record<string, string | number | undefined>): unknown => {
  if (!import.meta.env.DEV) return undefined;

  if (path === '/cms/feminist-ai') {
    return {
      ...feministAIPreview,
      hero_image: { url: feministAIHero.src, width: feministAIHero.width, height: feministAIHero.height, alt: 'Ilustração de Maria Quitéria' },
      content: feministAIPreview.content
        .replace('/media/cms/ia-feminista/flow-desktop.webp', feministAIFlowDesktop.src)
        .replace('/media/cms/ia-feminista/flow-mobile.webp', feministAIFlowMobile.src),
    };
  }

  if (path === '/cms/about') {
    return {
      seo_title: aboutPreview.seo_title,
      seo_description: aboutPreview.seo_description,
      title: aboutPreview.title,
      subtitle: aboutPreview.subtitle,
      hero_image: { url: aboutHero.src, width: aboutHero.width, height: aboutHero.height, alt: '' },
      content: aboutPreview.content,
      partners: aboutPreview.partners,
      team: aboutPreview.team,
    };
  }

  if (path === '/cms/home') {
    return {
      ...homePreview,
      hero_image: { url: homeHero.src, width: homeHero.width, height: homeHero.height, alt: '' },
      content: homePreview.content
        .replace('/media/cms/markdown/74f5b946d93741f6a9c735e6df082cf5.webp', homeExplore.src)
        .replace('/media/cms/markdown/b766dd167511410aa590f8814672c8e7.webp', homeQuiteria.src),
    };
  }

  if (path === '/cms/footer-alerts') {
    return {
      title: 'Receba nossos alertas',
      text: 'Quer saber quando uma nova proposta sobre gênero é apresentada, ou quando algo de muita importância avança? A gente te avisa!',
      cta_text: 'Saiba mais',
      cta_url: '/alertas',
      social_links: [
        { icon: 'instagram', label: 'Instagram da AzMina', url: 'https://instagram.com/revistaazmina' },
        { icon: 'tiktok', label: 'TikTok da AzMina', url: 'https://www.tiktok.com/@revistaazmina' },
        { icon: 'substack', label: 'Substack da AzMina', url: 'https://substack.com/@institutoazmina' },
        { icon: 'youtube', label: 'YouTube da AzMina', url: 'https://www.youtube.com/channel/UCoyYnOCs_pr0oaXSitYi35g' },
        { icon: 'github', label: 'GitHub da AzMina', url: 'https://github.com/institutoazmina' },
        { icon: 'bluesky', label: 'Bluesky da AzMina', url: 'https://bsky.app/profile/revistaazmina.bsky.social' },
        { icon: 'linkedin', label: 'LinkedIn da AzMina', url: 'https://br.linkedin.com/company/instituto-azmina' },
        { icon: 'whatsapp', label: 'Comunidade no WhatsApp da AzMina', url: 'https://whatsapp.com/channel/0029VaNjCFjAe5VhB6mbY844' },
      ],
      funders: [
        { name: 'IA Feminista', logo_url: iaFeminista.src },
        { name: 'Codesinfo', logo_url: codesInfo.src },
        { name: 'Projor', logo_url: projor.src },
        { name: 'Agence Française de Développement', logo_url: franceAfd.src },
        { name: 'Elas', logo_url: elasFunder.src },
      ],
    };
  }

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

  if (path === '/cms/activity') {
    return {
      seo_title: 'Atividade Legislativa e pautas de gênero | Elas no Congresso',
      seo_description: 'Explore dados sobre projetos de lei e pautas de gênero no Congresso Nacional em um dashboard interativo sobre atividade legislativa e direitos.',
      title: '**Atividade Legislativa**',
      subtitle: '**Use filtros e explore as movimentações do Legislativo sensíveis a gênero, atualizadas diariamente pela nossa robô que monitora o Congresso.**',
      hero_image: { url: 'https://www.elasnocongresso.com.br/cms/atividade-legislativa/hero.webp', width: 1080, height: 1350, alt: 'Ilustração de um robô feito de papel' },
    };
  }

  if (path === '/cms/reports') {
    return {
      seo_title: 'Reportagens: Congresso e política de gênero | AzMina',
      seo_description: 'Leia reportagens da Revista AzMina sobre o Congresso Nacional, projetos de lei, política de gênero e direitos das mulheres e pessoas LGBTQIAPN+.',
      title: '**Reportagens**',
      subtitle: '**Veja as histórias que os dados do Congresso nos contam.**',
      hero_image: { url: 'https://www.elasnocongresso.com.br/cms/reportagens/hero.webp', width: 1080, height: 1350, alt: '' },
    };
  }

  if (path === '/cms/alerts') {
    return {
      seo_title: 'Receba alertas sobre gênero no Congresso | Elas no Congresso',
      seo_description: 'Receba alertas sobre projetos de lei e pautas de gênero que afetam os direitos de meninas, mulheres e pessoas LGBTQIAPN+ no Congresso Nacional.',
      title: '**Alertas**',
      subtitle: '**Acompanhe as movimentações do Legislativo no Radar do Congresso**',
      hero_image: { url: 'https://www.elasnocongresso.com.br/cms/alertas/hero.webp', width: 1080, height: 1350, alt: '' },
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
