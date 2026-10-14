import { useEffect, useState } from "react";

/**
 * Loads WordPress reports in the browser, so the build never waits on them.
 * Returns ``undefined`` while ``key`` is loading; a new key reloads.
 */
export function useNews<T>(key: string, load: (signal: AbortSignal) => Promise<T>): T | undefined {
    const [result, setResult] = useState<{ key: string; data: T }>();
    useEffect(() => {
        const controller = new AbortController();
        load(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) setResult({ key, data });
            })
            .catch(() => undefined);
        return () => controller.abort();
        // ``load`` is recreated on every render; ``key`` identifies the request.
    }, [key]);
    return result?.key === key ? result.data : undefined;
}
