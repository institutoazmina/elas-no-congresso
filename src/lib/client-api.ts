import { PUBLIC_API_BASE_URL } from "astro:env/client";

export function clientApiBase() {
    return (
        typeof location !== "undefined" && ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)
            ? `${location.origin}/api/v1`
            : PUBLIC_API_BASE_URL
    ).replace(/\/$/, "");
}

/** Longest free-text search the API accepts (`q`/`search`); longer queries get a 422. */
export const SEARCH_MAX_LENGTH = 200;
