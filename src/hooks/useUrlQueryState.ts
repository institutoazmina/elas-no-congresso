import { useCallback, useMemo, useSyncExternalStore } from "react";

export type UrlQueryStateCodec<T> = {
    defaultValue: T;
    parse: (url: URL) => T;
    buildUrl: (url: URL, value: T) => URL;
};

type HistoryMode = "push" | "replace";
const queryStateChangeEvent = "url-query-state-change";

function subscribe(listener: () => void) {
    window.addEventListener("popstate", listener);
    window.addEventListener(queryStateChangeEvent, listener);
    return () => {
        window.removeEventListener("popstate", listener);
        window.removeEventListener(queryStateChangeEvent, listener);
    };
}

const getSnapshot = () => window.location.href;
const getServerSnapshot = () => "";

export function useUrlQueryState<T>(codec: UrlQueryStateCodec<T>) {
    const href = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const value = useMemo(() => (href ? codec.parse(new URL(href)) : codec.defaultValue), [codec, href]);
    const setValue = useCallback(
        (next: T, { history = "replace" }: { history?: HistoryMode } = {}) => {
            const url = codec.buildUrl(new URL(window.location.href), next);
            window.history[history === "push" ? "pushState" : "replaceState"]({}, "", url);
            window.dispatchEvent(new Event(queryStateChangeEvent));
        },
        [codec],
    );

    return [value, setValue, { ready: href !== "" }] as const;
}
