/**
 * Conteúdo editável no CMS (admin da API), lido no build.
 *
 * Cada salvamento no admin dispara um deploy do site. Só texto e imagens vêm
 * daqui; o layout continua nos componentes, e o admin limita cada campo ao que
 * o layout comporta. Imagens só são substituídas, nunca removidas.
 */
import { apiGet } from './client';
import aboutPreview from './about-preview.json';

type CmsImage = { url: string; width: number; height: number };
export type PageHeroContent = { title: string; subtitle: string; heroImage: CmsImage };

type HeroResponse = { title: string; subtitle: string; hero_image: CmsImage };

/** Top of `/alertas` (`alerts`), `/reportagens` (`reports`) or `/atividade-legislativa` (`activity`). */
export async function getPageHero(page: 'alerts' | 'reports' | 'activity'): Promise<PageHeroContent> {
  const hero = await apiGet<HeroResponse>(`/cms/${page}`);
  return { title: hero.title, subtitle: hero.subtitle, heroImage: hero.hero_image };
}

type FeministAIPageResponse = {
  seo_title: string;
  seo_description: string;
  title: string;
  subtitle: string;
  hero_image: CmsImage;
  content: string;
};

export type FeministAIPageContent = {
  seo_title: string;
  seo_description: string;
  hero: PageHeroContent;
  content: string;
};

/** Conteúdo editorial de `/ia-feminista`, lido no build após cada salvamento no admin. */
export async function getFeministAIPage(): Promise<FeministAIPageContent> {
  const page = await apiGet<FeministAIPageResponse>('/cms/feminist-ai');
  return {
    seo_title: page.seo_title,
    seo_description: page.seo_description,
    hero: { title: page.title, subtitle: page.subtitle, heroImage: page.hero_image },
    content: page.content,
  };
}

type WithoutPosition<T> = Omit<T, 'position'>;
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

export type HomePageContent = {
  content: Record<string, string>;
  images: { hero: CmsImage; explore: CmsImage; quiteria: CmsImage };
};

/** Textos, links e imagens editoriais da home, lidos no build. */
export function getHomePage(): Promise<HomePageContent> {
  return apiGet<HomePageContent>('/cms/home');
}

export type FooterAlertsContent = {
  title: string;
  text: string;
  cta_text: string;
  cta_url: string;
};

/** Chamada para alertas compartilhada por todas as páginas. */
let footerAlertsForBuild: Promise<FooterAlertsContent> | undefined;

export function getFooterAlerts(): Promise<FooterAlertsContent> {
  // O footer aparece em milhares de páginas estáticas. Uma leitura por build
  // evita milhares de requisições idênticas; no dev, cada render lê de novo.
  if (import.meta.env.DEV) return apiGet<FooterAlertsContent>('/cms/footer-alerts');
  return footerAlertsForBuild ??= apiGet<FooterAlertsContent>('/cms/footer-alerts').catch((error) => {
    footerAlertsForBuild = undefined;
    throw error;
  });
}
