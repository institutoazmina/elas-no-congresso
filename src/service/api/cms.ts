/**
 * Conteúdo editável no CMS (admin da API), lido no build.
 *
 * Cada salvamento no admin dispara um deploy do site. Só texto e imagens vêm
 * daqui; o layout continua nos componentes, e o admin limita cada campo ao que
 * o layout comporta. Imagens só são substituídas, nunca removidas.
 */
import { apiGet } from './client';
import feministAIPreview from './feminist-ai-preview.json';
import aboutPreview from './about-preview.json';

type CmsImage = { url: string; width: number; height: number };
export type PageHeroContent = { title: string; subtitle: string; heroImage: CmsImage };

type HeroResponse = { title: string; subtitle: string; hero_image: CmsImage };

/** Top of `/alertas` (`alerts`), `/reportagens` (`reports`) or `/atividade-legislativa` (`activity`). */
export async function getPageHero(page: 'alerts' | 'reports' | 'activity'): Promise<PageHeroContent> {
  const hero = await apiGet<HeroResponse>(`/cms/${page}`);
  return { title: hero.title, subtitle: hero.subtitle, heroImage: hero.hero_image };
}

type WithoutPosition<T> = Omit<T, 'position'>;
type FeministAIItems = typeof feministAIPreview.items;

export type FeministAIPageContent = {
  content: typeof feministAIPreview.page;
  images: { hero: CmsImage; flow_desktop: CmsImage; flow_mobile: CmsImage };
  categories: WithoutPosition<FeministAIItems['categories'][number]>[];
  limitations: WithoutPosition<FeministAIItems['limitations'][number]>[];
  evaluation_metrics: WithoutPosition<FeministAIItems['evaluation_metrics'][number]>[];
  evaluation_partitions: WithoutPosition<FeministAIItems['evaluation_partitions'][number]>[];
  thematic_metrics: WithoutPosition<FeministAIItems['thematic_metrics'][number]>[];
  thematic_partitions: WithoutPosition<FeministAIItems['thematic_partitions'][number]>[];
  open_links: WithoutPosition<FeministAIItems['open_links'][number]>[];
};

/** Conteúdo editorial de `/ia-feminista`, lido no build após cada salvamento no admin. */
export function getFeministAIPage(): Promise<FeministAIPageContent> {
  return apiGet<FeministAIPageContent>('/cms/feminist-ai');
}

type AboutTimelineEvent = WithoutPosition<typeof aboutPreview.timeline[number]>;
type AboutChallenge = WithoutPosition<typeof aboutPreview.challenges[number]>;

export type AboutPageContent = {
  content: Record<string, string>;
  hero_image: CmsImage;
  timeline: AboutTimelineEvent[];
  challenges: AboutChallenge[];
  partners: { name: string; asset_key: string; logo_url: string }[];
};

/** Textos, links e linha do tempo de `/sobre`, lidos no build. */
export function getAboutPage(): Promise<AboutPageContent> {
  return apiGet<AboutPageContent>('/cms/about');
}
