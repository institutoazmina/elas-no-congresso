import { legislaturas, legislaturasKeys, type ParlamentarData, type ProposicaoData } from "./dados.ts";
import { propositionSlug } from "./proposition-utils";
export { propositionAssessment, propositionRoute, propositionSlug, propositionStatus } from "./proposition-utils";

export type PropositionAuthor = ParlamentarData;

export function getPropositionByPublicSlug(slug: string): { proposition: ProposicaoData | null; legislature: string | null } {
  for (const legislature of legislaturasKeys) {
    const proposition = Object.values(legislaturas[legislature].proposicoes).find((item) => propositionSlug(item.numero) === slug);
    if (proposition) return { proposition, legislature };
  }
  return { proposition: null, legislature: null };
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
