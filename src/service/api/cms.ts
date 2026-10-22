/**
 * Conteúdo editável no CMS (admin da API), lido no build.
 *
 * Cada salvamento no admin dispara um deploy do site. Só texto e imagens vêm
 * daqui; o layout continua nos componentes, e o admin limita cada campo ao que
 * o layout comporta. Imagens só são substituídas, nunca removidas.
 */
import { apiGet } from './client';

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

export type AboutPageContent = {
  seo_title: string;
  seo_description: string;
  hero: PageHeroContent;
  content: string;
  partners: { name: string; logo_url: string }[];
  team: AboutTeamGroup[];
};

export type AboutTeamGroup = {
  key: string;
  title: string;
  wide: boolean;
  members: { name: string; role: string }[];
};

type AboutPageResponse = Omit<AboutPageContent, 'hero'> & {
  title: string;
  subtitle: string;
  hero_image: CmsImage;
};

/** Hero, Markdown e organizações parceiras de `/sobre`, lidos no build. */
export async function getAboutPage(): Promise<AboutPageContent> {
  const page = await apiGet<AboutPageResponse>('/cms/about');
  return {
    seo_title: page.seo_title,
    seo_description: page.seo_description,
    hero: { title: page.title, subtitle: page.subtitle, heroImage: page.hero_image },
    content: page.content,
    partners: page.partners,
    team: page.team,
  };
}

export type HomePageContent = {
  seo_title: string;
  seo_description: string;
  hero: PageHeroContent;
  cta: { text: string; url: string };
  content: string;
  images: { explore: CmsImage; quiteria: CmsImage };
};

type HomePageResponse = Omit<HomePageContent, 'hero' | 'cta'> & {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  hero_image: CmsImage;
};

/** Hero, Markdown e imagens editoriais da Home, lidos no build. */
export async function getHomePage(): Promise<HomePageContent> {
  const page = await apiGet<HomePageResponse>('/cms/home');
  return {
    seo_title: page.seo_title,
    seo_description: page.seo_description,
    hero: { title: page.title, subtitle: page.subtitle, heroImage: page.hero_image },
    cta: { text: page.cta_text, url: page.cta_url },
    content: page.content,
    images: page.images,
  };
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
