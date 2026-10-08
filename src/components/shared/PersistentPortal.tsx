import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Keep ARIA-controlled popups mounted outside clipping/scroll containers. */
export default function PersistentPortal({ children }: { children: ReactNode }) {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    useEffect(() => setContainer(document.body), []);
    return container ? createPortal(children, container) : null;
}
