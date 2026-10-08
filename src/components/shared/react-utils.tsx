import { useState, type CSSProperties, type ImgHTMLAttributes } from "react";
import type { ImageMetadata } from "astro";

// Imported Astro image metadata remains serializable at the island boundary.
export function Image({
    src,
    ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string | ImageMetadata }) {
    return typeof src === "string" ? (
        <img src={src} {...props} />
    ) : (
        <img src={src.src} width={src.width} height={src.height} {...props} />
    );
}

export function css(value: string): CSSProperties {
    return Object.fromEntries(
        value
            .split(";")
            .filter(Boolean)
            .map((declaration) => {
                const separator = declaration.indexOf(":");
                const name = declaration.slice(0, separator).trim();
                return [
                    name.startsWith("--")
                        ? name
                        : name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
                    declaration.slice(separator + 1).trim(),
                ];
            }),
    );
}

export function cx(values: (string | Record<string, unknown> | undefined | false)[]) {
    return values
        .flatMap((value) =>
            typeof value === "string" ? [value] : value ? Object.keys(value).filter((key) => value[key]) : [],
        )
        .join(" ");
}

export function Photo({ src, name, className }: { src?: string | null; name: string; className?: string }) {
    const [failedSource, setFailedSource] = useState<string>();
    const url = src?.replace(/^http:/, "https:");
    return url && failedSource !== url ? (
        <img
            className={className}
            src={url}
            alt={`Foto de ${name}`}
            loading="lazy"
            onError={() => setFailedSource(url)}
        />
    ) : (
        <span className={className} aria-label={name}>
            {name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
        </span>
    );
}
