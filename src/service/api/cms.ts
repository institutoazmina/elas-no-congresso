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

/** Top of `/alertas` (`alerts`) or `/reportagens` (`reports`). */
export async function getPageHero(page: 'alerts' | 'reports'): Promise<PageHeroContent> {
  const hero = await apiGet<HeroResponse>(`/cms/${page}`);
  return { title: hero.title, subtitle: hero.subtitle, heroImage: hero.hero_image };
}
