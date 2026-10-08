import { useEffect, useState } from "react";
import type { AlertProposition } from "../../service/api/alerts";
import { clientApiBase } from "../../lib/client-api";
import {
    parseAlertsQueryState,
    updateAlertsQueryState,
    onAlertsQueryStateChange,
    type AlertsQueryState,
} from "../../lib/alerts/query-state";
import AlertCard from "./AlertCard";
import AlertsSortSelect from "./AlertsSortSelect";
const pageSize = 5;
const formatDate = (date: string) => date.split("-").reverse().join("/");
export default function AlertsList({
    propositions,
    total,
}: {
    propositions: AlertProposition[];
    total: number;
}) {
    const [state, setState] = useState<AlertsQueryState>({ q: "", page: 1, sort: "newest" });
    const [draft, setDraft] = useState("");
    const [items, setItems] = useState(propositions.slice(0, pageSize));
    const [count, setCount] = useState(total);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const pageCount = Math.ceil(count / pageSize);
    useEffect(() => {
        const sync = (next: AlertsQueryState) => {
            setState(next);
            setDraft(next.q);
        };
        sync(parseAlertsQueryState(location.href));
        return onAlertsQueryStateChange(sync);
    }, []);
    function navigate(next: AlertsQueryState) {
        setState(next);
        updateAlertsQueryState(next, "push");
    }
    useEffect(() => {
        const controller = new AbortController();
        setError(false);
        if (!state.q && state.sort === "newest" && state.page === 1) {
            setItems(propositions.slice(0, pageSize));
            setCount(total);
            setLoading(false);
            return () => controller.abort();
        }
        setLoading(true);
        const query = new URLSearchParams({
            limit: String(pageSize),
            offset: String((state.page - 1) * pageSize),
            sort: state.sort,
        });
        if (state.q) query.set("q", state.q);
        fetch(`${clientApiBase()}/propositions/?${query}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error(String(response.status));
                return response.json();
            })
            .then(
                (data: {
                    count: number;
                    items: {
                        id: number;
                        type_code: string;
                        number_label: string;
                        presented_at: string;
                        ementa: string;
                        tramitation_url: string;
                    }[];
                }) => {
                    if (controller.signal.aborted) return;
                    const last = Math.max(1, Math.ceil(data.count / pageSize));
                    if (state.page > last) {
                        const next = { ...state, page: last };
                        setState(next);
                        updateAlertsQueryState(next, "replace");
                        return;
                    }
                    setCount(data.count);
                    setItems(
                        data.items.map((item) => ({
                            id: item.id,
                            typeCode: item.type_code,
                            numberLabel: item.number_label,
                            presentedAt: item.presented_at,
                            summary: item.ementa,
                            url: item.tramitation_url,
                        })),
                    );
                },
            )
            .catch(() => {
                if (!controller.signal.aborted) setError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [state, propositions, total]);
    return (
        <>
            <div className="alerts-toolbar tw:items-center tw:flex tw:gap-4 tw:h-14 tw:w-204 tw:max-[941px]:w-full tw:max-md:block tw:max-md:h-14 tw:max-md:[&_>_.alerts-sort-island]:hidden">
                <form
                    className="alerts-search tw:border-2 tw:border-solid tw:border-[#1b2548] tw:flex tw:h-14 tw:w-156.5 tw:[&_button]:items-center tw:[&_button]:self-center tw:[&_button]:bg-[#1b2548] tw:[&_button]:border-0 tw:[&_button]:box-border tw:[&_button]:text-[#c8f53e] tw:[&_button]:cursor-pointer tw:[&_button]:flex tw:[&_button]:h-14 tw:[&_button]:justify-center tw:[&_button]:[transition:background-color_160ms_ease-out,color_160ms_ease-out] tw:[&_button]:w-14.5 tw:[&_button]:py-3 tw:[&_button]:px-5 tw:motion-reduce:[&_button]:[transition:none] tw:max-[941px]:w-full"
                    role="search"
                    data-astro-reload
                    onSubmit={(event) => {
                        event.preventDefault();
                        navigate({ ...state, q: draft.trim(), page: 1 });
                    }}
                    data-alerts-search
                >
                    <input
                        className="tw:border-0 tw:text-navy tw:flex-[1_0_0] tw:font-normal tw:text-sm tw:leading-4 tw:font-sans tw:min-w-0 tw:[outline:0] tw:pt-3.5 tw:pb-4 tw:px-4 tw:placeholder:text-[#949494] tw:placeholder:opacity-100 tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:-outline-offset-1"
                        type="search"
                        name="q"
                        aria-label="Buscar por termo, proposta ou parlamentar"
                        placeholder="Buscar por termo, proposta ou parlamentar"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                    />
                    <button
                        className="tw:hover:bg-accent tw:hover:text-[#c8f53e] tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:-outline-offset-1"
                        type="submit"
                        aria-label="Buscar alertas"
                    >
                        <svg
                            className="tw:fill-none tw:h-4.5 tw:stroke-[currentColor] tw:[stroke-linecap:square] tw:stroke-[2px] tw:w-4.5"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle cx="10.5" cy="10.5" r="6.5" />
                            <path d="m16 16 4 4" />
                        </svg>
                    </button>
                </form>

                <div className="alerts-sort-island tw:contents">
                    <AlertsSortSelect
                        value={state.sort}
                        onChange={(sort) => navigate({ ...state, sort, page: 1 })}
                    />
                </div>
            </div>

            <div
                className="alerts-results tw:flex tw:flex-col tw:gap-8"
                aria-busy={loading}
                data-alerts-results
                data-page-size={pageSize}
                data-total={total}
            >
                <section
                    className="alerts-list tw:flex tw:flex-col tw:w-204 tw:max-[941px]:w-full tw:[&_>_div+div]:-mt-0.5"
                    aria-label="Alertas recentes"
                    aria-live="polite"
                >
                    {items.map((proposition, index) => (
                        <div key={proposition.id} data-alert-item>
                            <AlertCard
                                alert={{
                                    category: proposition.typeCode,
                                    date: formatDate(proposition.presentedAt),
                                    dateIso: proposition.presentedAt,
                                    title: proposition.numberLabel,
                                    description: proposition.summary,
                                    href: proposition.url,
                                }}
                                featured={index === 0}
                            />
                        </div>
                    ))}
                </section>
                {pageCount > 1 && (
                    <nav
                        className="alerts-pagination tw:items-center tw:flex tw:gap-4 tw:justify-center tw:w-204 tw:[&_button]:items-center tw:[&_button]:bg-white tw:[&_button]:border-2 tw:[&_button]:border-solid tw:[&_button]:border-transparent tw:[&_button]:text-accent tw:[&_button]:cursor-pointer tw:[&_button]:flex tw:[&_button]:font-bold tw:[&_button]:text-lg tw:[&_button]:leading-6 tw:[&_button]:font-display tw:[&_button]:h-10 tw:[&_button]:justify-center tw:[&_button]:min-w-10 tw:[&_button]:p-1.5 tw:[&_span]:text-navy tw:[&_span]:font-bold tw:[&_span]:text-lg tw:[&_span]:leading-6 tw:[&_span]:font-display tw:[&_span]:min-w-40 tw:[&_span]:text-center tw:[&_span]:uppercase tw:max-[941px]:w-full tw:[[hidden]]:hidden"
                        aria-label="Paginação das proposições"
                    >
                        <button
                            className="tw:hover:border-accent tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:outline-offset-1 tw:disabled:cursor-not-allowed tw:disabled:opacity-30"
                            type="button"
                            disabled={loading || state.page <= 1}
                            onClick={() => navigate({ ...state, page: state.page - 1 })}
                            data-previous
                            aria-label="Página anterior"
                        >
                            &larr;
                        </button>
                        <span data-page-status>
                            Página {state.page} de {pageCount}
                        </span>
                        <button
                            className="tw:hover:border-accent tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:outline-offset-1 tw:disabled:cursor-not-allowed tw:disabled:opacity-30"
                            type="button"
                            disabled={loading || state.page >= pageCount}
                            onClick={() => navigate({ ...state, page: state.page + 1 })}
                            data-next
                            aria-label="Próxima página"
                        >
                            &rarr;
                        </button>
                    </nav>
                )}
                <p
                    className="alerts-results__empty tw:text-navy tw:font-bold tw:text-base tw:leading-6 tw:font-sans tw:text-center tw:m-0 tw:[[hidden]]:hidden"
                    data-empty
                    hidden={loading || !!items.length || error}
                >
                    Nenhuma proposição encontrada para essa busca.
                </p>
                <p
                    className="alerts-results__error tw:text-navy tw:font-bold tw:text-base tw:leading-6 tw:font-sans tw:text-center tw:m-0 tw:[[hidden]]:hidden"
                    data-load-error
                    hidden={!error}
                >
                    Não foi possível carregar esta página. Tente novamente.
                </p>
            </div>
        </>
    );
}
