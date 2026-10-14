import { useEffect, useRef } from "react";
import { paperwork, paperworkSize, type PaperworkOptions } from "../../lib/paperwork";

export default function Paperwork({
    className,
    alt,
    ...options
}: PaperworkOptions & { className?: string; alt?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);
    const serialized = JSON.stringify(options);
    const dimensions = paperworkSize(options);
    useEffect(() => {
        const canvas = ref.current;
        const controller = new AbortController();
        if (canvas) void paperwork(canvas, JSON.parse(serialized), controller.signal).catch(console.error);
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
