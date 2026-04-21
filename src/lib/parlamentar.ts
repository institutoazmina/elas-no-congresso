import {
  legislaturas,
  legislaturasKeys,
  legislaturaAtualDefault,
  getLegislatura,
  type ParlamentarData,
  type ProposicaoData,
} from './dados';

export type { ParlamentarData, ProposicaoData };

export function getAllParlamentareSlugs(): string[] {
  const seen = new Set<string>();
  for (const legKey of legislaturasKeys) {
    const leg = legislaturas[legKey];
    for (const p of Object.values(leg.parlamentares)) {
      seen.add(p.slug);
    }
  }
  return [...seen];
}

export function getAllProposicoesSlugs(): string[] {
  const seen = new Set<string>();
  for (const legKey of legislaturasKeys) {
    const leg = legislaturas[legKey];
    for (const p of Object.values(leg.proposicoes)) {
      seen.add(p.slug);
    }
  }
  return [...seen];
}

export function getParlamentarBySlug(
  slug: string,
  legislaturaId?: string
): {
  parlamentar: ParlamentarData | null;
  legislaturaAtual: string;
  legislaturasDisponiveis: string[];
} {
  const disponíveis: string[] = [];
  for (const legKey of legislaturasKeys) {
    const leg = legislaturas[legKey];
    for (const p of Object.values(leg.parlamentares)) {
      if (p.slug === slug) {
        disponíveis.push(legKey);
        break;
      }
    }
  }

  if (disponíveis.length === 0) {
    return { parlamentar: null, legislaturaAtual: legislaturaAtualDefault, legislaturasDisponiveis: [] };
  }

  const wantedKey =
    legislaturaId && disponíveis.includes(legislaturaId)
      ? legislaturaId
      : disponíveis[0];

  const leg = legislaturas[wantedKey];
  const parlamentar = Object.values(leg.parlamentares).find(p => p.slug === slug) ?? null;

  return { parlamentar, legislaturaAtual: wantedKey, legislaturasDisponiveis: disponíveis };
}

export function getProposicaoBySlug(
  slug: string,
  legislaturaId?: string
): { proposicao: ProposicaoData | null; legislaturaAtual: string } {
  const { key, data } = getLegislatura(legislaturaId);
  let proposicao = Object.values(data.proposicoes).find(p => p.slug === slug) ?? null;
  if (proposicao) return { proposicao, legislaturaAtual: key };

  for (const legKey of legislaturasKeys) {
    if (legKey === key) continue;
    const found = Object.values(legislaturas[legKey].proposicoes).find(p => p.slug === slug);
    if (found) return { proposicao: found, legislaturaAtual: legKey };
  }
  return { proposicao: null, legislaturaAtual: key };
}

export function getProximos(parlamentar: ParlamentarData, legislaturaId: string): ParlamentarData[] {
  const leg = legislaturas[legislaturaId];
  if (!leg) return [];

  const cargoPre = parlamentar.cargo.slice(0, 3);
  const ranked = Object.values(leg.parlamentares)
    .filter(p => p.valor != null && p.cargo.slice(0, 3) === cargoPre)
    .sort((a, b) =>
      b.valor === a.valor
        ? b.nome.localeCompare(a.nome)
        : (b.valor ?? 0) < (a.valor ?? 0) ? -1 : 1
    );

  const idx = ranked.findIndex(p => p.numero === parlamentar.numero);
  if (idx === -1) return [];

  let prev = idx - 1;
  let next = idx + 1;
  if (prev < 0) { prev = 1; next = 2; }
  if (next >= ranked.length) { prev = ranked.length - 3; next = ranked.length - 2; }

  return [ranked[Math.max(0, prev)], ranked[Math.min(ranked.length - 1, next)]].filter(Boolean);
}

export function mediaPartido(parlamentar: ParlamentarData, legislaturaId: string): number {
  const leg = legislaturas[legislaturaId];
  if (!leg) return 0;
  const group = Object.values(leg.parlamentares).filter(
    p => p.valor != null && p.partido === parlamentar.partido && p.v != null
  );
  if (group.length === 0) return 0;
  return Math.round(group.reduce((sum, p) => sum + (p.v ?? 0), 0) / group.length);
}

export function mediaCasa(parlamentar: ParlamentarData, legislaturaId: string): number {
  const leg = legislaturas[legislaturaId];
  if (!leg) return 0;
  const cargoPre = parlamentar.cargo.slice(0, 3);
  const group = Object.values(leg.parlamentares).filter(
    p => p.valor != null && p.cargo.slice(0, 3) === cargoPre && p.v != null
  );
  if (group.length === 0) return 0;
  return Math.round(group.reduce((sum, p) => sum + (p.v ?? 0), 0) / group.length);
}
