import { Image, css } from "../shared/react-utils";
import thumbsUp from "../../assets/images/activity/thumbs-up.svg";
import thumbsDown from "../../assets/images/activity/thumbs-down.svg";
import search from "../../assets/images/activity/search.svg";
import chevron from "../../assets/images/activity/chevron.svg";
import sortDown from "../../assets/images/activity/sort-down.svg";
import sortUp from "../../assets/images/activity/sort-up.svg";
import arrowBack from "../../assets/images/parliamentarians/arrow-back.svg";
import arrowForward from "../../assets/images/parliamentarians/arrow-forward.svg";
import tooltipTip from "../../assets/images/activity/tooltip-tip.svg";
import {
    DEFAULT_DASHBOARD_ORDER,
    MAP_UF_CODES,
    MOBILE_ITEMS_PER_PAGE,
    MIN_PROPOSICOES_POR_PARLAMENTAR,
} from "../../lib/dashboard-utils";
import mapBase from "../../assets/images/activity/map/map-br-base@2.5x.png";
import mapLegend from "../../assets/images/activity/map/legend-diverging-elas-palette.svg";
import mapUfsVector from "../../assets/images/activity/map/ufs-vector-diverging-elas-palette.svg?raw";
import ActivityYearRange from "./ActivityYearRange";
import ActivityMultiSelect from "./ActivityMultiSelect";
import ActivitySelect from "./ActivitySelect";

const mapPaths = new Map(
    [...mapUfsVector.matchAll(/<path id="([A-Z]{2})" d="([^"]+)"/g)].map((match) => [match[1], match[2]]),
);
const houseOptions = [
    { value: "", label: "Todas" },
    { value: "Deputado", label: "Câmara" },
    { value: "Senador", label: "Senado" },
];
const assessmentOptions = [
    { value: "", label: "Todas" },
    { value: "favorable", label: "Favorável" },
    { value: "unfavorable", label: "Desfavorável" },
];
const dashboardSortOptions = [
    { value: DEFAULT_DASHBOARD_ORDER, label: "Mais Desfavorável (%)" },
    { value: "favorable", label: "Mais Favorável (%)" },
    { value: "total", label: "Mais proposições" },
];
const authorMinimumOptions = [1, MIN_PROPOSICOES_POR_PARLAMENTAR, 10, 20].map((value) => ({
    value: String(value),
    label: `Com ${value}+ ${value === 1 ? "proposição" : "proposições"}`,
}));
import imageAsset12 from "../../assets/images/papelada/proposicao-1-96w.png";
import imageAsset13 from "../../assets/images/papelada/proposicao-desfavoravel-9-96w.png";

