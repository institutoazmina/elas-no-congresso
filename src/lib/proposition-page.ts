import { legislaturas, legislaturasKeys, type ParlamentarData, type ProposicaoData } from "./dados.ts";
import { canonicalPropositionKey, isCanonicalNumero } from "./canonical.ts";
import { propositionSlug } from "./proposition-utils";
export { propositionAssessment, propositionRoute, propositionSlug, propositionStatus } from "./proposition-utils";

export type PropositionAuthor = ParlamentarData;

export function getPropositionByPublicSlug(slug: string): { proposition: ProposicaoData | null; legislature: string | null } {
    let fallback: { proposition: ProposicaoData; legislature: string } | null = null;
    for (const legislature of legislaturasKeys) {
        for (const proposition of Object.values(legislaturas[legislature].proposicoes)) {
            if (propositionSlug(proposition.numero) !== slug) continue;
            // Prefere a variante canônica (sem espaço duplo); a outra segue
            // acessível pela mesma URL, sem página duplicada.
            if (!/ {2,}/.test(proposition.numero)) return { proposition, legislature };
            fallback ??= { proposition, legislature };
        }
    }
    return fallback ?? { proposition: null, legislature: null };
}

/** Chave canônica CASA|NUMERO para matching com a API (nunca `i`/slug/id). */
export function propositionKey(proposition: Pick<ProposicaoData, "casa" | "numero">): string {
    return canonicalPropositionKey(proposition.casa, proposition.numero);
}

export function getPropositionAuthors(proposition: ProposicaoData): PropositionAuthor[] {
  const ids = Array.isArray(proposition.autores) ? proposition.autores : Object.values(proposition.autores || {});
  const authors: PropositionAuthor[] = [];
  const seen = new Set<number>();
  for (const id of ids) {
    if (seen.has(Number(id))) continue;
    seen.add(Number(id));
    for (const legislature of legislaturasKeys) {
      const author = Object.values(legislaturas[legislature].parlamentares).find((item) => item.numero === Number(id));
      if (author) { authors.push(author); break; }
    }
  }
  return authors;
}
