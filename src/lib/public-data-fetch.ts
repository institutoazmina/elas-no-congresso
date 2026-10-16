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

/** Retry transient public-data failures during static builds, without caching. */
export function createBuildFetcher(
    fetcher: typeof fetch,
    pause: (milliseconds: number) => Promise<void> = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
) {
    return async (url: string | URL): Promise<Response> => {
        for (let attempt = 1; ; attempt++) {
            let response: Response;
            try {
                response = await fetcher(url, { signal: AbortSignal.timeout(15_000) });
            } catch (error) {
                const transient = error instanceof TypeError || (error instanceof Error && error.name === "TimeoutError");
                if (!transient || attempt === 3) {
                    throw new Error(`GET ${url} falhou após ${attempt} tentativa(s)`, { cause: error });
                }
                console.warn(`GET ${url}: ${String(error)}; nova tentativa ${attempt + 1}/3`);
                await pause(500 * attempt);
                continue;
            }
            if (![502, 503, 504].includes(response.status) || attempt === 3) return response;
            // Release the failed response before requesting it again.
            await response.body?.cancel();
            console.warn(`GET ${url}: HTTP ${response.status}; nova tentativa ${attempt + 1}/3`);
            await pause(500 * attempt);
        }
    };
}

const buildFetch = createBuildFetcher(fetch);

// Never cache browser requests, abortable interactions, or production builds.
export function fetchPublicData(url: string | URL, signal?: AbortSignal): Promise<Response> {
    if (import.meta.env?.DEV && import.meta.env?.SSR && !signal) return developmentFetch(url);
    if (import.meta.env?.SSR && !import.meta.env?.DEV && !signal) return buildFetch(url);
    return fetch(url, { signal: signal ?? AbortSignal.timeout(15_000) });
}
