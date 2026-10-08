import { useEffect, useRef } from "react";
import { papelada, papeladaSize, type PapeladaOptions } from "../../lib/papelada";

export default function Papelada({
    className,
    alt,
    ...options
}: PapeladaOptions & { className?: string; alt?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const serialized = JSON.stringify(options);
    const dimensions = papeladaSize(options);
    useEffect(() => {
        const canvas = ref.current;
        const controller = new AbortController();
        if (canvas) void papelada(canvas, JSON.parse(serialized), controller.signal).catch(console.error);
        return () => controller.abort();
    }, [serialized]);
    return (
        <canvas
            ref={ref}
            className={className}
            style={{ height: "auto", maxWidth: "100%", aspectRatio: `${dimensions.width} / ${dimensions.height}` }}
            {...dimensions}
            role={alt ? "img" : "presentation"}
            aria-label={alt}
        />
    );
}
