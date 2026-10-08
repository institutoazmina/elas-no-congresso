import type { AnchorHTMLAttributes } from "react";

export default function BackLink({
    children,
    href = "/atividade-legislativa",
    ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
        <a
            {...props}
            href={href}
            onClick={(event) => {
                if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                if (
                    history.length > 1 &&
                    document.referrer &&
                    new URL(document.referrer).origin === location.origin
                ) {
                    event.preventDefault();
                    history.back();
                }
            }}
        >
            {children}
        </a>
    );
}
