/** Short-lived, bounded cache for public GETs during local development. */
export function createResponseCache(fetcher: typeof fetch, ttl = 60_000) {
    const entries = new Map<string, { expires: number; response: Promise<Response> }>();
    return async (url: string | URL): Promise<Response> => {
        const key = String(url);
        const existing = entries.get(key);
        if (existing && existing.expires > Date.now()) return (await existing.response).clone();
        const entry = {
            expires: Date.now() + ttl,
            response: fetcher(url, { signal: AbortSignal.timeout(15_000) }),
        };
        entries.delete(key);
        if (entries.size >= 100) entries.delete(entries.keys().next().value!);
        entries.set(key, entry);
        try {
            const response = await entry.response;
            if (!response.ok && entries.get(key) === entry) entries.delete(key);
            return response.clone();
        } catch (error) {
            if (entries.get(key) === entry) entries.delete(key);
            throw error;
        }
    };
}

const developmentFetch = createResponseCache(fetch);

// Never cache browser requests, abortable interactions, or production builds.
export function fetchPublicData(url: string | URL, signal?: AbortSignal): Promise<Response> {
    if (import.meta.env?.DEV && import.meta.env?.SSR && !signal) return developmentFetch(url);
    return fetch(url, { signal: signal ?? AbortSignal.timeout(15_000) });
}
