import { apiGet } from './client';

const UNAVAILABLE = 'Indisponível';

export type ParliamentarianTerm = {
  party: number;
  house: string;
  state: string;
  end_date: string | null;
};

export type ParliamentarianRecord = {
  id: number | null;
  full_name: string;
  social_name: string | null;
  photo_url: string | null;
  birth_date: string | null;
  profession: string | null;
  education: string | null;
  race: string | null;
  religion: string | null;
  favorable_propositions_count: number;
  unfavorable_propositions_count: number;
  terms: ParliamentarianTerm[];
};

export type PartyRecord = {
  id: number | null;
  acronym: string;
  name: string;
};

export type ParliamentariansResponse = { count: number; items: ParliamentarianRecord[] };
export type PartiesResponse = { count: number; items: PartyRecord[] };

export type ParliamentarianViewModel = {
  id: number;
  displayName: string;
  photoUrl: string;
  house: string;
  partyAcronym: string;
  state: string;
  birthDate: string;
  profession: string;
  education: string;
  race: string;
  religion: string;
  favorablePropositionsCount: number;
  unfavorablePropositionsCount: number;
};

function textOrUnavailable(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return UNAVAILABLE;
  const text = String(value).trim();
  return text || UNAVAILABLE;
}

function formatBirthDate(value: string | null | undefined): string {
  if (!value) return UNAVAILABLE;

  // Dates are formatted from their date portion instead of being parsed as a
  // Date, avoiding a timezone conversion for values such as 1989-08-22.
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : UNAVAILABLE;
}

function houseDisplay(value: string | null | undefined): string {
  const house = value?.trim().toLowerCase();
  if (!house) return UNAVAILABLE;
  if (['camara', 'câmara', 'deputado', 'deputados'].includes(house)) return 'Câmara dos Deputados';
  if (['senado', 'senador', 'senadores'].includes(house)) return 'Senado Federal';
  return 'Parlamentar';
}

function partyAcronym(
  term: ParliamentarianTerm | undefined,
  parties: Map<string, string>,
): string {
  return textOrUnavailable(term ? parties.get(String(term.party)) : undefined);
}

function currentTerm(terms: ParliamentarianTerm[]): ParliamentarianTerm | undefined {
  return terms.find((term) => term.end_date === null) ?? terms[0];
}

/** Parlamentares em exercício, preparados para exibição no carrossel. */
export async function getCurrentParliamentarians(limit = 5): Promise<ParliamentarianViewModel[]> {
  const [{ items: parliamentarians }, { items: partyRecords }] = await Promise.all([
    apiGet<ParliamentariansResponse>('/legislatures/parliamentarians', {
      current: 'true',
      limit,
      offset: 0,
    }),
    apiGet<PartiesResponse>('/legislatures/parties', { limit: 100, offset: 0 }),
  ]);

  const parties = new Map(
    partyRecords
      .map((party) => {
        return party.id === null ? undefined : [String(party.id), textOrUnavailable(party.acronym)] as const;
      })
      .filter((party): party is readonly [string, string] => party !== undefined),
  );

  return parliamentarians
    .filter((person): person is ParliamentarianRecord & { id: number } => person.id !== null)
    .map((person) => {
      const term = currentTerm(person.terms);
      return {
        id: person.id,
        displayName: textOrUnavailable(person.social_name || person.full_name),
        photoUrl: textOrUnavailable(person.photo_url),
        house: houseDisplay(term?.house),
        partyAcronym: partyAcronym(term, parties),
        state: textOrUnavailable(term?.state),
        birthDate: formatBirthDate(person.birth_date),
        profession: textOrUnavailable(person.profession),
        education: textOrUnavailable(person.education),
        race: textOrUnavailable(person.race),
        religion: textOrUnavailable(person.religion),
        favorablePropositionsCount: person.favorable_propositions_count,
        unfavorablePropositionsCount: person.unfavorable_propositions_count,
      };
    });
}