import { useEffect, useRef, useState } from "react";
import { clientApiBase, SEARCH_MAX_LENGTH } from "../../lib/client-api";
import type { ActivityExplorerResponse } from "../../lib/activity-api";
import { DashboardRows, PropositionCard, PropositionRow } from "./ActivityResults";
import InfoPopover from "../shared/InfoPopover";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useDialogFocus } from "../../hooks/useDialogFocus";
const formatNumber = new Intl.NumberFormat("pt-BR");
type Filters = {
    search: string;
    house: string;
    assessment: string;
    movements: string;
    gender: string;
    comments: string;
    year_start: string;
    year_end: string;
    party: string[];
    category: string[];
    celerity: string[];
    religion: string[];
    state: string[];
    evaluator: string[];
};
const emptyFilters: Filters = {
    search: "",
    house: "",
    assessment: "",
    movements: "",
    gender: "",
    comments: "",
    year_start: "",
    year_end: "",
    party: [],
    category: [],
    celerity: [],
    religion: [],
    state: [],
    evaluator: [],
};
const defaultControls = {
    items: "10",
    party_sort: DEFAULT_DASHBOARD_ORDER,
    author_sort: DEFAULT_DASHBOARD_ORDER,
    author_minimum: String(MIN_PROPOSICOES_POR_PARLAMENTAR),
};
export default function ActivityExplorer() {
    const rootRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLElement>(null);
    const [filters, setFilters] = useState(emptyFilters);
    const panelSnapshot = useRef(emptyFilters);
    const [applied, setApplied] = useState(emptyFilters);
    const [settings, setSettings] = useState(defaultControls);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState("updated");
    const [direction, setDirection] = useState<"ascending" | "descending">("descending");
    const [panelOpen, setPanelOpen] = useState(false);
    const [advanced, setAdvanced] = useState(false);
    const [expandedCard, setExpandedCard] = useState<string | null>("house");
    const [activeUf, setActiveUf] = useState<string | null>(null);
    const [explorer, setExplorer] = useState<ActivityExplorerResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    const [customPageSize, setCustomPageSize] = useState(false);
    const mobile = useMediaQuery("(max-width: 767px)");
    const controls = {
        ...filters,
        ...settings,
        items: customPageSize ? settings.items : mobile ? String(MOBILE_ITEMS_PER_PAGE) : "10",
    };
    const params = new URLSearchParams();
    for (const [name, selected] of Object.entries(applied)) {
        if (Array.isArray(selected)) selected.forEach((value) => params.append(name, value));
        else if (selected) params.set(name, selected);
    }
    params.set("page", String(page));
    params.set("page_size", controls.items);
    params.set("sort", sort);
    params.set("direction", direction);
    for (const name of ["party_sort", "author_sort", "author_minimum"] as const)
        params.set(name, settings[name]);
    const query = params.toString();
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(false);
        fetch(`${clientApiBase()}/activity/explorer?${query}`, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error(String(response.status));
                return response.json();
            })
            .then((result: ActivityExplorerResponse) => {
                if (!controller.signal.aborted) setExplorer(result);
            })
            .catch(() => {
                if (!controller.signal.aborted) setError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [query, retry]);
    useEffect(() => {
        if (mobile || panelOpen || filters.search === applied.search) return;
        const timeout = setTimeout(() => {
            setApplied(filters);
            setPage(1);
        }, 250);
        return () => clearTimeout(timeout);
    }, [filters, applied.search, mobile, panelOpen]);
    function change(name: string, value: string | string[]) {
        if (name in settings) {
            setSettings((previous) => ({ ...previous, [name]: value }));
            if (name === "items") setCustomPageSize(true);
            setPage(1);
            return;
        }
        const next = { ...filters, [name]: value };
        setFilters(next);
        if (!panelOpen && name !== "search") {
            setApplied(next);
            setPage(1);
        }
    }
    function changeRange(start: string, end: string) {
        const next = { ...filters, year_start: start, year_end: end };
        setFilters(next);
        if (!panelOpen) {
            setApplied(next);
            setPage(1);
        }
    }
    function apply() {
        setApplied(filters);
        setPage(1);
        setPanelOpen(false);
    }
    function reset() {
        setFilters(emptyFilters);
        setApplied(emptyFilters);
        setSettings((previous) => ({ ...defaultControls, items: previous.items }));
        setPage(1);
        setPanelOpen(false);
    }
    function openPanel(expanded: boolean) {
        panelSnapshot.current = filters;
        setAdvanced(expanded);
        setPanelOpen(true);
    }
    function cancelPanel() {
        setFilters(panelSnapshot.current);
        setPanelOpen(false);
    }
    useDialogFocus(panelRef, panelOpen, cancelPanel);
    function sortBy(next: string) {
        setDirection(sort === next && direction === "descending" ? "ascending" : "descending");
        setSort(next);
        setPage(1);
    }
    function changePage(delta: number) {
        setPage((explorer?.page ?? page) + delta);
        rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function mapLabel(uf: string) {
        const row = explorer?.dashboard.state.find((row) => row.key === uf);
        return !row || row.favorable_percent === null
            ? `${uf}: sem proposições avaliadas nos filtros atuais`
            : `${uf}: ${row.favorable} favoráveis e ${row.unfavorable} desfavoráveis`;
    }
    const ready = !loading && !error && !!explorer;
    return (
        <section
            className={`${panelOpen ? "has-overlay" : ""} ${explorer?.total === 0 ? "is-empty-results" : ""} ${explorer?.page_count === 1 ? "is-compact-results" : ""} activity-explorer tw:relative tw:w-full tw:min-h-[2034px] tw:bg-white tw:text-ink tw:font-sans tw:py-6 tw:px-0 tw:mt-12 tw:mb-24 tw:mx-0 tw:max-md:min-h-0 tw:max-md:pt-6 tw:max-md:mt-0 tw:max-md:mb-12 tw:max-md:mx-0 tw:[&.is-compact-results]:min-h-0 tw:[&.is-empty-results]:min-h-0 tw:[&_a:focus-visible]:outline-4 tw:[&_a:focus-visible]:outline-lime tw:[&_a:focus-visible]:outline-offset-1`}
            ref={rootRef}
            aria-busy={loading}
            data-activity-root
            data-thumbs-up={thumbsUp.src}
            data-thumbs-down={thumbsDown.src}
            style={css(
                `--search-icon: url(${search.src}); --select-chevron: url(${chevron.src}); --sort-down: url(${sortDown.src}); --sort-up: url(${sortUp.src}); --arrow-back: url(${arrowBack.src}); --arrow-forward: url(${arrowForward.src})`,
            )}
            aria-labelledby="activity-results-title"
        >
            <form
                className="activity-filters tw:relative tw:flex tw:w-full tw:min-h-9 tw:items-end tw:gap-4 tw:px-6 tw:max-md:px-4 tw:min-[1400px]:grid tw:min-[1400px]:min-h-15 tw:min-[1400px]:grid-cols-[311fr_109fr_158fr_133fr_240fr_183fr_auto] tw:min-[1400px]:px-12 tw:*:min-w-0"
                onSubmit={(event) => {
                    event.preventDefault();
                    apply();
                }}
                data-filters
                data-astro-reload
            >
                <div className="activity-filters__search tw:relative tw:flex tw:min-w-0 tw:flex-1 tw:items-end tw:gap-2 tw:max-md:h-15 tw:min-[1400px]:grid tw:min-[1400px]:grid-cols-[minmax(0,1fr)_32px] tw:min-[1400px]:grid-rows-[16px_36px] tw:min-[1400px]:gap-x-0 tw:min-[1400px]:gap-y-2">
                    <label
                        className={String.raw`activity-field activity-field--search tw:flex tw:min-w-26 tw:flex-auto tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:max-md:[&>span]:hidden tw:min-[1400px]:contents tw:w-full tw:max-md:block tw:max-md:w-auto tw:max-md:flex-1 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:max-[1400px]:min-[768px]:flex tw:max-[1400px]:min-[768px]:w-auto tw:max-[1400px]:min-[768px]:flex-1 tw:max-[1400px]:min-[768px]:[&_>_span]:hidden tw:max-[1400px]:min-[768px]:[&_input]:pr-10.5 tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                    >
                        <span className="tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:min-[1400px]:h-4 tw:min-[1400px]:text-ink tw:min-[1400px]:font-sans tw:min-[1400px]:text-sm tw:min-[1400px]:font-normal tw:min-[1400px]:tracking-normal tw:min-[1400px]:leading-4 tw:min-[1400px]:p-0 tw:min-[1400px]:m-0">
                            Buscar
                        </span>
                        <input
                            className="tw:min-[1400px]:col-start-1 tw:min-[1400px]:col-span-2 tw:min-[1400px]:row-start-2 tw:min-[1400px]:pr-10 tw:w-full tw:h-9 tw:border-2 tw:border-solid tw:rounded-none tw:bg-white tw:text-periwinkle tw:text-base tw:font-normal tw:leading-6 tw:border-accent tw:py-1 tw:px-3 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:hover:border-accent tw:focus:border-accent tw:focus:[outline:0] tw:min-[1400px]:h-9 tw:min-[1400px]:border-[rgb(66_66_246/25%)] tw:min-[1400px]:font-sans tw:min-[1400px]:font-bold tw:min-[1400px]:tracking-normal tw:min-[1400px]:leading-6 tw:min-[1400px]:py-1 tw:min-[1400px]:px-3 tw:placeholder:text-periwinkle tw:placeholder:opacity-100 tw:max-md:w-full tw:max-md:pr-3 tw:max-md:text-sm"
                            name="search"
                            maxLength={SEARCH_MAX_LENGTH}
                            value={filters.search}
                            onChange={(event) => change("search", event.target.value)}
                            type="search"
                            placeholder="Parlamentar, proposta, termo…"
                            autoComplete="off"
                        />
                    </label>
                    <button
                        className="activity-search-button tw:min-[1400px]:z-1 tw:min-[1400px]:col-start-2 tw:min-[1400px]:row-start-2 tw:hover:bg-ink tw:max-md:hidden tw:w-8 tw:h-9 tw:flex-none tw:border-0 tw:[background:#4242f6_var(--search-icon)_center/16px_16px_no-repeat] tw:cursor-pointer tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:min-[1400px]:w-8 tw:min-[1400px]:h-8 tw:min-[1400px]:self-center tw:min-[1400px]:[justify-self:start] tw:min-[1400px]:bg-size-[16px_16px] tw:max-[1400px]:min-[768px]:absolute tw:max-[1400px]:min-[768px]:right-27.5"
                        type="submit"
                        aria-label="Buscar"
                    ></button>
                    <button
                        className="activity-mobile-filter-button tw:hover:bg-ink tw:hover:border-ink tw:hover:text-white! tw:focus-visible:bg-ink tw:focus-visible:border-ink tw:focus-visible:text-white! tw:relative tw:hidden tw:w-28.5 tw:h-9 tw:flex-none tw:items-center tw:justify-center tw:[justify-self:end] tw:border-2 tw:border-solid tw:border-accent tw:bg-accent tw:text-white! tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:text-center tw:uppercase tw:whitespace-nowrap tw:cursor-pointer tw:py-1 tw:px-3 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:max-md:inline-flex tw:max-md:w-19.5 tw:max-md:bg-white tw:max-md:text-accent! tw:max-md:py-1 tw:max-md:px-2 tw:[.activity-explorer.has-overlay_&]:z-82 tw:max-[1400px]:min-[768px]:in-[.activity-explorer]:inline-flex tw:max-[1400px]:min-[768px]:in-[.activity-explorer]:w-19.5 tw:max-[1400px]:min-[768px]:in-[.activity-explorer]:bg-white tw:max-[1400px]:min-[768px]:in-[.activity-explorer]:text-accent! tw:max-[1400px]:min-[768px]:in-[.activity-explorer]:py-1 tw:max-[1400px]:min-[768px]:in-[.activity-explorer]:px-2"
                        type="button"
                        data-open-filters="basic"
                        onClick={() => openPanel(false)}
                        aria-expanded={panelOpen}
                        aria-controls="activity-filter-panel"
                    >
                        Filtros{" "}
                        <span
                            className="tw:absolute tw:-top-3 tw:-right-2 tw:flex tw:size-5.5 tw:items-center tw:justify-center tw:rounded-full tw:bg-[#ff5865] tw:text-xs tw:text-white"
                            data-filter-count
                            hidden={!explorer?.summary.active_filter_count}
                        >
                            {explorer?.summary.active_filter_count ?? 0}
                        </span>
                    </button>
                </div>

                <div className="activity-filters__desktop-fields tw:hidden tw:min-[1400px]:contents">
                    <div
                        className={String.raw`activity-field tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:w-27.5 tw:flex-none tw:min-[1400px]:w-auto tw:min-[1400px]:min-w-0 tw:min-[1400px]:h-15 tw:min-[1400px]:gap-0 tw:min-[1400px]:gap-y-2 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex tw:min-[1400px]:flex-col tw:relative`}
                    >
                        <span className="tw:min-[1400px]:h-4 tw:min-[1400px]:text-ink tw:min-[1400px]:font-sans tw:min-[1400px]:text-sm tw:min-[1400px]:font-normal tw:min-[1400px]:tracking-normal tw:min-[1400px]:leading-4 tw:min-[1400px]:p-0 tw:min-[1400px]:m-0">
                            Casa
                        </span>
                        <ActivitySelect
                            name="house"
                            value={String(controls.house ?? "")}
                            onChange={(value) => change("house", value)}
                            label="Casa"
                            options={houseOptions}
                        />
                    </div>
                    <div
                        className={String.raw`activity-field activity-field--year tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:w-26 tw:flex-none tw:min-[1400px]:w-auto tw:min-[1400px]:min-w-0 tw:min-[1400px]:h-15 tw:min-[1400px]:gap-0 tw:min-[1400px]:gap-y-2 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex tw:min-[1400px]:flex-col tw:relative`}
                    >
                        <span className="tw:min-[1400px]:h-4 tw:min-[1400px]:text-ink tw:min-[1400px]:font-sans tw:min-[1400px]:text-sm tw:min-[1400px]:font-normal tw:min-[1400px]:tracking-normal tw:min-[1400px]:leading-4 tw:min-[1400px]:p-0 tw:min-[1400px]:m-0">
                            Ano
                        </span>
                        <ActivityYearRange
                            options={explorer?.options.year ?? []}
                            selection={{ start: filters.year_start, end: filters.year_end }}
                            onChange={({ start, end }) => changeRange(start, end)}
                        />
                    </div>
                    <div
                        className={String.raw`activity-field tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:w-33.5 tw:flex-none tw:min-[1400px]:w-auto tw:min-[1400px]:min-w-0 tw:min-[1400px]:h-15 tw:min-[1400px]:gap-0 tw:min-[1400px]:gap-y-2 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex tw:min-[1400px]:flex-col tw:relative`}
                    >
                        <span className="tw:min-[1400px]:h-4 tw:min-[1400px]:text-ink tw:min-[1400px]:font-sans tw:min-[1400px]:text-sm tw:min-[1400px]:font-normal tw:min-[1400px]:tracking-normal tw:min-[1400px]:leading-4 tw:min-[1400px]:p-0 tw:min-[1400px]:m-0">
                            Partido
                        </span>
                        <ActivityMultiSelect
                            name="party"
                            values={filters.party}
                            options={explorer?.options.party ?? []}
                            onChange={(value) => change("party", value)}
                            label="Partido"
                            placeholder="Todos"
                        />
                    </div>
                    <div
                        className={String.raw`activity-field activity-field--wide tw:flex tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:min-w-45 tw:w-60 tw:flex-none tw:min-[1400px]:w-auto tw:min-[1400px]:min-w-0 tw:min-[1400px]:h-15 tw:min-[1400px]:gap-0 tw:min-[1400px]:gap-y-2 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex tw:min-[1400px]:flex-col tw:relative`}
                    >
                        <span className="tw:min-[1400px]:h-4 tw:min-[1400px]:text-ink tw:min-[1400px]:font-sans tw:min-[1400px]:text-sm tw:min-[1400px]:font-normal tw:min-[1400px]:tracking-normal tw:min-[1400px]:leading-4 tw:min-[1400px]:p-0 tw:min-[1400px]:m-0">
                            Categoria
                        </span>
                        <ActivityMultiSelect
                            name="category"
                            values={filters.category}
                            options={explorer?.options.category ?? []}
                            onChange={(value) => change("category", value)}
                            label="Categoria"
                            placeholder="Todas as categorias"
                        />
                    </div>
                    <div
                        className={String.raw`activity-field activity-field--assessment tw:flex tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:min-w-40 tw:w-46 tw:flex-none tw:min-[1400px]:w-auto tw:min-[1400px]:min-w-0 tw:min-[1400px]:h-15 tw:min-[1400px]:gap-0 tw:min-[1400px]:gap-y-2 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex tw:min-[1400px]:flex-col tw:relative`}
                    >
                        <span className="tw:min-[1400px]:h-4 tw:min-[1400px]:text-ink tw:min-[1400px]:font-sans tw:min-[1400px]:text-sm tw:min-[1400px]:font-normal tw:min-[1400px]:tracking-normal tw:min-[1400px]:leading-4 tw:min-[1400px]:p-0 tw:min-[1400px]:m-0">
                            Avaliação
                        </span>
                        <ActivitySelect
                            name="assessment"
                            value={String(controls.assessment ?? "")}
                            onChange={(value) => change("assessment", value)}
                            label="Avaliação"
                            options={assessmentOptions}
                        />
                    </div>
                    <button
                        className="activity-more-filters tw:hover:bg-ink tw:hover:border-ink tw:hover:text-white! tw:focus-visible:bg-ink tw:focus-visible:border-ink tw:focus-visible:text-white! tw:relative tw:inline-flex tw:w-28.5 tw:h-9 tw:flex-none tw:items-center tw:justify-center tw:[justify-self:end] tw:border-2 tw:border-solid tw:border-accent tw:bg-accent tw:text-white! tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:text-center tw:uppercase tw:whitespace-nowrap tw:cursor-pointer tw:py-1 tw:px-3 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:min-[1400px]:ml-0 tw:min-[1400px]:flex-none tw:min-[1400px]:font-display tw:min-[1400px]:text-lg tw:min-[1400px]:pt-2 tw:min-[1400px]:pb-1.5 tw:min-[1400px]:pr-3 tw:min-[1400px]:pl-3.5 tw:[.activity-explorer.has-overlay_&]:z-82"
                        type="button"
                        data-open-filters="advanced"
                        onClick={() => openPanel(true)}
                        aria-expanded={panelOpen}
                        aria-controls="activity-filter-panel"
                    >
                        Mais filtros{" "}
                        <span
                            className="tw:absolute tw:-top-3 tw:-right-2 tw:flex tw:size-5.5 tw:items-center tw:justify-center tw:rounded-full tw:bg-[#ff5865] tw:text-xs tw:text-white"
                            data-filter-count
                            hidden={!explorer?.summary.active_filter_count}
                        >
                            {explorer?.summary.active_filter_count ?? 0}
                        </span>
                    </button>
                </div>

                <aside
                    className={`${advanced ? "is-advanced" : ""} activity-filter-panel tw:absolute tw:z-81 tw:top-21 tw:right-12 tw:flex tw:w-96 tw:h-210.5 tw:overflow-hidden tw:border tw:border-solid tw:border-accent tw:bg-white tw:flex-col tw:p-6 tw:[&_h2]:font-display tw:[&_h2]:text-2xl tw:[&_h2]:font-bold tw:[&_h2]:[font-variation-settings:'wdth'_75] tw:[&_h2]:leading-8 tw:[&_h2]:uppercase tw:[&_h2]:m-0 tw:max-md:top-21 tw:max-md:right-auto tw:max-md:left-4 tw:max-md:w-[calc(100%-32px)] tw:max-md:h-129 tw:max-md:max-h-[calc(100dvh-32px)] tw:max-md:transform-none tw:max-md:border tw:max-md:border-solid tw:max-md:border-accent tw:max-md:gap-0 tw:max-md:overflow-hidden tw:max-md:p-6 tw:max-md:[&_h2]:text-xl tw:max-md:[&_h2]:leading-6 tw:[[hidden]]:hidden tw:max-md:[&.is-advanced]:h-160 tw:max-[1400px]:min-[768px]:right-6`}
                    id="activity-filter-panel"
                    ref={panelRef}
                    data-filter-panel
                    hidden={!panelOpen}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                    aria-label="Filtros da atividade legislativa"
                >
                    <header className="tw:hidden tw:max-md:absolute tw:max-md:top-1.5 tw:max-md:right-2 tw:max-md:z-1">
                        <h2 className="tw:hidden tw:max-md:hidden">Filtros</h2>
                        <button
                            className="tw:w-8 tw:h-8 tw:border-0 tw:[background:none] tw:text-accent tw:text-3xl tw:leading-none tw:cursor-pointer tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:max-md:w-7 tw:max-md:h-7 tw:max-md:text-[26px]"
                            type="button"
                            onClick={cancelPanel}
                            data-close-filters
                            aria-label="Fechar filtros"
                        >
                            ×
                        </button>
                    </header>
                    <div className="activity-filter-panel__scroll tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:gap-3 tw:overflow-y-auto tw:max-md:flex-auto tw:max-md:gap-3 tw:max-md:overflow-y-auto tw:max-md:scrollbar-thin tw:max-md:[scrollbar-color:#aeb7ea_transparent] tw:max-md:p-0">
                        <div className="activity-filter-panel__basic tw:flex tw:min-w-0 tw:flex-none tw:flex-col tw:gap-3 tw:md:hidden tw:max-md:gap-3 tw:max-[1400px]:min-[768px]:flex">
                            <div
                                className={String.raw`activity-field tw:flex tw:min-w-26 tw:flex-auto tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:max-md:w-27.5 tw:max-md:max-w-full tw:max-md:flex-none tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                            >
                                <span>Casa</span>
                                <ActivitySelect
                                    name="house"
                                    value={String(controls.house ?? "")}
                                    onChange={(value) => change("house", value)}
                                    label="Casa"
                                    options={houseOptions}
                                />
                            </div>
                            <div
                                className={String.raw`activity-field activity-field--year tw:flex tw:min-w-26 tw:flex-auto tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:max-md:w-39.5 tw:max-md:max-w-full tw:max-md:flex-none tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                            >
                                <span>Ano</span>
                                <ActivityYearRange
                                    options={explorer?.options.year ?? []}
                                    selection={{ start: filters.year_start, end: filters.year_end }}
                                    onChange={({ start, end }) => changeRange(start, end)}
                                />
                            </div>
                            <div
                                className={String.raw`activity-field tw:flex tw:min-w-26 tw:flex-auto tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:max-md:w-33.5 tw:max-md:max-w-full tw:max-md:flex-none tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                            >
                                <span>Partido</span>
                                <ActivityMultiSelect
                                    name="party"
                                    values={filters.party}
                                    options={explorer?.options.party ?? []}
                                    onChange={(value) => change("party", value)}
                                    label="Partido"
                                    placeholder="Todos"
                                />
                            </div>
                            <div
                                className={String.raw`activity-field tw:flex tw:min-w-26 tw:flex-auto tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:max-md:w-60 tw:max-md:max-w-full tw:max-md:flex-none tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                            >
                                <span>Categoria</span>
                                <ActivityMultiSelect
                                    name="category"
                                    values={filters.category}
                                    options={explorer?.options.category ?? []}
                                    onChange={(value) => change("category", value)}
                                    label="Categoria"
                                    placeholder="Todas as categorias"
                                />
                            </div>
                            <div
                                className={String.raw`activity-field tw:flex tw:min-w-26 tw:flex-auto tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:max-md:w-46 tw:max-md:max-w-full tw:max-md:flex-none tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                            >
                                <span>Avaliação</span>
                                <ActivitySelect
                                    name="assessment"
                                    value={String(controls.assessment ?? "")}
                                    onChange={(value) => change("assessment", value)}
                                    label="Avaliação"
                                    options={assessmentOptions}
                                />
                            </div>
                        </div>
                        <button
                            className="activity-filter-panel__toggle tw:self-start tw:border-0 tw:border-b tw:border-solid tw:border-b-current tw:[background:none] tw:text-accent tw:font-bold tw:cursor-pointer tw:p-0 tw:md:hidden tw:max-md:mt-0 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:max-[1400px]:min-[768px]:block"
                            type="button"
                            data-toggle-advanced
                            onClick={() => setAdvanced(!advanced)}
                            aria-expanded={advanced}
                            aria-controls="activity-filter-panel-advanced"
                        >
                            {advanced ? "Menos filtros" : "Mais filtros"}
                        </button>
                        <div
                            className="activity-filter-panel__advanced tw:hidden tw:flex-none tw:flex-col tw:gap-3 tw:md:flex tw:[.activity-filter-panel.is-advanced_&]:flex tw:max-[1400px]:min-[768px]:hidden tw:max-[1400px]:min-[768px]:[.activity-filter-panel.is-advanced_&]:flex"
                            id="activity-filter-panel-advanced"
                        >
                            <fieldset className="tw:flex tw:min-w-0 tw:flex-none tw:flex-col tw:gap-3 tw:w-full tw:border-0 tw:p-0 tw:m-0">
                                <legend className="tw:font-sans tw:text-sm tw:font-normal tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:normal-case tw:flex tw:w-full tw:h-4 tw:items-center tw:gap-2 tw:text-muted tw:mt-0 tw:mb-3 tw:mx-0 tw:after:h-px tw:after:flex-1 tw:after:bg-muted tw:after:content-['']">
                                    Proposição
                                </legend>
                                <div
                                    className={String.raw`activity-field activity-field--presented tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-38.5 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>Apresentada em</span>
                                    <ActivityYearRange
                                        options={explorer?.options.year ?? []}
                                        selection={{ start: filters.year_start, end: filters.year_end }}
                                        onChange={({ start, end }) => changeRange(start, end)}
                                    />
                                </div>
                                <div
                                    className={String.raw`activity-field activity-field--status tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-52.5 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>Como está?</span>
                                    <ActivityMultiSelect
                                        name="celerity"
                                        values={filters.celerity}
                                        options={explorer?.options.celerity ?? []}
                                        onChange={(value) => change("celerity", value)}
                                        label="Ritmo da proposição"
                                        placeholder="Qualquer ritmo"
                                    />
                                </div>
                                <div
                                    className={String.raw`activity-field activity-field--movements tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-48 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>Movimentações (últimos 90 dias)</span>
                                    <ActivitySelect
                                        name="movements"
                                        value={String(controls.movements ?? "")}
                                        onChange={(value) => change("movements", value)}
                                        label="Movimentações (últimos 90 dias)"
                                        options={[
                                            { value: "", label: "Qualquer volume" },
                                            {
                                                value: "with",
                                                label: "Com movimentações",
                                            },
                                            {
                                                value: "without",
                                                label: "Sem movimentações",
                                            },
                                        ]}
                                    />
                                </div>
                                <div
                                    className={String.raw`activity-field activity-field--markers tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-full tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:[.activity-filter-panel\_\_advanced_&_>_:is(.activity-select,.activity-multiselect)]:w-48 tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>Marcadores analíticos</span>
                                    <ActivitySelect
                                        name="markers"
                                        value=""
                                        onChange={(value) => change("markers", value)}
                                        label="Marcadores analíticos"
                                        disabled
                                        options={[{ value: "", label: "Em breve" }]}
                                    />
                                </div>
                            </fieldset>
                            <fieldset className="tw:flex tw:min-w-0 tw:flex-none tw:flex-col tw:gap-3 tw:w-full tw:border-0 tw:p-0 tw:m-0">
                                <legend className="tw:font-sans tw:text-sm tw:font-normal tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:normal-case tw:flex tw:w-full tw:h-4 tw:items-center tw:gap-2 tw:text-muted tw:mt-0 tw:mb-3 tw:mx-0 tw:after:h-px tw:after:flex-1 tw:after:bg-muted tw:after:content-['']">
                                    Autoria
                                </legend>
                                <div
                                    className={String.raw`activity-field activity-field--gender tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-full tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:[.activity-filter-panel\_\_advanced_&_>_:is(.activity-select,.activity-multiselect)]:w-60 tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>Gênero de quem propôs</span>
                                    <ActivitySelect
                                        name="gender"
                                        value={String(controls.gender ?? "")}
                                        onChange={(value) => change("gender", value)}
                                        label="Gênero de quem propôs"
                                        options={[
                                            { value: "", label: "Todos" },
                                            { value: "F", label: "Mulher" },
                                            { value: "M", label: "Homem" },
                                        ]}
                                    />
                                </div>
                                <div
                                    className={String.raw`activity-field activity-field--religion tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-full tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:[.activity-filter-panel\_\_advanced_&_>_:is(.activity-select,.activity-multiselect)]:w-51 tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>Religião de quem propôs</span>
                                    <ActivityMultiSelect
                                        name="religion"
                                        values={filters.religion}
                                        options={explorer?.options.religion ?? []}
                                        onChange={(value) => change("religion", value)}
                                        label="Religião de quem propôs"
                                        placeholder="Todas"
                                    />
                                </div>
                                <div
                                    className={String.raw`activity-field activity-field--state tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-full tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:[.activity-filter-panel\_\_advanced_&_>_:is(.activity-select,.activity-multiselect)]:w-44 tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>UF de quem propôs</span>
                                    <ActivityMultiSelect
                                        name="state"
                                        values={filters.state}
                                        options={explorer?.options.state ?? []}
                                        onChange={(value) => change("state", value)}
                                        label="UF de quem propôs"
                                        placeholder="Todas"
                                    />
                                </div>
                            </fieldset>
                            <fieldset className="tw:flex tw:min-w-0 tw:flex-none tw:flex-col tw:gap-3 tw:w-full tw:border-0 tw:p-0 tw:m-0">
                                <legend className="tw:font-sans tw:text-sm tw:font-normal tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:normal-case tw:flex tw:w-full tw:h-4 tw:items-center tw:gap-2 tw:text-muted tw:mt-0 tw:mb-3 tw:mx-0 tw:after:h-px tw:after:flex-1 tw:after:bg-muted tw:after:content-['']">
                                    Avaliação
                                </legend>
                                <div
                                    className={String.raw`activity-field activity-field--comments tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-35.5 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>Há ressalvas?</span>
                                    <ActivitySelect
                                        name="comments"
                                        value={String(controls.comments ?? "")}
                                        onChange={(value) => change("comments", value)}
                                        label="Há ressalvas?"
                                        options={[
                                            { value: "", label: "Tanto faz" },
                                            { value: "yes", label: "Com ressalvas" },
                                            { value: "no", label: "Sem ressalvas" },
                                        ]}
                                    />
                                </div>
                                <div
                                    className={String.raw`activity-field activity-field--evaluator tw:flex tw:min-w-26 tw:flex-col tw:gap-2 tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:[&>span]:whitespace-nowrap tw:flex-none tw:w-60 tw:min-[1400px]:[.activity-filters\_\_desktop-fields_>_&:has(.activity-multiselect,.activity-select)::after]:content-none tw:min-[1400px]:flex-col tw:relative tw:min-[1400px]:after:absolute tw:min-[1400px]:after:right-2 tw:min-[1400px]:after:bottom-2`}
                                >
                                    <span>Quem avaliou?</span>
                                    <ActivityMultiSelect
                                        name="evaluator"
                                        values={filters.evaluator}
                                        options={explorer?.options.evaluator ?? []}
                                        onChange={(value) => change("evaluator", value)}
                                        label="Quem avaliou"
                                        placeholder="Qualquer organização"
                                    />
                                </div>
                            </fieldset>
                        </div>
                        <div className="activity-filter-panel__button-wrapper tw:w-full tw:flex-none tw:pt-3">
                            <button
                                className="activity-filter-panel__apply tw:hover:bg-ink tw:hover:border-ink tw:hover:text-white! tw:focus-visible:bg-ink tw:focus-visible:border-ink tw:focus-visible:text-white! tw:h-12 tw:flex-none tw:relative tw:block tw:w-full tw:border-2 tw:border-solid tw:border-accent tw:bg-accent tw:text-white! tw:font-display tw:text-lg tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:text-center tw:uppercase tw:whitespace-nowrap tw:cursor-pointer tw:py-2.5 tw:px-3 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1"
                                type="button"
                                onClick={() => apply()}
                                data-apply-filters
                            >
                                Aplicar filtros
                            </button>
                        </div>
                    </div>
                </aside>
            </form>

            <div
                className="activity-backdrop tw:fixed tw:z-80 tw:inset-0 tw:[background:rgb(255_255_255/75%)] tw:[[hidden]]:hidden"
                onClick={cancelPanel}
                data-backdrop
                hidden={!panelOpen}
            ></div>

            <div className="activity-summary tw:flex tw:min-h-14 tw:flex-col tw:pt-6 tw:pb-2 tw:px-12 tw:[&_h2]:font-sans tw:[&_h2]:text-base tw:[&_h2]:font-normal tw:[&_h2]:leading-6 tw:[&_h2]:m-0 tw:[&_button]:border-0 tw:[&_button]:[background:none] tw:[&_button]:text-accent tw:[&_button]:text-sm tw:[&_button]:font-normal tw:[&_button]:leading-4 tw:[&_button]:cursor-pointer tw:[&_button]:p-0 tw:max-md:min-h-18 tw:max-md:py-6 tw:max-md:px-4 tw:max-md:[&_h2]:text-base tw:max-md:[&_h2]:leading-6 tw:[.activity-explorer:not(.is-empty-results)_&_h2::after]:[content:'_encontradas'] tw:[&_button:disabled]:cursor-default tw:[&_button:disabled]:opacity-55 tw:max-[1400px]:min-[768px]:pr-6 tw:max-[1400px]:min-[768px]:pl-6">
                <div className="activity-summary__heading tw:flex tw:min-h-6 tw:items-center tw:justify-between tw:gap-6 tw:max-md:items-start">
                    <h2 id="activity-results-title" data-total hidden={!ready}>
                        {explorer?.total
                            ? `${formatNumber.format(explorer.total)} proposições`
                            : "Nenhuma proposição encontrada"}
                    </h2>
                    <div className="tw:flex tw:items-center tw:gap-6 tw:whitespace-nowrap tw:max-md:flex-col tw:max-md:items-end tw:max-md:gap-0 tw:max-md:text-xs tw:max-md:leading-4">
                        <button
                            className="tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:max-md:leading-5"
                            type="button"
                            data-download
                            onClick={() =>
                                window.location.assign(`${clientApiBase()}/activity/explorer/export?${query}`)
                            }
                            disabled={!ready || !explorer?.total}
                            aria-disabled={!ready || !explorer?.total}
                        >
                            <span
                                className="activity-summary__icon tw:inline-block tw:mr-1 tw:pointer-events-none"
                                aria-hidden="true"
                            >
                                &#8595;
                            </span>
                            Baixar planilha
                        </button>
                        <button
                            className="tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:max-md:leading-5"
                            type="button"
                            onClick={reset}
                            data-clear-filters
                            disabled={!ready || !explorer?.summary.active_filter_count}
                            aria-disabled={!ready || !explorer?.summary.active_filter_count}
                        >
                            <span
                                className="activity-summary__icon tw:inline-block tw:mr-1 tw:pointer-events-none"
                                aria-hidden="true"
                            >
                                &#215;
                            </span>
                            Remover filtros
                        </button>
                    </div>
                </div>
            </div>

            <div
                className="activity-status tw:flex tw:min-h-90 tw:items-center tw:justify-center tw:flex-col tw:gap-4 tw:text-center tw:[&_p]:leading-6 tw:[&_p]:m-0 tw:[&_button]:h-10 tw:[&_button]:border-0 tw:[&_button]:bg-accent tw:[&_button]:text-white tw:[&_button]:font-bold tw:[&_button]:cursor-pointer tw:[&_button]:py-2 tw:[&_button]:px-5 tw:[[hidden]]:hidden tw:[.activity-status&_>_span]:w-10 tw:[.activity-status&_>_span]:h-10 tw:[.activity-status&_>_span]:border-4 tw:[.activity-status&_>_span]:border-solid tw:[.activity-status&_>_span]:border-[rgb(66_66_246/20%)] tw:[.activity-status&_>_span]:border-t-accent tw:[.activity-status&_>_span]:rounded-[50%] tw:[.activity-status&_>_span]:animate-spin tw:motion-reduce:[.activity-status&_>_span]:[animation-duration:1.8s]"
                data-status
                hidden={ready}
                role="status"
                aria-live="polite"
            >
                {error ? (
                    <>
                        <p>
                            <strong>Não foi possível carregar as proposições.</strong>
                            <br />
                            Confira sua conexão e tente novamente.
                        </p>
                        <button type="button" onClick={() => setRetry((value) => value + 1)}>
                            Tentar novamente
                        </button>
                    </>
                ) : (
                    <>
                        <span aria-hidden="true" />
                        <p>{explorer ? "Aplicando filtros…" : "Carregando atividade legislativa…"}</p>
                    </>
                )}
            </div>

            <section
                className="activity-dashboard tw:relative tw:flex tw:w-full tw:flex-col tw:gap-2 tw:pt-0 tw:pb-6 tw:px-12 tw:max-md:w-86 tw:max-md:max-w-[calc(100%-32px)] tw:max-md:pt-0 tw:max-md:pb-6 tw:max-md:px-0 tw:max-md:my-0 tw:max-md:mx-auto tw:[[hidden]]:hidden tw:max-[1400px]:min-[768px]:pr-6 tw:max-[1400px]:min-[768px]:pl-6"
                data-dashboard
                hidden={!ready || !explorer?.total}
                aria-label="Resumo visual das proposições"
            >
                <div className="activity-dashboard__overview tw:grid tw:h-29.5 tw:grid-cols-2 tw:grid-rows-[74px_12px_20px] tw:gap-x-2 tw:*:min-w-0 tw:max-md:h-26.5 tw:max-md:grid-rows-[62px_12px_20px]">
                    <div className="activity-dashboard__score activity-dashboard__score--favorable tw:flex tw:h-18.5 tw:items-center tw:gap-2 tw:font-display tw:text-lg tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:uppercase tw:[&_b]:text-[28px] tw:[&_b]:leading-8 tw:max-md:h-15.5 tw:max-md:gap-1 tw:max-md:text-sm tw:max-md:leading-5 tw:max-md:[&_b]:text-xl tw:max-md:[&_b]:leading-6">
                        <Image
                            className="activity-dashboard__paper tw:w-9 tw:h-13 tw:object-contain tw:transform-[rotate(5deg)] tw:max-md:w-7 tw:max-md:h-9.5 tw:-mr-4 tw:max-md:-mr-2.5"
                            src={imageAsset12}
                            loading="eager"
                            alt=""
                        />
                        <Image
                            className="activity-dashboard__thumb tw:w-8 tw:h-8 tw:max-md:w-6 tw:max-md:h-6"
                            src={thumbsUp}
                            loading="eager"
                            alt=""
                        />
                        <span>Favorável</span>
                        <b data-favorable-count>{formatNumber.format(explorer?.summary.favorable ?? 0)}</b>
                    </div>
                    <div className="activity-dashboard__score activity-dashboard__score--unfavorable tw:flex tw:h-18.5 tw:items-center tw:gap-2 tw:font-display tw:text-lg tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:uppercase tw:[&_b]:text-[28px] tw:[&_b]:leading-8 tw:max-md:h-15.5 tw:max-md:gap-1 tw:max-md:text-sm tw:max-md:leading-5 tw:max-md:[&_b]:text-xl tw:max-md:[&_b]:leading-6 tw:justify-end">
                        <b data-unfavorable-count>
                            {formatNumber.format(explorer?.summary.unfavorable ?? 0)}
                        </b>
                        <span>Desfavorável</span>
                        <Image
                            className="activity-dashboard__thumb tw:w-8 tw:h-8 tw:max-md:w-6 tw:max-md:h-6"
                            src={thumbsDown}
                            loading="eager"
                            alt=""
                        />
                        <Image
                            className="activity-dashboard__paper tw:w-9 tw:h-13 tw:object-contain tw:transform-[rotate(5deg)] tw:max-md:w-7 tw:max-md:h-9.5 tw:-ml-4 tw:max-md:-ml-2.5"
                            src={imageAsset13}
                            loading="eager"
                            alt=""
                        />
                    </div>
                    <div
                        className="activity-dashboard__bar tw:col-span-2 tw:h-3 tw:gap-0.5 tw:[&.is-empty]:block tw:[&.is-empty]:[background:rgb(66_66_246/25%)] tw:[&.is-empty_span]:hidden tw:flex tw:w-full! tw:flex-row tw:*:first:w-(--favorable-share,50%) tw:*:last:flex-1"
                        style={css(`--favorable-share: ${explorer?.summary.favorable_share ?? 0}%`)}
                        data-result-bar
                    >
                        <span className="tw:bg-[#c1e639]"></span>
                        <span className="tw:bg-[#ff5865]"></span>
                    </div>
                    <div
                        className="activity-dashboard__scale tw:col-span-2 tw:[&_span]:relative tw:[&_span]:min-w-9 tw:[&_span]:pt-2 tw:flex tw:h-5 tw:justify-between tw:text-[rgb(11_15_94/75%)] tw:text-xs tw:leading-3"
                        aria-hidden="true"
                    >
                        <span className="tw:before:absolute tw:before:top-0 tw:before:left-0 tw:before:w-px tw:before:h-1.5 tw:before:[background:rgb(66_66_246/25%)] tw:before:content-['']">
                            0%
                        </span>
                        <span className="tw:text-center tw:before:absolute tw:before:top-0 tw:before:left-[50%] tw:before:w-px tw:before:h-1.5 tw:before:[background:rgb(66_66_246/25%)] tw:before:content-['']">
                            25%
                        </span>
                        <span className="tw:text-center tw:before:absolute tw:before:top-0 tw:before:left-[50%] tw:before:w-px tw:before:h-1.5 tw:before:[background:rgb(66_66_246/25%)] tw:before:content-['']">
                            50%
                        </span>
                        <span className="tw:text-center tw:before:absolute tw:before:top-0 tw:before:left-[50%] tw:before:w-px tw:before:h-1.5 tw:before:[background:rgb(66_66_246/25%)] tw:before:content-['']">
                            75%
                        </span>
                        <span className="tw:text-right tw:before:absolute tw:before:top-0 tw:before:left-auto tw:before:w-px tw:before:h-1.5 tw:before:[background:rgb(66_66_246/25%)] tw:before:content-[''] tw:before:right-0">
                            100%
                        </span>
                    </div>
                </div>

                <div className="activity-dashboard__grid tw:grid tw:w-full tw:grid-cols-1 tw:gap-3 tw:*:min-w-0 tw:min-[768px]:grid-cols-2 tw:min-[768px]:gap-2 tw:min-[1400px]:h-188 tw:min-[1400px]:grid-cols-4">
                    <div className="activity-dashboard__column tw:flex tw:min-w-0 tw:h-188 tw:flex-col tw:gap-2 tw:max-md:contents tw:max-[1400px]:min-[768px]:h-auto">
                        <article
                            className={String.raw`${expandedCard === "gender" ? "is-expanded" : "is-collapsed"} activity-dashboard-card activity-dashboard-card--gender tw:relative tw:flex tw:min-w-0 tw:overflow-hidden tw:flex-col tw:text-ink tw:[&>footer]:min-h-6.5 tw:[&>footer]:flex-none tw:[&>footer]:border tw:[&>footer]:border-solid tw:[&>footer]:border-[rgb(66_66_246/25%)] tw:[&>footer]:rounded-[0_0_4px_4px] tw:[&>footer]:text-[rgb(11_15_94/75%)] tw:[&>footer]:text-xs tw:[&>footer]:leading-4 tw:[&>footer]:pt-1 tw:[&>footer]:pb-1.5 tw:[&>footer]:px-3 tw:max-md:w-full tw:max-[360px]:[&_h3]:pr-2 tw:max-[360px]:[&_h3]:pl-2 tw:h-35.5 tw:[&.is-collapsed_.activity-dashboard-card\_\_toggle::before]:transform-[rotate(-90deg)] tw:max-md:[&.is-collapsed]:h-6! tw:max-md:[&.is-collapsed_>_:not(header)]:hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:overflow-hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:text-ellipsis tw:[&_.activity-dashboard-card\_\_row]:min-h-7`}
                        >
                            <header className="tw:flex tw:h-6 tw:min-w-0 tw:flex-[0_0_24px] tw:items-start tw:justify-between tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                <h3 className="tw:relative tw:z-1 tw:flex tw:h-6 tw:items-center tw:gap-1 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:border-b-white tw:bg-white tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:whitespace-nowrap tw:pt-1 tw:pb-0.5 tw:px-3 tw:mt-0 tw:-mb-px tw:mx-0 tw:before:hidden tw:before:w-4 tw:before:h-4 tw:before:flex-none tw:before:[background:var(--select-chevron)_center/12px_8px_no-repeat] tw:before:content-[''] tw:max-md:before:block">
                                    <button
                                        type="button"
                                        className="activity-dashboard-card__toggle tw:border-0 tw:bg-transparent tw:p-0 tw:text-inherit tw:font-inherit tw:uppercase tw:max-md:cursor-pointer tw:max-md:before:mr-1 tw:max-md:before:content-['⌄']"
                                        disabled={!mobile}
                                        aria-expanded={mobile ? expandedCard === "gender" : undefined}
                                        aria-controls="activity-dashboard-content-gender"
                                        onClick={() =>
                                            setExpandedCard(expandedCard === "gender" ? null : "gender")
                                        }
                                    >
                                        {"Por gênero"}
                                    </button>
                                    <InfoPopover label="Saiba mais">
                                        <strong>Por gênero</strong>
                                        <p>Considera cada autoria única da proposição.</p>
                                        <small>Mostramos somente feminino e masculino.</small>
                                    </InfoPopover>
                                </h3>
                            </header>
                            <div
                                id="activity-dashboard-content-gender"
                                className="activity-dashboard-card__content tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)] tw:p-3 tw:pt-2 tw:pb-2 tw:gap-1 tw:last:border-b tw:last:border-solid tw:last:border-b-[rgb(66_66_246/25%)] tw:last:rounded-[0_0_4px_4px]"
                                data-dashboard-gender
                            >
                                <DashboardRows rows={explorer?.dashboard.gender ?? []} author={false} />
                            </div>
                            <footer>Não há dados sobre outros gêneros no Congresso</footer>
                        </article>
                        <article
                            className={String.raw`${expandedCard === "house" ? "is-expanded" : "is-collapsed"} activity-dashboard-card activity-dashboard-card--house tw:relative tw:flex tw:min-w-0 tw:overflow-hidden tw:flex-col tw:text-ink tw:[&>footer]:min-h-6.5 tw:[&>footer]:flex-none tw:[&>footer]:border tw:[&>footer]:border-solid tw:[&>footer]:border-[rgb(66_66_246/25%)] tw:[&>footer]:rounded-[0_0_4px_4px] tw:[&>footer]:text-[rgb(11_15_94/75%)] tw:[&>footer]:text-xs tw:[&>footer]:leading-4 tw:[&>footer]:pt-1 tw:[&>footer]:pb-1.5 tw:[&>footer]:px-3 tw:max-md:w-full tw:max-[360px]:[&_h3]:pr-2 tw:max-[360px]:[&_h3]:pl-2 tw:h-auto tw:[&.is-collapsed_.activity-dashboard-card\_\_toggle::before]:transform-[rotate(-90deg)] tw:max-md:[&.is-collapsed]:h-6! tw:max-md:[&.is-collapsed_>_:not(header)]:hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:overflow-hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:text-ellipsis tw:[&_.activity-dashboard-card\_\_row]:min-h-7`}
                        >
                            <header className="tw:flex tw:h-6 tw:min-w-0 tw:flex-[0_0_24px] tw:items-start tw:justify-between tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                <h3 className="tw:relative tw:z-1 tw:flex tw:h-6 tw:items-center tw:gap-1 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:border-b-white tw:bg-white tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:whitespace-nowrap tw:pt-1 tw:pb-0.5 tw:px-3 tw:mt-0 tw:-mb-px tw:mx-0 tw:before:hidden tw:before:w-4 tw:before:h-4 tw:before:flex-none tw:before:[background:var(--select-chevron)_center/12px_8px_no-repeat] tw:before:content-[''] tw:max-md:before:block">
                                    <button
                                        type="button"
                                        className="activity-dashboard-card__toggle tw:border-0 tw:bg-transparent tw:p-0 tw:text-inherit tw:font-inherit tw:uppercase tw:max-md:cursor-pointer tw:max-md:before:mr-1 tw:max-md:before:content-['⌄']"
                                        disabled={!mobile}
                                        aria-expanded={mobile ? expandedCard === "house" : undefined}
                                        aria-controls="activity-dashboard-content-house"
                                        onClick={() =>
                                            setExpandedCard(expandedCard === "house" ? null : "house")
                                        }
                                    >
                                        {"Por casa"}
                                    </button>
                                    <InfoPopover label="Saiba mais">
                                        <strong>Por casa</strong>
                                        <p>Conta cada proposição uma vez na casa em que foi apresentada.</p>
                                        <small>O Poder Executivo não entra neste recorte.</small>
                                    </InfoPopover>
                                </h3>
                            </header>
                            <div
                                id="activity-dashboard-content-house"
                                className="activity-dashboard-card__content tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)] tw:p-3 tw:pt-2 tw:pb-2 tw:gap-1 tw:last:border-b tw:last:border-solid tw:last:border-b-[rgb(66_66_246/25%)] tw:last:rounded-[0_0_4px_4px]"
                                data-dashboard-house
                            >
                                <DashboardRows rows={explorer?.dashboard.house ?? []} author={false} />
                            </div>
                            <footer>* 'Presidência' e demais casas especiais são omitidas</footer>
                        </article>
                        <article
                            className={String.raw`${expandedCard === "category" ? "is-expanded" : "is-collapsed"} activity-dashboard-card activity-dashboard-card--category tw:relative tw:flex tw:min-w-0 tw:overflow-hidden tw:flex-col tw:text-ink tw:[&>footer]:min-h-6.5 tw:[&>footer]:flex-none tw:[&>footer]:border tw:[&>footer]:border-solid tw:[&>footer]:border-[rgb(66_66_246/25%)] tw:[&>footer]:rounded-[0_0_4px_4px] tw:[&>footer]:text-[rgb(11_15_94/75%)] tw:[&>footer]:text-xs tw:[&>footer]:leading-4 tw:[&>footer]:pt-1 tw:[&>footer]:pb-1.5 tw:[&>footer]:px-3 tw:max-md:w-full tw:max-[360px]:[&_h3]:pr-2 tw:max-[360px]:[&_h3]:pl-2 tw:min-h-0 tw:flex-1 tw:max-md:h-102.5 tw:[&.is-collapsed_.activity-dashboard-card\_\_toggle::before]:transform-[rotate(-90deg)] tw:max-md:[&.is-collapsed]:h-6! tw:max-md:[&.is-collapsed_>_:not(header)]:hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:overflow-hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:text-ellipsis tw:max-[1400px]:min-[768px]:flex-[0_0_454px]`}
                        >
                            <header className="tw:flex tw:h-6 tw:min-w-0 tw:flex-[0_0_24px] tw:items-start tw:justify-between tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                <h3 className="tw:relative tw:z-1 tw:flex tw:h-6 tw:items-center tw:gap-1 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:border-b-white tw:bg-white tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:whitespace-nowrap tw:pt-1 tw:pb-0.5 tw:px-3 tw:mt-0 tw:-mb-px tw:mx-0 tw:before:hidden tw:before:w-4 tw:before:h-4 tw:before:flex-none tw:before:[background:var(--select-chevron)_center/12px_8px_no-repeat] tw:before:content-[''] tw:max-md:before:block">
                                    <button
                                        type="button"
                                        className="activity-dashboard-card__toggle tw:border-0 tw:bg-transparent tw:p-0 tw:text-inherit tw:font-inherit tw:uppercase tw:max-md:cursor-pointer tw:max-md:before:mr-1 tw:max-md:before:content-['⌄']"
                                        disabled={!mobile}
                                        aria-expanded={mobile ? expandedCard === "category" : undefined}
                                        aria-controls="activity-dashboard-content-category"
                                        onClick={() =>
                                            setExpandedCard(expandedCard === "category" ? null : "category")
                                        }
                                    >
                                        {"Por categoria"}
                                    </button>
                                    <InfoPopover label="Saiba mais">
                                        <strong>Por categoria</strong>
                                        <p>Conta cada proposição uma vez na sua categoria oficial.</p>
                                    </InfoPopover>
                                </h3>
                            </header>
                            <div
                                id="activity-dashboard-content-category"
                                className="activity-dashboard-card__content tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:gap-2 tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)] tw:p-3 tw:last:border-b tw:last:border-solid tw:last:border-b-[rgb(66_66_246/25%)] tw:last:rounded-[0_0_4px_4px]"
                            >
                                <div
                                    className={String.raw`activity-dashboard-card__scrollbox activity-dashboard-card__scroll activity-dashboard-card__empty tw:overflow-y-auto tw:[scrollbar-color:#aeb7ea_transparent] tw:scrollbar-thin tw:flex tw:min-w-0 tw:min-h-0 tw:flex-auto tw:flex-col tw:gap-2 tw:overflow-x-hidden tw:[&.activity-dashboard-card\_\_empty]:items-center tw:[&.activity-dashboard-card\_\_empty]:justify-center tw:[&.activity-dashboard-card\_\_empty]:text-[rgb(11_15_94/65%)] tw:[&.activity-dashboard-card\_\_empty]:text-sm tw:[&.activity-dashboard-card\_\_empty]:leading-5 tw:[&.activity-dashboard-card\_\_empty]:text-center tw:[&.activity-dashboard-card\_\_empty]:text-balance tw:[&.activity-dashboard-card\_\_empty]:p-6 tw:[&::-webkit-scrollbar]:w-1.5 tw:[&::-webkit-scrollbar-track]:bg-transparent tw:[&::-webkit-scrollbar-thumb]:rounded-[1000px] tw:[&::-webkit-scrollbar-thumb]:bg-[#aeb7ea] tw:[&::-webkit-scrollbar-thumb:hover]:bg-[#8f9cdd]`}
                                    data-dashboard-category
                                >
                                    <DashboardRows rows={explorer?.dashboard.category ?? []} author={false} />
                                </div>
                            </div>
                            <footer>Classificação editorial oficial (Categorias 2026)</footer>
                        </article>
                    </div>
                    <div className="activity-dashboard__column tw:flex tw:min-w-0 tw:h-188 tw:flex-col tw:gap-2 tw:max-md:contents tw:max-[1400px]:min-[768px]:h-auto">
                        <article
                            className={String.raw`${expandedCard === "state" ? "is-expanded" : "is-collapsed"} activity-dashboard-card activity-dashboard-card--state tw:relative tw:flex tw:min-w-0 tw:overflow-hidden tw:flex-col tw:text-ink tw:[&>footer]:min-h-6.5 tw:[&>footer]:flex-none tw:[&>footer]:border tw:[&>footer]:border-solid tw:[&>footer]:border-[rgb(66_66_246/25%)] tw:[&>footer]:rounded-[0_0_4px_4px] tw:[&>footer]:text-[rgb(11_15_94/75%)] tw:[&>footer]:text-xs tw:[&>footer]:leading-4 tw:[&>footer]:pt-1 tw:[&>footer]:pb-1.5 tw:[&>footer]:px-3 tw:max-md:w-full tw:max-[360px]:[&_h3]:pr-2 tw:max-[360px]:[&_h3]:pl-2 tw:h-104 tw:max-md:h-104 tw:[&.is-collapsed_.activity-dashboard-card\_\_toggle::before]:transform-[rotate(-90deg)] tw:max-md:[&.is-collapsed]:h-6! tw:max-md:[&.is-collapsed_>_:not(header)]:hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:overflow-hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:text-ellipsis`}
                        >
                            <header className="tw:flex tw:h-6 tw:min-w-0 tw:flex-[0_0_24px] tw:items-start tw:justify-between tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                <h3 className="tw:relative tw:z-1 tw:flex tw:h-6 tw:items-center tw:gap-1 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:border-b-white tw:bg-white tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:whitespace-nowrap tw:pt-1 tw:pb-0.5 tw:px-3 tw:mt-0 tw:-mb-px tw:mx-0 tw:before:hidden tw:before:w-4 tw:before:h-4 tw:before:flex-none tw:before:[background:var(--select-chevron)_center/12px_8px_no-repeat] tw:before:content-[''] tw:max-md:before:block">
                                    <button
                                        type="button"
                                        className="activity-dashboard-card__toggle tw:border-0 tw:bg-transparent tw:p-0 tw:text-inherit tw:font-inherit tw:uppercase tw:max-md:cursor-pointer tw:max-md:before:mr-1 tw:max-md:before:content-['⌄']"
                                        disabled={!mobile}
                                        aria-expanded={mobile ? expandedCard === "state" : undefined}
                                        aria-controls="activity-dashboard-content-state"
                                        onClick={() =>
                                            setExpandedCard(expandedCard === "state" ? null : "state")
                                        }
                                    >
                                        {"Por unidade federativa"}
                                    </button>
                                    <InfoPopover label="Saiba mais">
                                        <strong>Por unidade federativa</strong>
                                        <p>Considera a UF de cada parlamentar que assina a proposição.</p>
                                    </InfoPopover>
                                </h3>
                            </header>
                            <div
                                id="activity-dashboard-content-state"
                                className="activity-dashboard-map__pre-content tw:flex tw:h-15.5 tw:flex-[0_0_62px] tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-b tw:border-b-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)] tw:pt-4 tw:pb-2 tw:px-3"
                            >
                                <div className="activity-dashboard-map__legend tw:flex tw:w-39.5 tw:h-9.5 tw:flex-col tw:text-[rgb(11_15_94/75%)] tw:text-xs tw:leading-3 tw:[&>span]:h-3 tw:[&>span]:flex-[0_0_12px] tw:[&>img]:block tw:[&>img]:w-39.5 tw:[&>img]:h-2 tw:[&>img]:mt-1 tw:[&>img]:transform-[scaleX(-1)] tw:[&>img]:origin-center">
                                    <span>Proposições Favoráveis (%)</span>
                                    <Image src={mapLegend} loading="eager" alt="" aria-hidden="true" />
                                    <small className="tw:w-39.5 tw:h-3 tw:mt-1 tw:text-xs tw:leading-3 tw:flex tw:*:min-w-0 tw:*:flex-1 tw:*:grow">
                                        <span>90 ou +</span>
                                        <span className="tw:text-center">75%</span>
                                        <span className="tw:text-right">60 ou -</span>
                                    </small>
                                </div>
                            </div>
                            <div
                                className="activity-dashboard-map tw:relative tw:w-full tw:h-82.5 tw:min-h-82.5 tw:flex-[0_0_330px] tw:overflow-hidden tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-b tw:border-b-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)]"
                                data-dashboard-map
                            >
                                <div className="activity-dashboard-map__canvas tw:relative tw:w-82.5 tw:h-82.5 tw:**:data-map-base-image:absolute tw:**:data-map-base-image:z-0 tw:**:data-map-base-image:inset-0 tw:**:data-map-base-image:block tw:**:data-map-base-image:w-82.5 tw:**:data-map-base-image:h-82.5 tw:**:data-map-base-image:object-contain">
                                    <Image
                                        data-map-base-image
                                        src={mapBase}
                                        alt="Mapa do Brasil com siglas das 27 unidades federativas"
                                    />
                                    <div
                                        className="activity-dashboard-map__states tw:absolute tw:top-6 tw:left-5.5 tw:w-69.5 tw:h-73 tw:z-1 tw:mix-blend-multiply tw:pointer-events-none tw:[&_svg]:block tw:[&_svg]:w-full tw:[&_svg]:h-full tw:[&_svg]:overflow-visible tw:[&_svg]:pointer-events-none"
                                        data-map-state-layers
                                        aria-hidden="true"
                                    >
                                        <svg viewBox="0 0 277.7 291.685">
                                            {MAP_UF_CODES.map((uf) => (
                                                <path
                                                    key={uf}
                                                    d={mapPaths.get(uf)}
                                                    fill={
                                                        explorer?.dashboard.state.find(
                                                            (row) => row.key === uf,
                                                        )?.color ?? "transparent"
                                                    }
                                                />
                                            ))}
                                        </svg>
                                    </div>
                                    <svg
                                        className="activity-dashboard-map__hitboxes tw:absolute tw:top-6 tw:left-5.5 tw:w-69.5 tw:h-73 tw:z-2 tw:block tw:overflow-visible tw:pointer-events-none"
                                        data-map-hitboxes
                                        viewBox="0 0 277.7 291.685"
                                        role="group"
                                        aria-label="Unidades federativas interativas"
                                    >
                                        <defs>
                                            {MAP_UF_CODES.map((uf) => (
                                                <clipPath key={uf} id={`activity-hit-${uf}`}>
                                                    <path d={mapPaths.get(uf)} />
                                                </clipPath>
                                            ))}
                                        </defs>
                                        {MAP_UF_CODES.map((uf) => (
                                            <foreignObject
                                                key={uf}
                                                width="277.7"
                                                height="291.685"
                                                clipPath={`url(#activity-hit-${uf})`}
                                            >
                                                <button
                                                    type="button"
                                                    className="tw:block tw:size-full tw:border-0 tw:bg-transparent tw:p-0 tw:[pointer-events:all] tw:cursor-pointer tw:focus-visible:bg-[rgb(66_66_246/25%)]"
                                                    data-uf={uf}
                                                    aria-label={mapLabel(uf)}
                                                    onFocus={() => setActiveUf(uf)}
                                                    onBlur={() => setActiveUf(null)}
                                                    onMouseEnter={() => setActiveUf(uf)}
                                                    onMouseLeave={() => setActiveUf(null)}
                                                    onClick={() => setActiveUf(activeUf === uf ? null : uf)}
                                                    onKeyDown={(event) => {
                                                        if (event.key === "Escape") setActiveUf(null);
                                                    }}
                                                    aria-describedby="activity-map-tooltip"
                                                    aria-expanded={activeUf === uf}
                                                ></button>
                                            </foreignObject>
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        </article>
                        <article
                            className={String.raw`${expandedCard === "status" ? "is-expanded" : "is-collapsed"} activity-dashboard-card activity-dashboard-card--status tw:relative tw:flex tw:min-w-0 tw:overflow-hidden tw:flex-col tw:text-ink tw:[&>footer]:min-h-6.5 tw:[&>footer]:flex-none tw:[&>footer]:border tw:[&>footer]:border-solid tw:[&>footer]:border-[rgb(66_66_246/25%)] tw:[&>footer]:rounded-[0_0_4px_4px] tw:[&>footer]:text-[rgb(11_15_94/75%)] tw:[&>footer]:text-xs tw:[&>footer]:leading-4 tw:[&>footer]:pt-1 tw:[&>footer]:pb-1.5 tw:[&>footer]:px-3 tw:max-md:w-full tw:max-[360px]:[&_h3]:pr-2 tw:max-[360px]:[&_h3]:pl-2 tw:h-82.5 tw:max-md:h-85.5 tw:[&.is-collapsed_.activity-dashboard-card\_\_toggle::before]:transform-[rotate(-90deg)] tw:max-md:[&.is-collapsed]:h-6! tw:max-md:[&.is-collapsed_>_:not(header)]:hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:overflow-hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:text-ellipsis`}
                        >
                            <header className="tw:flex tw:h-6 tw:min-w-0 tw:flex-[0_0_24px] tw:items-start tw:justify-between tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                <h3 className="tw:relative tw:z-1 tw:flex tw:h-6 tw:items-center tw:gap-1 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:border-b-white tw:bg-white tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:whitespace-nowrap tw:pt-1 tw:pb-0.5 tw:px-3 tw:mt-0 tw:-mb-px tw:mx-0 tw:before:hidden tw:before:w-4 tw:before:h-4 tw:before:flex-none tw:before:[background:var(--select-chevron)_center/12px_8px_no-repeat] tw:before:content-[''] tw:max-md:before:block">
                                    <button
                                        type="button"
                                        className="activity-dashboard-card__toggle tw:border-0 tw:bg-transparent tw:p-0 tw:text-inherit tw:font-inherit tw:uppercase tw:max-md:cursor-pointer tw:max-md:before:mr-1 tw:max-md:before:content-['⌄']"
                                        disabled={!mobile}
                                        aria-expanded={mobile ? expandedCard === "status" : undefined}
                                        aria-controls="activity-dashboard-content-status"
                                        onClick={() =>
                                            setExpandedCard(expandedCard === "status" ? null : "status")
                                        }
                                    >
                                        {"Por status"}
                                    </button>
                                    <InfoPopover label="Saiba mais">
                                        <strong>Por status</strong>
                                        <p>
                                            Conta cada proposição uma vez pelo último status oficial
                                            disponível.
                                        </p>
                                        <small>Proposições sem status aparecem como “Não informado”.</small>
                                    </InfoPopover>
                                </h3>
                            </header>
                            <div
                                id="activity-dashboard-content-status"
                                className="activity-dashboard-card__content activity-dashboard-card__scroll tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:gap-2 tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)] tw:p-3 tw:overflow-y-auto tw:[scrollbar-color:#aeb7ea_transparent] tw:scrollbar-thin tw:last:border-b tw:last:border-solid tw:last:border-b-[rgb(66_66_246/25%)] tw:last:rounded-[0_0_4px_4px] tw:[&::-webkit-scrollbar]:w-1.5 tw:[&::-webkit-scrollbar-track]:bg-transparent tw:[&::-webkit-scrollbar-thumb]:rounded-[1000px] tw:[&::-webkit-scrollbar-thumb]:bg-[#aeb7ea] tw:[&::-webkit-scrollbar-thumb:hover]:bg-[#8f9cdd]"
                                data-dashboard-status
                            >
                                <DashboardRows rows={explorer?.dashboard.status ?? []} author={false} />
                            </div>
                            <footer>Usamos o último status oficial disponível</footer>
                        </article>
                    </div>
                    <div className="activity-dashboard__column tw:flex tw:min-w-0 tw:h-188 tw:flex-col tw:gap-2 tw:max-md:contents tw:max-[1400px]:min-[768px]:h-auto">
                        <article
                            className={String.raw`${expandedCard === "party" ? "is-expanded" : "is-collapsed"} activity-dashboard-card activity-dashboard-card--party tw:relative tw:flex tw:min-w-0 tw:overflow-hidden tw:flex-col tw:text-ink tw:[&>footer]:min-h-6.5 tw:[&>footer]:flex-none tw:[&>footer]:border tw:[&>footer]:border-solid tw:[&>footer]:border-[rgb(66_66_246/25%)] tw:[&>footer]:rounded-[0_0_4px_4px] tw:[&>footer]:text-[rgb(11_15_94/75%)] tw:[&>footer]:text-xs tw:[&>footer]:leading-4 tw:[&>footer]:pt-1 tw:[&>footer]:pb-1.5 tw:[&>footer]:px-3 tw:max-md:w-full tw:max-[360px]:[&_h3]:pr-2 tw:max-[360px]:[&_h3]:pl-2 tw:h-188 tw:max-md:h-105 tw:[&.is-collapsed_.activity-dashboard-card\_\_toggle::before]:transform-[rotate(-90deg)] tw:max-md:[&.is-collapsed]:h-6! tw:max-md:[&.is-collapsed_>_:not(header)]:hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:overflow-hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:text-ellipsis tw:max-[1400px]:min-[768px]:h-150`}
                        >
                            <header className="tw:flex tw:h-6 tw:min-w-0 tw:flex-[0_0_24px] tw:items-start tw:justify-between tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                <h3 className="tw:relative tw:z-1 tw:flex tw:h-6 tw:items-center tw:gap-1 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:border-b-white tw:bg-white tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:whitespace-nowrap tw:pt-1 tw:pb-0.5 tw:px-3 tw:mt-0 tw:-mb-px tw:mx-0 tw:before:hidden tw:before:w-4 tw:before:h-4 tw:before:flex-none tw:before:[background:var(--select-chevron)_center/12px_8px_no-repeat] tw:before:content-[''] tw:max-md:before:block">
                                    <button
                                        type="button"
                                        className="activity-dashboard-card__toggle tw:border-0 tw:bg-transparent tw:p-0 tw:text-inherit tw:font-inherit tw:uppercase tw:max-md:cursor-pointer tw:max-md:before:mr-1 tw:max-md:before:content-['⌄']"
                                        disabled={!mobile}
                                        aria-expanded={mobile ? expandedCard === "party" : undefined}
                                        aria-controls="activity-dashboard-content-party"
                                        onClick={() =>
                                            setExpandedCard(expandedCard === "party" ? null : "party")
                                        }
                                    >
                                        {"Por partido"}
                                    </button>
                                    <InfoPopover label="Saiba mais">
                                        <strong>Por partido</strong>
                                        <p>Considera as autorias únicas de cada proposição.</p>
                                        <small>Usamos o nome atual de partidos renomeados.</small>
                                    </InfoPopover>
                                </h3>
                                <div className="activity-dashboard-card__order tw:flex tw:min-w-0 tw:h-6 tw:flex-none tw:items-center tw:gap-1 tw:text-[rgb(11_15_94/55%)] tw:text-xs tw:leading-4 tw:whitespace-nowrap tw:max-md:min-w-0 tw:max-[360px]:text-[12px] tw:max-[360px]:gap-0.5 tw:max-md:[.activity-dashboard-card.is-collapsed_&]:hidden">
                                    <span>Ordem</span>

                                    <ActivitySelect
                                        name="party_sort"
                                        value={String(controls.party_sort ?? "")}
                                        onChange={(value) => change("party_sort", value)}
                                        label="Ordem por partido"
                                        options={dashboardSortOptions}
                                        compact
                                    />
                                </div>
                            </header>
                            <div
                                id="activity-dashboard-content-party"
                                className="activity-dashboard-card__content activity-dashboard-card__scroll tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:gap-2 tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)] tw:p-3 tw:overflow-y-auto tw:[scrollbar-color:#aeb7ea_transparent] tw:scrollbar-thin tw:last:border-b tw:last:border-solid tw:last:border-b-[rgb(66_66_246/25%)] tw:last:rounded-[0_0_4px_4px] tw:[&::-webkit-scrollbar]:w-1.5 tw:[&::-webkit-scrollbar-track]:bg-transparent tw:[&::-webkit-scrollbar-thumb]:rounded-[1000px] tw:[&::-webkit-scrollbar-thumb]:bg-[#aeb7ea] tw:[&::-webkit-scrollbar-thumb:hover]:bg-[#8f9cdd]"
                                data-dashboard-party
                            >
                                <DashboardRows rows={explorer?.dashboard.party ?? []} author={false} />
                            </div>
                            <footer>Usamos o nome atual de partidos renomeados</footer>
                        </article>
                    </div>
                    <div className="activity-dashboard__column tw:flex tw:min-w-0 tw:h-188 tw:flex-col tw:gap-2 tw:max-md:contents tw:max-[1400px]:min-[768px]:h-auto">
                        <article
                            className={String.raw`${expandedCard === "author" ? "is-expanded" : "is-collapsed"} activity-dashboard-card activity-dashboard-card--author tw:relative tw:flex tw:min-w-0 tw:overflow-hidden tw:flex-col tw:text-ink tw:[&>footer]:min-h-6.5 tw:[&>footer]:flex-none tw:[&>footer]:border tw:[&>footer]:border-solid tw:[&>footer]:border-[rgb(66_66_246/25%)] tw:[&>footer]:rounded-[0_0_4px_4px] tw:[&>footer]:text-[rgb(11_15_94/75%)] tw:[&>footer]:text-xs tw:[&>footer]:leading-4 tw:[&>footer]:pt-1 tw:[&>footer]:pb-1.5 tw:[&>footer]:px-3 tw:max-md:w-full tw:max-[360px]:[&_h3]:pr-2 tw:max-[360px]:[&_h3]:pl-2 tw:h-188 tw:max-md:h-105 tw:[&.is-collapsed_.activity-dashboard-card\_\_toggle::before]:transform-[rotate(-90deg)] tw:max-md:[&.is-collapsed]:h-6! tw:max-md:[&.is-collapsed_>_:not(header)]:hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:overflow-hidden tw:max-md:[&.is-collapsed_.activity-dashboard-card\_\_toggle]:text-ellipsis tw:[&_.activity-dashboard-card\_\_row]:min-h-8 tw:[&_.activity-dashboard-card\_\_key]:wrap-normal tw:max-[1400px]:min-[768px]:h-150`}
                        >
                            <header className="tw:flex tw:h-6 tw:min-w-0 tw:flex-[0_0_24px] tw:items-start tw:justify-between tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                <div className="activity-dashboard-card__title tw:flex tw:min-w-0 tw:h-6 tw:items-start tw:max-md:[.activity-dashboard-card.is-collapsed_&]:min-w-0">
                                    <h3 className="tw:relative tw:z-1 tw:flex tw:h-6 tw:items-center tw:gap-1 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:border-b-white tw:bg-white tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:whitespace-nowrap tw:pt-1 tw:pb-0.5 tw:px-3 tw:mt-0 tw:-mb-px tw:mx-0 tw:before:hidden tw:before:w-4 tw:before:h-4 tw:before:flex-none tw:before:[background:var(--select-chevron)_center/12px_8px_no-repeat] tw:before:content-[''] tw:max-md:before:block">
                                        <button
                                            type="button"
                                            className="activity-dashboard-card__toggle tw:border-0 tw:bg-transparent tw:p-0 tw:text-inherit tw:font-inherit tw:uppercase tw:max-md:cursor-pointer tw:max-md:before:mr-1 tw:max-md:before:content-['⌄']"
                                            disabled={!mobile}
                                            aria-expanded={mobile ? expandedCard === "author" : undefined}
                                            aria-controls="activity-dashboard-content-author"
                                            onClick={() =>
                                                setExpandedCard(expandedCard === "author" ? null : "author")
                                            }
                                        >
                                            {"Por autoria"}
                                        </button>
                                        <InfoPopover label="Saiba mais">
                                            <strong>Por autoria</strong>
                                            <p>
                                                Mostra parlamentares com {MIN_PROPOSICOES_POR_PARLAMENTAR} ou
                                                mais proposições relacionadas a gênero.
                                            </p>
                                            <small>Inclui autorias institucionais.</small>
                                        </InfoPopover>
                                    </h3>
                                </div>
                                <div className="activity-dashboard-card__order tw:flex tw:min-w-0 tw:h-6 tw:flex-none tw:items-center tw:gap-1 tw:text-[rgb(11_15_94/55%)] tw:text-xs tw:leading-4 tw:whitespace-nowrap tw:max-md:min-w-0 tw:max-[360px]:text-[12px] tw:max-[360px]:gap-0.5 tw:max-md:[.activity-dashboard-card.is-collapsed_&]:hidden">
                                    <span>Ordem</span>

                                    <ActivitySelect
                                        name="author_sort"
                                        value={String(controls.author_sort ?? "")}
                                        onChange={(value) => change("author_sort", value)}
                                        label="Ordem por autoria"
                                        options={dashboardSortOptions}
                                        compact
                                    />
                                </div>
                            </header>
                            <div className="activity-dashboard-card__author-filter tw:flex tw:min-h-7 tw:flex-none tw:items-center tw:justify-between tw:gap-2 tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)] tw:text-[rgb(11_15_94/55%)] tw:text-xs tw:leading-4 tw:py-1 tw:px-3 tw:[&_.activity-select]:w-37.5">
                                <span>Ver Parlamentares</span>

                                <ActivitySelect
                                    name="author_minimum"
                                    value={String(controls.author_minimum ?? "")}
                                    onChange={(value) => change("author_minimum", value)}
                                    label="Mínimo de proposições por parlamentar"
                                    options={authorMinimumOptions}
                                    compact
                                />
                            </div>
                            <div
                                id="activity-dashboard-content-author"
                                className="activity-dashboard-card__content activity-dashboard-card__scroll tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:gap-2 tw:border-r tw:border-solid tw:border-r-[rgb(66_66_246/25%)] tw:border-l tw:border-l-[rgb(66_66_246/25%)] tw:p-3 tw:overflow-y-auto tw:[scrollbar-color:#aeb7ea_transparent] tw:scrollbar-thin tw:pr-3 tw:pl-3 tw:last:border-b tw:last:border-solid tw:last:border-b-[rgb(66_66_246/25%)] tw:last:rounded-[0_0_4px_4px] tw:[&::-webkit-scrollbar]:w-1.5 tw:[&::-webkit-scrollbar-track]:bg-transparent tw:[&::-webkit-scrollbar-thumb]:rounded-[1000px] tw:[&::-webkit-scrollbar-thumb]:bg-[#aeb7ea] tw:[&::-webkit-scrollbar-thumb:hover]:bg-[#8f9cdd]"
                                data-dashboard-author
                            >
                                <DashboardRows rows={explorer?.dashboard.author ?? []} author={true} />
                            </div>
                            <footer>Inclui autorias institucionais, como “Presidência”, etc.</footer>
                        </article>
                    </div>
                </div>
                <div
                    className="activity-tooltip-layer tw:fixed tw:z-110 tw:inset-0 tw:pointer-events-none"
                    aria-live="polite"
                ></div>
                <div
                    className="activity-map-tooltip tw:sticky tw:bottom-4 tw:left-4 tw:z-111 tw:flex tw:w-48 tw:max-w-[calc(100vw-16px)] tw:items-center tw:flex-col tw:text-white tw:pointer-events-none tw:[&_strong]:overflow-hidden tw:[&_strong]:text-white tw:[&_strong]:font-display tw:[&_strong]:text-sm tw:[&_strong]:font-bold tw:[&_strong]:[font-variation-settings:'wdth'_75] tw:[&_strong]:leading-4 tw:[&_strong]:text-left tw:[&_strong]:no-underline tw:[&_strong]:text-ellipsis tw:[&_strong]:uppercase tw:[&_strong]:whitespace-nowrap tw:[&_p]:text-white tw:[&_p]:text-sm tw:[&_p]:font-normal tw:[&_p]:leading-4 tw:[&_p]:m-0 tw:[&_small]:text-[rgb(255_255_255/75%)] tw:[&_small]:text-xs tw:[&_small]:font-normal tw:[&_small]:leading-3 tw:[&>img]:w-4 tw:[&>img]:h-2 tw:[&>img]:self-start tw:[&>img]:ml-(--tooltip-tip-offset,12px) tw:[[hidden]]:hidden"
                    data-map-tooltip
                    id="activity-map-tooltip"
                    role="tooltip"
                    hidden={!activeUf}
                >
                    <div className="tw:flex tw:w-full tw:flex-col tw:gap-1.5 tw:bg-ink tw:p-3">
                        <strong data-map-tooltip-title>{activeUf}</strong>
                        <p data-map-tooltip-summary>{activeUf ? mapLabel(activeUf) : ""}</p>
                        <small data-map-tooltip-details></small>
                    </div>
                    <Image src={tooltipTip} alt="" />
                </div>
            </section>

            <div
                className="activity-dashboard-mobile-heading tw:hidden tw:max-md:block tw:max-md:w-[calc(100%-32px)] tw:max-md:border-b-4 tw:max-md:border-solid tw:max-md:border-b-accent tw:max-md:text-accent tw:max-md:font-display tw:max-md:text-base tw:max-md:font-bold tw:max-md:[font-variation-settings:'wdth'_75] tw:max-md:leading-6 tw:max-md:uppercase tw:max-md:py-2 tw:max-md:px-0 tw:max-md:mt-0 tw:max-md:mb-2 tw:max-md:mx-4"
                aria-hidden="true"
            >
                Proposições
            </div>

            <div className="activity-results" data-results hidden={!ready || !explorer?.items.length}>
                <div className="activity-table-wrap tw:w-full tw:overflow-x-auto tw:pt-6 tw:pb-0 tw:px-9.5 tw:max-md:hidden tw:max-[1101px]:pr-5 tw:max-[1101px]:pl-5 tw:max-[1400px]:min-[768px]:pr-5 tw:max-[1400px]:min-[768px]:pl-5">
                    <table className="activity-table tw:w-full tw:border-collapse tw:table-fixed tw:[&_th[aria-sort='descending']_button::after]:bg-(image:--sort-down) tw:[&_th[aria-sort='ascending']_button::after]:bg-(image:--sort-up) tw:[&_td]:min-h-16 tw:[&_td]:border-b tw:[&_td]:border-solid tw:[&_td]:border-b-[rgb(66_66_246/25%)] tw:[&_td]:align-top tw:[&_td]:text-sm tw:[&_td]:leading-4 tw:[&_td]:p-2 tw:[&_td_>_a:first-child]:text-accent tw:[&_td_>_a:first-child]:font-display tw:[&_td_>_a:first-child]:text-base tw:[&_td_>_a:first-child]:font-bold tw:[&_td_>_a:first-child]:[font-variation-settings:'wdth'_75] tw:[&_td_>_a:first-child]:leading-6 tw:[&_td_>_a:first-child]:no-underline tw:[&_td_>_a:first-child]:uppercase tw:[&_td_>_small]:block tw:[&_td_>_small]:mt-1 tw:[&_td_>_small]:text-[rgb(11_15_94/65%)] tw:[&_td_>_small]:text-xs tw:[&_td_>_small]:leading-4 tw:[&_td:nth-child(6)_small]:block tw:[&_td:nth-child(6)_small]:mt-1 tw:[&_td:nth-child(6)_small]:text-[rgb(11_15_94/65%)] tw:[&_td:nth-child(6)_small]:text-xs tw:[&_td:nth-child(6)_small]:leading-4 tw:[&_td:nth-child(3)_p]:line-clamp-3 tw:[&_td:nth-child(3)_p]:m-0 tw:min-w-336 tw:[&_th]:h-8.5 tw:[&_th]:border-b tw:[&_th]:border-solid tw:[&_th]:border-b-accent tw:[&_th]:text-ink tw:[&_th]:text-sm tw:[&_th]:font-normal tw:[&_th]:leading-4 tw:[&_th]:text-left tw:[&_th]:p-0 tw:[&_th_button]:flex tw:[&_th_button]:w-full tw:[&_th_button]:min-h-8 tw:[&_th_button]:items-center tw:[&_th_button]:gap-1 tw:[&_th_button]:border-0 tw:[&_th_button]:[background:none] tw:[&_th_button]:text-inherit tw:[&_th_button]:[font:inherit] tw:[&_th_button]:text-left tw:[&_th_button]:cursor-pointer tw:[&_th_button]:p-2 tw:[&_th:nth-child(1)]:w-32 tw:[&_th:nth-child(2)]:w-48 tw:[&_th:nth-child(3)]:w-68 tw:[&_th:nth-child(4)]:w-36 tw:[&_th:nth-child(5)]:w-44 tw:[&_th:nth-child(6)]:w-32 tw:[&_th:nth-child(7)]:w-34 tw:[&_th:nth-child(8)]:w-28">
                        <thead>
                            <tr>
                                <th className="tw:h-8.5 tw:border-b tw:border-solid tw:border-b-accent tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:text-left tw:w-32 tw:p-0">
                                    <button
                                        className="tw:flex tw:w-full tw:min-h-8 tw:items-center tw:gap-1 tw:border-0 tw:[background:none] tw:text-inherit tw:text-left tw:cursor-pointer tw:p-2 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:after:w-2 tw:after:h-2 tw:after:[background:var(--select-chevron)_center/contain_no-repeat] tw:after:opacity-35 tw:after:content-['']"
                                        type="button"
                                        data-table-sort="number"
                                        onClick={() => sortBy("number")}
                                    >
                                        Proposição
                                    </button>
                                </th>
                                <th
                                    aria-sort={sort === "author" ? direction : undefined}
                                    className="tw:h-8.5 tw:border-b tw:border-solid tw:border-b-accent tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:text-left tw:w-48 tw:p-0"
                                >
                                    <button
                                        className="tw:flex tw:w-full tw:min-h-8 tw:items-center tw:gap-1 tw:border-0 tw:[background:none] tw:text-inherit tw:text-left tw:cursor-pointer tw:p-2 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:after:w-2 tw:after:h-2 tw:after:[background:var(--select-chevron)_center/contain_no-repeat] tw:after:opacity-35 tw:after:content-['']"
                                        type="button"
                                        data-table-sort="author"
                                        onClick={() => sortBy("author")}
                                    >
                                        Autoria
                                    </button>
                                </th>
                                <th
                                    aria-sort={sort === "summary" ? direction : undefined}
                                    className="tw:h-8.5 tw:border-b tw:border-solid tw:border-b-accent tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:text-left tw:w-68 tw:p-0"
                                >
                                    <button
                                        className="tw:flex tw:w-full tw:min-h-8 tw:items-center tw:gap-1 tw:border-0 tw:[background:none] tw:text-inherit tw:text-left tw:cursor-pointer tw:p-2 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:after:w-2 tw:after:h-2 tw:after:[background:var(--select-chevron)_center/contain_no-repeat] tw:after:opacity-35 tw:after:content-['']"
                                        type="button"
                                        data-table-sort="summary"
                                        onClick={() => sortBy("summary")}
                                    >
                                        Ementa
                                    </button>
                                </th>
                                <th
                                    aria-sort={sort === "assessment" ? direction : undefined}
                                    className="tw:h-8.5 tw:border-b tw:border-solid tw:border-b-accent tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:text-left tw:w-36 tw:p-0"
                                >
                                    <button
                                        className="tw:flex tw:w-full tw:min-h-8 tw:items-center tw:gap-1 tw:border-0 tw:[background:none] tw:text-inherit tw:text-left tw:cursor-pointer tw:p-2 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:after:w-2 tw:after:h-2 tw:after:[background:var(--select-chevron)_center/contain_no-repeat] tw:after:opacity-35 tw:after:content-['']"
                                        type="button"
                                        data-table-sort="assessment"
                                        onClick={() => sortBy("assessment")}
                                    >
                                        Avaliação
                                    </button>
                                </th>
                                <th
                                    aria-sort={sort === "evaluator" ? direction : undefined}
                                    className="tw:h-8.5 tw:border-b tw:border-solid tw:border-b-accent tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:text-left tw:w-44 tw:p-0"
                                >
                                    <button
                                        className="tw:flex tw:w-full tw:min-h-8 tw:items-center tw:gap-1 tw:border-0 tw:[background:none] tw:text-inherit tw:text-left tw:cursor-pointer tw:p-2 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:after:w-2 tw:after:h-2 tw:after:[background:var(--select-chevron)_center/contain_no-repeat] tw:after:opacity-35 tw:after:content-['']"
                                        type="button"
                                        data-table-sort="evaluator"
                                        onClick={() => sortBy("evaluator")}
                                    >
                                        Quem avaliou?
                                    </button>
                                </th>
                                <th
                                    aria-sort={sort === "progress" ? direction : undefined}
                                    className="tw:h-8.5 tw:border-b tw:border-solid tw:border-b-accent tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:text-left tw:w-32 tw:p-0"
                                >
                                    <button
                                        className="tw:flex tw:w-full tw:min-h-8 tw:items-center tw:gap-1 tw:border-0 tw:[background:none] tw:text-inherit tw:text-left tw:cursor-pointer tw:p-2 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:after:w-2 tw:after:h-2 tw:after:[background:var(--select-chevron)_center/contain_no-repeat] tw:after:opacity-35 tw:after:content-['']"
                                        type="button"
                                        data-table-sort="progress"
                                        onClick={() => sortBy("progress")}
                                    >
                                        Como está?
                                    </button>
                                </th>
                                <th
                                    aria-sort={sort === "category" ? direction : undefined}
                                    className="tw:h-8.5 tw:border-b tw:border-solid tw:border-b-accent tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:text-left tw:w-34 tw:p-0"
                                >
                                    <button
                                        className="tw:flex tw:w-full tw:min-h-8 tw:items-center tw:gap-1 tw:border-0 tw:[background:none] tw:text-inherit tw:text-left tw:cursor-pointer tw:p-2 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:after:w-2 tw:after:h-2 tw:after:[background:var(--select-chevron)_center/contain_no-repeat] tw:after:opacity-35 tw:after:content-['']"
                                        type="button"
                                        data-table-sort="category"
                                        onClick={() => sortBy("category")}
                                    >
                                        Categoria
                                    </button>
                                </th>
                                <th
                                    aria-sort={sort === "updated" ? direction : undefined}
                                    className="tw:h-8.5 tw:border-b tw:border-solid tw:border-b-accent tw:text-ink tw:text-sm tw:font-normal tw:leading-4 tw:text-left tw:w-28 tw:p-0"
                                >
                                    <button
                                        className="tw:flex tw:w-full tw:min-h-8 tw:items-center tw:gap-1 tw:border-0 tw:[background:none] tw:text-inherit tw:text-left tw:cursor-pointer tw:p-2 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1 tw:after:w-2 tw:after:h-2 tw:after:[background:var(--select-chevron)_center/contain_no-repeat] tw:after:opacity-35 tw:after:content-[''] tw:[.activity-table_th_button&::after]:opacity-100 tw:[.author-table_th_button&::after]:opacity-100"
                                        type="button"
                                        data-table-sort="updated"
                                        onClick={() => sortBy("updated")}
                                    >
                                        Atualização
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody data-table-body>
                            {explorer?.items.map((item) => (
                                <PropositionRow key={item.id} item={item} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div
                    className="activity-cards tw:hidden tw:max-md:flex tw:max-md:flex-col tw:max-md:gap-0 tw:max-md:py-0 tw:max-md:px-4"
                    data-cards
                >
                    {explorer?.items.map((item) => (
                        <PropositionCard key={item.id} item={item} />
                    ))}
                </div>
            </div>

            <div
                className="activity-empty tw:[&_button]:border-0 tw:[&_button]:[background:none] tw:[&_button]:text-accent tw:[&_button]:text-sm tw:[&_button]:font-normal tw:[&_button]:leading-4 tw:[&_button]:cursor-pointer tw:[&_button]:p-0 tw:min-h-65 tw:border tw:border-dashed tw:border-[rgb(66_66_246/35%)] tw:text-center tw:p-12 tw:my-6 tw:mx-12 tw:[&_strong]:text-lg tw:[&_strong]:leading-6 tw:[&_p]:mt-2 tw:[&_p]:mb-4 tw:[&_p]:mx-0 tw:max-md:min-h-60 tw:max-md:py-12 tw:max-md:px-5 tw:max-md:my-6 tw:max-md:mx-4 tw:[[hidden]]:hidden"
                data-empty
                hidden={!ready || !!explorer?.items.length}
            >
                <strong>Será que sua busca foi muito específica?</strong>
                <p>Tente remover os filtros para encontrar outras proposições.</p>
                <button
                    className="tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1"
                    type="button"
                    onClick={reset}
                    data-clear-filters
                >
                    Remover filtros
                </button>
            </div>

            <nav
                className={String.raw`activity-pagination tw:flex tw:min-h-27 tw:items-start tw:justify-between tw:py-6 tw:px-12 tw:max-md:min-h-27 tw:max-md:gap-3 tw:max-md:py-6 tw:max-md:px-4 tw:[&_>_div_>_span:last-child]:flex tw:[&_>_div_>_span:last-child]:items-center tw:[&_>_div_>_span:last-child]:gap-1 tw:[&_button:not(.activity-select\_\_trigger)]:min-w-9 tw:[&_button:not(.activity-select\_\_trigger)]:h-9 tw:[&_button:not(.activity-select\_\_trigger)]:border-2 tw:[&_button:not(.activity-select\_\_trigger)]:border-solid tw:[&_button:not(.activity-select\_\_trigger)]:border-transparent tw:[&_button:not(.activity-select\_\_trigger)]:bg-white tw:[&_button:not(.activity-select\_\_trigger)]:text-transparent tw:[&_button:not(.activity-select\_\_trigger)]:font-bold tw:[&_button:not(.activity-select\_\_trigger)]:cursor-pointer tw:[&_button:not(.activity-select\_\_trigger)]:bg-center tw:[&_button:not(.activity-select\_\_trigger)]:bg-no-repeat tw:[&_button:not(.activity-select\_\_trigger)]:bg-size-[24px_16px] tw:[&_button:not(.activity-select\_\_trigger):first-child]:bg-(image:--arrow-back) tw:[&_button:not(.activity-select\_\_trigger):last-child]:bg-(image:--arrow-forward) tw:[&_button:not(.activity-select\_\_trigger):hover]:border-accent tw:[&_button:not(.activity-select\_\_trigger).is-current]:border-accent tw:[&_button:not(.activity-select\_\_trigger):disabled]:cursor-not-allowed tw:[&_button:not(.activity-select\_\_trigger):disabled]:opacity-25 tw:[&_.activity-select]:w-36 tw:max-md:[&_button:not(.activity-select\_\_trigger)]:min-w-9 tw:max-md:[&_button:not(.activity-select\_\_trigger)]:py-0 tw:max-md:[&_button:not(.activity-select\_\_trigger)]:px-1 tw:max-md:[&_.activity-select]:w-36 tw:max-[1400px]:min-[768px]:p-6 tw:[&_button:not(.activity-select\_\_trigger)]:flex tw:[&_button:not(.activity-select\_\_trigger)]:items-center tw:[&_button:not(.activity-select\_\_trigger)]:justify-center`}
                data-pagination
                aria-label="Paginação dos resultados"
                hidden={!ready || !explorer?.items.length || explorer.page_count <= 1}
            >
                <div
                    className="tw:flex tw:flex-col tw:items-start tw:gap-2 tw:max-md:w-34.5 tw:max-md:gap-2"
                    data-pages
                >
                    <span>
                        Página {explorer?.page} de {explorer?.page_count}
                    </span>
                    <span>
                        <button
                            type="button"
                            aria-label="Página anterior"
                            disabled={!explorer || explorer.page <= 1}
                            onClick={() => changePage(-1)}
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            aria-label="Próxima página"
                            disabled={!explorer || explorer.page >= explorer.page_count}
                            onClick={() => changePage(1)}
                        >
                            ›
                        </button>
                    </span>
                </div>
                <div className="activity-pagination__page-size tw:flex tw:w-36 tw:items-start tw:flex-col tw:gap-2 tw:text-sm tw:font-normal tw:leading-4 tw:max-md:w-36 tw:max-md:flex-col tw:max-md:items-start tw:max-md:text-sm tw:max-md:gap-2">
                    <span>Itens por página</span>

                    <ActivitySelect
                        name="items"
                        value={String(controls.items ?? "")}
                        onChange={(value) => change("items", value)}
                        label="Itens por página"
                        options={[5, 10, 20, 50].map((value) => ({
                            value: String(value),
                            label: String(value),
                        }))}
                    />
                </div>
            </nav>
        </section>
    );
}
