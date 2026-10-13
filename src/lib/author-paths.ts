import { buildAuthorActivityFromApi, authorSlug, type ApiParliamentarian, type ApiParty, type AuthorInitialData } from "./author-page";
import { fetchActivity } from "./activity-api";
import { fetchAllPages } from "./api-pages";

export interface AuthorPageProps { authorId: number; house: string; initial: AuthorInitialData; }

// Page and OG endpoint share the same snapshot and slug collision handling.
const snapshots = new Map<string, ReturnType<typeof loadAuthorPaths>>();
export async function getAuthorPaths(apiBaseUrl: string) {
    if (!snapshots.has(apiBaseUrl)) snapshots.set(apiBaseUrl, loadAuthorPaths(apiBaseUrl));
    // Astro attaches a route-specific index to the returned array.
    return [...(await snapshots.get(apiBaseUrl)!)];
}

async function loadAuthorPaths(apiBaseUrl: string) {
    const activityData = await fetchActivity(apiBaseUrl);
    let directory: { parliamentarians: ApiParliamentarian[]; parties: ApiParty[] } = { parliamentarians: [], parties: [] };
    try {
        const apiBase = apiBaseUrl.replace(/\/$/, "");
        const apiJson = async <T>(url: string): Promise<T> => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API ${response.status}: ${url}`);
            return response.json() as Promise<T>;
        };
        const apiPages = <T>(path: string) => fetchAllPages<T>(`${apiBase}${path}`, apiJson);
        const [parliamentarians, parties] = await Promise.all([
            Promise.all(["camara", "senado"].map((house) => apiPages<ApiParliamentarian>(`/legislatures/parliamentarians?house=${house}`))),
            apiPages<ApiParty>("/legislatures/parties"),
        ]);
        directory = {
            parliamentarians: parliamentarians.flat(),
            parties,
        };
    } catch (error) {
        console.warn("Não foi possível carregar o diretório de parlamentares durante o build:", error);
    }

    const authors = new Map<number, { name: string; party: string | null; state: string | null; gender: string | null; photoUrl: string | null; role: string | null; house: string }>();
    for (const proposition of activityData) {
        for (const author of proposition.authors) {
            if (author.id === null || authors.has(author.id)) continue;
            authors.set(author.id, {
                name: author.name,
                party: author.party,
                state: author.state,
                gender: author.gender,
                photoUrl: author.photo_url,
                role: author.role,
                house: proposition.house,
            });
        }
    }
    const paths = new Map<string, { params: { slug: string }; props: AuthorPageProps }>();
    for (const [authorId, author] of authors) {
        const slug = authorSlug(author.name);
        if (!slug || paths.has(slug)) continue;
        const activity = buildAuthorActivityFromApi(activityData, authorId);
        if (!activity) continue;
        const person = directory.parliamentarians.find((item) => item.id === authorId);
        const fallbackTerm = {
            id: null,
            parliamentarian: authorId,
            legislature_number: 0,
            party: 0,
            house: author.house,
            role: author.role || "Parlamentar",
            state: author.state || "",
            external_id: authorId,
            start_date: "",
            end_date: null,
        } as const;
        const term = person?.terms.find((item) => item.end_date === null) ?? person?.terms[0] ?? fallbackTerm;
        const initialPerson = person || {
            id: authorId,
            full_name: author.name,
            social_name: author.name,
            photo_url: author.photoUrl,
            gender: author.gender,
            birth_date: null,
            race: null,
            education: null,
            birthplace: null,
            profession: null,
            religion: null,
            bio: null,
            favorable_propositions_count: activity.favorable,
            unfavorable_propositions_count: activity.unfavorable,
            terms: [fallbackTerm],
        } satisfies ApiParliamentarian;
        const parties = person ? directory.parties : author.party ? [{ id: 0, acronym: author.party, name: author.party }] : [];
        paths.set(slug, {
            params: { slug },
            props: { authorId, house: author.role || "Parlamentar", initial: { person: initialPerson, term, parties, activity } },
        });
    }
    return [...paths.values()];
}

