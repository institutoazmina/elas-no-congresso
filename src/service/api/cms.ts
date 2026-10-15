/**
 * Conteúdo editável no CMS (admin da API), lido no build.
 *
 * Cada salvamento no admin dispara um deploy do site. Só texto e imagens vêm
 * daqui; o layout continua nos componentes, e o admin limita cada campo ao que
 * o layout comporta. Imagens só são substituídas, nunca removidas.
 */
import { apiGet } from './client';

type CmsImage = { url: string; width: number; height: number };
export type AlertsPageContent = { title: string; subtitle: string; heroImage: CmsImage };

type AlertsPageResponse = { title: string; subtitle: string; hero_image: CmsImage };

export async function getAlertsPageContent(): Promise<AlertsPageContent> {
  const page = await apiGet<AlertsPageResponse>('/cms/alerts');
  return { title: page.title, subtitle: page.subtitle, heroImage: page.hero_image };
}
