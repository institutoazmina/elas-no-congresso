import { useEffect, useEffectEvent, type RefObject } from "react";

export function useDialogFocus(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
    const close = useEffectEvent(onClose);
    useEffect(() => {
        if (!open) return;
        const previous = document.activeElement as HTMLElement | null;
        const root = ref.current;
        root?.focus();
        const keydown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
                event.preventDefault();
                close();
            }
            if (event.key !== "Tab" || !root?.contains(event.target as Node)) return;
            const focusable = Array.from(
                root.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), input:not([disabled]), a[href], [tabindex="0"]',
                ),
            ).filter((node) => node.getClientRects().length);
            const first = focusable[0],
                last = focusable.at(-1);
            if (event.shiftKey && (document.activeElement === first || document.activeElement === root)) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        document.addEventListener("keydown", keydown);
        return () => {
            document.removeEventListener("keydown", keydown);
            previous?.focus();
        };
    }, [open, ref]);
}
