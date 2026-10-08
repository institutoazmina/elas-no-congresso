import { useEffect, useRef, useState } from "react";

export function useCarousel(size: number) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [index, setIndex] = useState(size);
    const [step, setStep] = useState({ width: 0, gap: 0 });
    const [moving, setMoving] = useState(false);
    const [animate, setAnimate] = useState(true);
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const measure = () =>
            setStep({
                width: track.firstElementChild?.getBoundingClientRect().width ?? 0,
                gap: Number.parseFloat(getComputedStyle(track).columnGap) || 0,
            });
        const observer = new ResizeObserver(measure);
        observer.observe(track);
        if (track.firstElementChild) observer.observe(track.firstElementChild);
        measure();
        return () => observer.disconnect();
    }, []);
    useEffect(() => {
        if (!moving) return;
        const timer = setTimeout(() => {
            if (index < size || index >= size * 2) {
                setAnimate(false);
                setIndex(size + (((index % size) + size) % size));
            }
            setMoving(false);
        }, 250);
        return () => clearTimeout(timer);
    }, [index, moving, size]);
    useEffect(() => {
        if (animate) return;
        let second = 0;
        const first = requestAnimationFrame(() => {
            second = requestAnimationFrame(() => setAnimate(true));
        });
        return () => {
            cancelAnimationFrame(first);
            cancelAnimationFrame(second);
        };
    }, [animate]);
    return {
        trackRef,
        index,
        move: (direction: number) => {
            if (size > 1 && !moving && animate) {
                setMoving(true);
                setIndex((value) => value + direction);
            }
        },
        style: {
            transform: step.width
                ? `translateX(${-index * (step.width + step.gap) - step.width / 2}px)`
                : `translateX(calc(-${index} * (var(--carousel-card-width, var(--card-width, 384px)) + var(--carousel-gap, var(--track-gap, 48px))) - var(--carousel-card-width, var(--card-width, 384px)) / 2))`,
            transition: animate ? undefined : "none",
        },
    };
}
