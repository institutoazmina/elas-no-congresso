import { useEffect, useState } from "react";
import type { ActivityProposition, House } from "../../lib/activity-api";
import { clientApiBase } from "../../lib/client-api";
import { HOUSE_LABELS } from "../../lib/house-labels";
const formatEventDate = (value: string) =>
    new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        timeZone: "UTC",
    }).format(new Date(value));
export default function PropositionProgress({ number, house }: { number: string; house: House }) {
    const [activity, setActivity] = useState<ActivityProposition | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        const query = new URLSearchParams({ house, number_label: number });
        fetch(`${clientApiBase()}/activity/by-number?${query}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error(String(response.status));
                return response.json();
            })
            .then((data: ActivityProposition) => {
                if (!controller.signal.aborted) setActivity(data);
            })
            .catch(() => {
                if (!controller.signal.aborted) setActivity(null);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [number, house]);
    const celerity = activity?.celerity;
    const emoji: Record<string, string> = {
        Esquecida: "⛔",
        Travada: "🧱",
        Lenta: "🐢",
        Rápida: "⏫",
        "Tá voando": "🚀",
    };
    const presentation = !celerity
        ? {
              label: loading ? "Carregando" : "Indisponível",
              summary: loading
                  ? "Buscando movimentações oficiais"
                  : "Histórico de movimentações indisponível",
          }
        : {
              label: `${emoji[celerity.label] || ""} ${celerity.label}`.trim(),
              summary: ["Esquecida", "Travada", "Lenta"].includes(celerity.label)
                  ? `${celerity.days_without_movement} ${celerity.days_without_movement === 1 ? "dia" : "dias"} sem movimentação`
                  : `${celerity.movements_last_90_days} ${celerity.movements_last_90_days === 1 ? "movimentação" : "movimentações"} em 3 meses`,
          };
    return (
        <section
            className="proposition-progress tw:w-full tw:bg-white tw:pt-25 tw:pb-10 tw:px-4 tw:max-md:pt-22 tw:max-md:pb-24 tw:max-md:px-4"
            aria-labelledby="proposition-progress-title"
            data-proposition-progress
            aria-busy={loading}
        >
            <div className="proposition-progress__bar tw:max-md:h-20.5 tw:max-md:py-0 tw:max-md:px-3.5 tw:max-md:[&_h2]:top-[-44px] tw:max-md:[&_h2]:text-[28px] tw:relative tw:flex tw:w-[min(742px,_100%)] tw:h-[66px] tw:items-center tw:justify-between tw:bg-[#6262ff] tw:bg-[image:var(--proposition-paper)] tw:[background-blend-mode:multiply] tw:[background-position:center_-70px] tw:bg-no-repeat tw:bg-size-[742px_auto] tw:py-0 tw:pr-[26px] tw:pl-5 tw:my-0 tw:mx-auto">
                <h2
                    className="tw:absolute tw:-top-11.5 tw:left-[50%] tw:[transform:translateX(-50%)] tw:text-navy tw:font-display tw:text-[32px] tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-8 tw:text-center tw:[text-box-edge:cap_alphabetic] tw:[text-box-trim:trim-both] tw:uppercase tw:whitespace-nowrap tw:m-0"
                    id="proposition-progress-title"
                >
                    Como está?
                </h2>
                <strong
                    className="proposition-progress__status tw:relative tw:z-0 tw:flex tw:min-w-29.5 tw:h-11 tw:items-center tw:justify-center tw:gap-[6px] tw:text-navy tw:text-2xl tw:font-medium tw:leading-[44px] tw:whitespace-nowrap tw:py-0 tw:px-1.5 tw:[&>span]:text-[20px] tw:[&>span]:leading-[1] tw:max-md:min-w-28 tw:max-md:text-xl tw:before:absolute tw:before:z-[-1] tw:before:top-0 tw:before:-right-2 tw:before:-left-2 tw:before:h-11.5 tw:before:[background:var(--proposition-status-label)_center_/_100%_100%_no-repeat] tw:before:content-[''] tw:max-md:before:-right-1.5 tw:max-md:before:-left-1.5"
                    data-progress-status
                >
                    {presentation.label}
                </strong>
                <span
                    className="proposition-progress__summary tw:[&>span]:font-normal tw:max-md:max-w-30 tw:max-md:text-sm tw:max-md:leading-[18px] tw:max-md:text-right tw:text-white tw:text-lg tw:font-bold tw:leading-6 tw:[text-shadow:1px_2px_1px_rgb(0_0_0_/_20%)]"
                    data-progress-summary
                >
                    {presentation.summary}
                </span>
            </div>
            <div
                className={`${activity?.events.length ? "" : "is-empty"} proposition-timeline tw:w-[min(742px,_100%)] tw:min-h-74 tw:border-[2px] tw:border-solid tw:border-navy tw:bg-white tw:my-0 tw:mx-auto tw:[&>p]:text-muted tw:[&>p]:text-base tw:[&>p]:leading-6 tw:[&>p]:text-center tw:[&>p]:m-0 tw:max-md:min-h-39 tw:[&.is-empty]:p-[26px] tw:[&:not(.is-empty)]:min-h-0 tw:max-md:[&.is-empty]:p-5 tw:[&.is-empty]:flex tw:[&.is-empty]:items-center tw:[&.is-empty]:justify-center`}
                aria-live="polite"
                data-progress-timeline
            >
                <ol className="proposition-timeline__events tw:list-none tw:p-0 tw:m-0 tw:[&_li]:border-b-[2px] tw:[&_li]:border-solid tw:[&_li]:border-b-navy tw:[&_li:last-child]:[border-bottom:0] tw:[&_header]:flex tw:[&_header]:items-center tw:[&_header]:justify-between tw:[&_header]:gap-4 tw:[&_header_strong]:text-navy tw:[&_header_strong]:font-display tw:[&_header_strong]:text-xl tw:[&_header_strong]:font-bold tw:[&_header_strong]:[font-variation-settings:'wdth'_75] tw:[&_header_strong]:leading-6 tw:[&_header_strong]:uppercase tw:[&_time]:text-navy tw:[&_time]:font-display tw:[&_time]:text-xl tw:[&_time]:font-bold tw:[&_time]:[font-variation-settings:'wdth'_75] tw:[&_time]:leading-6 tw:[&_time]:uppercase tw:[&_time]:flex-none tw:[&_time]:text-right">
                    {activity?.events.map((event, index) => (
                        <li key={`${event.event_at}-${index}`}>
                            <a
                                className="proposition-timeline__event-card tw:block tw:text-inherit tw:no-underline tw:pt-5 tw:pb-7 tw:px-4 tw:max-md:pt-4.5 tw:max-md:pb-5.5 tw:max-md:px-3.5 tw:[&[href]:hover]:bg-[#f7f6f7] tw:[&[href]:focus-visible]:outline-2 tw:[&[href]:focus-visible]:outline-accent tw:[&[href]:focus-visible]:-outline-offset-1 tw:[&_>_p]:text-muted tw:[&_>_p]:font-sans tw:[&_>_p]:text-base tw:[&_>_p]:font-normal tw:[&_>_p]:[font-variant-numeric:lining-nums_tabular-nums] tw:[&_>_p]:leading-6 tw:[&_>_p]:text-left tw:[&_>_p]:mt-3 tw:[&_>_p]:mb-0 tw:[&_>_p]:mx-0"
                                href={event.url || activity.tramitation_url || undefined}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <header>
                                    <strong>
                                        {event.source_house &&
                                            `${HOUSE_LABELS[event.source_house].short} · `}
                                        {event.title || event.situation || "Movimentação legislativa"}
                                    </strong>
                                    <time dateTime={event.event_at}>{formatEventDate(event.event_at)}</time>
                                </header>
                                {event.description?.trim() && <p>{event.description.trim()}</p>}
                            </a>
                        </li>
                    ))}
                </ol>
                {!activity?.events.length && (
                    <p>
                        {loading
                            ? "Buscando movimentações oficiais"
                            : activity
                              ? "Ainda não há movimentações registradas."
                              : "Histórico de movimentações indisponível"}
                    </p>
                )}
            </div>
        </section>
    );
}
