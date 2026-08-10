import { API_BASE_URL } from 'astro:env/server';

/**
 * GET tipado na API do Elas no Congresso.
 *
 * Roda só no build (site estático), então falha ALTO de propósito: melhor o
 * build quebrar e o site anterior continuar no ar do que publicar um gráfico
 * silenciosamente vazio. Timeout evita que a API pendurada trave o build.
 */
export async function apiGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(API_BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    throw new Error(`API ${response.status} em ${url.pathname}${url.search}`);
  }
  return (await response.json()) as T;
}
