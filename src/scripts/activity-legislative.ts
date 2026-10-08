type RawParliamentarian = {
    nome: string;
    numero: number;
    foto?: string;
    partido?: string;
    estado?: string;
};

type Proposal = {
    i: number;
    casa: string;
    numero: string;
    link?: string;
    comentario?: string | null;
    resumo: string;
    avaliador?: string | null;
    favoravel: number;
    categoria?: string | null;
    categoriaLabel?: string | null;
    apresentadaEm?: string | null;
    authors: RawParliamentarian[];
    celerity: ActivityProposition["celerity"];
};
type TableSort = "number" | "author" | "summary" | "assessment" | "evaluator" | "progress" | "category" | "updated";

import { DEFAULT_DASHBOARD_ORDER, MIN_PROPOSICOES_POR_PARLAMENTAR, MAP_UF_CODES, MOBILE_ITEMS_PER_PAGE } from "../lib/dashboard-utils";
import { authorRoute } from "../lib/author-page";
import { propositionRoute } from "../lib/proposition-utils";
import { formatPresentedDate } from "../lib/canonical";
import { PUBLIC_API_BASE_URL } from "astro:env/client";
import type { ActivityProposition, ActivityExplorerResponse, ActivityDashboardRow as DashboardRow } from "../lib/activity-api";
import { activityAssessment, type ActivityFilterState as BaseActivityFilterState } from "../lib/activity-filters";
import { YEAR_RANGE_CHANGE_EVENT, syncActivityYearRange, type ActivityYearRange } from "../lib/activity-year-range";
import { ACTIVITY_MULTI_FILTERS, MULTI_FILTER_CHANGE_EVENT, readActivityMultiValues, syncActivityMultiFilters, type ActivityMultiFilterName } from "../lib/activity-multiselect";
import { ACTIVITY_SINGLE_FILTERS, activitySelectInput, SELECT_CHANGE_EVENT, syncActivitySelects } from "../lib/activity-select";

type ActivityFilterState = Omit<BaseActivityFilterState, "year" | ActivityMultiFilterName>
    & Record<ActivityMultiFilterName, string[]>
    & { year_start: string; year_end: string };

const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const formatNumber = new Intl.NumberFormat("pt-BR");
function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function initActivity(root: HTMLElement) {
    if (root.dataset.initialized) return;
    root.dataset.initialized = "true";

    const $ = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
    const $$ = <T extends Element = HTMLElement>(selector: string) => [...root.querySelectorAll<T>(selector)];
    const filters = $("[data-filters]") as HTMLFormElement;
    const status = $("[data-status]");
    const tableBody = $("[data-table-body]");
    const cards = $("[data-cards]");
    const empty = $("[data-empty]");
    const pagination = $("[data-pagination]");
    const dashboard = $("[data-dashboard]");
    const mapVisualPaths = new Map<string, SVGPathElement>();
    const mapHitAreas = new Map<string, SVGUseElement>();
    for (const uf of MAP_UF_CODES) {
        const visualPath = root.querySelector<SVGPathElement>(`[data-map-state-layers] #${uf}`);
        const hitArea = root.querySelector<SVGUseElement>(`[data-map-hitboxes] [data-uf="${uf}"]`);
        if (visualPath) {
            visualPath.dataset.uf = uf;
            mapVisualPaths.set(uf, visualPath);
        }
        if (hitArea) mapHitAreas.set(uf, hitArea);
    }
    const filterPanel = $("[data-filter-panel]");
    const backdrop = $("[data-backdrop]");
    const itemsSelect = $("[data-items-per-page]") as HTMLInputElement;

    let visible: Proposal[] = [];
    let page = 1;
    let tableSort: TableSort = "updated";
    let tableSortDirection: "ascending" | "descending" = "descending";
    let panelAdvanced = false;
    let panelSnapshot: Map<string, string> | null = null;
    let lastFocused: HTMLElement | null = null;
    let stateDashboard = new Map<string, DashboardRow>();
    let explorer: ActivityExplorerResponse | null = null;
    let requestController: AbortController | null = null;
    let mobileAccordionsReady = false;
    let mobileViewport = window.matchMedia("(max-width: 767px)");
    let resultsRenderVersion = 0;

    function syncResponsivePageSize(render = false) {
        if (!itemsSelect.dataset.userSelected && mobileViewport.matches && itemsSelect.value !== String(MOBILE_ITEMS_PER_PAGE)) {
            itemsSelect.value = String(MOBILE_ITEMS_PER_PAGE);
            syncActivitySelects(root);
            if (render && visible.length) {
                page = 1;
                void load();
            }
        }
    }

    const field = (name: string) => filters.elements.namedItem(name) as HTMLInputElement | null;
    const value = (name: string) => field(name)?.value ?? "";
    const panelControls = () => [...filters.querySelectorAll<HTMLInputElement>("input[name]")];
    const currentFilters = (): ActivityFilterState => ({
        search: value("search"),
        house: value("house"),
        year_start: value("year_start"),
        year_end: value("year_end"),
        party: readActivityMultiValues(root, "party"),
        category: readActivityMultiValues(root, "category"),
        assessment: value("assessment") as ActivityFilterState["assessment"],
        celerity: readActivityMultiValues(root, "celerity"),
        movements: value("movements") as ActivityFilterState["movements"],
        gender: value("gender"),
        state: readActivityMultiValues(root, "state"),
        religion: readActivityMultiValues(root, "religion"),
        comments: value("comments"),
        evaluator: readActivityMultiValues(root, "evaluator"),
    });

    let appliedFilters = currentFilters();

    function setupMobileAccordions() {
        if (mobileAccordionsReady || !window.matchMedia("(max-width: 767px)").matches) return;
        mobileAccordionsReady = true;
        const cards = $$<HTMLElement>(".activity-dashboard-card");
        cards.forEach((card, index) => {
            const heading = card.querySelector<HTMLElement>("h3");
            const content = card.querySelector<HTMLElement>(".activity-dashboard-card__content, .activity-dashboard-map");
            const header = card.querySelector<HTMLElement>(":scope > header");
            if (!heading || !content || !header) return;
            const id = `activity-dashboard-panel-${index}`;
            content.id = content.id || id;
            const toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "activity-dashboard-card__toggle tw:relative tw:z-1 tw:flex tw:h-[24px] tw:items-center tw:gap-1 tw:border tw:border-solid tw:border-[rgb(66_66_246_/_25%)] tw:[border-bottom-color:#fff] tw:bg-white tw:text-ink tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:text-left tw:uppercase tw:whitespace-nowrap tw:cursor-pointer tw:pt-1 tw:pb-0.5 tw:px-3 tw:mt-0 tw:mb-[-1px] tw:mx-0 tw:before:hidden tw:before:w-4 tw:before:h-4 tw:before:flex-none tw:before:[background:var(--select-chevron)_center_/_12px_8px_no-repeat] tw:before:content-[''] tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:outline-offset-1 tw:max-md:w-fit tw:max-md:max-w-full tw:max-md:before:block";
            toggle.setAttribute("aria-controls", content.id);
            const info = heading.querySelector<HTMLElement>("[data-dashboard-tooltip-trigger]");
            [...heading.childNodes].forEach((node) => {
                if (node !== info) toggle.append(node);
            });
            heading.replaceWith(toggle);
            if (info) header.append(info);
            const open = card.classList.contains("activity-dashboard-card--house");
            const setOpen = (next: boolean) => {
                card.classList.toggle("is-expanded", next);
                card.classList.toggle("is-collapsed", !next);
                toggle.setAttribute("aria-expanded", String(next));
            };
            setOpen(open);
            toggle.addEventListener("click", () => {
                const next = !card.classList.contains("is-expanded");
                if (next) cards.forEach((other) => {
                    if (other === card) return;
                    other.classList.remove("is-expanded");
                    other.classList.add("is-collapsed");
                    other.querySelector<HTMLElement>(".activity-dashboard-card__toggle")?.setAttribute("aria-expanded", "false");
                });
                setOpen(next);
            });
        });
    }

    function hydrateOptions(options: ActivityExplorerResponse["options"]) {
        root.dataset.multiFilterOptions = JSON.stringify(options);
        syncActivityMultiFilters(root);
        root.dataset.yearOptions = JSON.stringify(options.year);
        syncActivityYearRange(root);
    }

    function displayProposal(proposal: ActivityProposition): Proposal {
        return {
            i: proposal.id,
            casa: proposal.house,
            numero: proposal.number_label,
            link: proposal.tramitation_url || undefined,
            comentario: proposal.assessment_comments,
            resumo: proposal.ementa,
            avaliador: proposal.assessment_organization,
            favoravel: proposal.is_favorable === true ? 1 : proposal.is_favorable === false ? -1 : 0,
            categoria: proposal.category,
            categoriaLabel: proposal.category_label,
            celerity: proposal.celerity,
            apresentadaEm: proposal.presented_at,
            authors: proposal.authors.map((author) => ({
                nome: author.name,
                numero: author.id ?? 0,
                foto: author.photo_url || undefined,
                partido: author.party || undefined,
                estado: author.state || undefined,
            })),
        };
    }

    function queryParams() {
        const params = new URLSearchParams();
        for (const [name, selected] of Object.entries(appliedFilters)) {
            if (Array.isArray(selected)) selected.forEach((value) => params.append(name, value));
            else if (selected) params.set(name, selected);
        }
        params.set("page", String(page));
        params.set("page_size", itemsSelect.value);
        params.set("sort", tableSort);
        params.set("direction", tableSortDirection);
        params.set("party_sort", $<HTMLInputElement>('[data-dashboard-sort="party"]').value);
        params.set("author_sort", $<HTMLInputElement>('[data-dashboard-sort="author"]').value);
        params.set("author_minimum", $<HTMLInputElement>("[data-dashboard-author-filter]").value);
        return params;
    }

    function apiBase() {
        return (["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)
            ? `${location.origin}/api/v1`
            : PUBLIC_API_BASE_URL).replace(/\/$/, "");
    }

    function stanceData(item: Proposal) {
        if (activityAssessment(item.favoravel) === "unrated") return { label: "Sem avaliação", className: "neutral", icon: "" };
        return activityAssessment(item.favoravel) === "favorable"
            ? { label: "Favorável", className: "favorable", icon: root.dataset.thumbsUp || "" }
            : { label: "Desfavorável", className: "unfavorable", icon: root.dataset.thumbsDown || "" };
    }

    function createStance(item: Proposal) {
        const data = stanceData(item);
        const wrap = document.createElement("span");
        wrap.className = `activity-stance tw:flex tw:items-center tw:gap-1 tw:text-sm tw:leading-4 tw:[&_img]:w-6 tw:[&_img]:h-6 activity-stance--${data.className}`;
        if (data.icon) {
            const image = document.createElement("img");
            image.src = data.icon;
            image.alt = "";
            wrap.append(image);
        }
        const text = document.createElement("strong");
        text.textContent = data.label;
        wrap.append(text);
        return wrap;
    }

    function createAuthor(item: Proposal, compact = false) {
        const wrapper = document.createElement("div");
        wrapper.className = "activity-author tw:[&_>_a]:flex tw:[&_>_a]:w-full tw:[&_>_a]:items-center tw:[&_>_a]:gap-2 tw:[&_>_a]:text-inherit tw:[&_>_a]:text-left tw:[&_>_a]:no-underline tw:[&_>_a]:cursor-pointer tw:[&_>_a:hover_strong]:text-accent tw:[&_>_a:hover_strong]:underline tw:[&_img]:w-7.5 tw:[&_img]:h-10 tw:[&_img]:flex-none tw:[&_img]:border tw:[&_img]:border-solid tw:[&_img]:border-muted tw:[&_img]:rounded-none tw:[&_img]:object-cover tw:[&_img]:object-[top_center] tw:[&_>_a_>_span]:flex tw:[&_>_a_>_span]:min-w-0 tw:[&_>_a_>_span]:flex-col tw:[&_strong]:block tw:[&_strong]:[overflow-wrap:anywhere] tw:[&_strong]:text-sm tw:[&_strong]:leading-[18px] tw:[&_small]:text-[rgb(11_15_94_/_65%)] tw:[&_small]:text-xs tw:[&_small]:leading-4 tw:max-md:[.activity-card_>_&]:my-2 tw:max-md:[.activity-card_>_&]:mx-0 tw:max-md:[.activity-card_>_&_>_a]:w-auto tw:max-md:[.activity-card_>_&_img]:w-7.5 tw:max-md:[.activity-card_>_&_img]:h-10";
        const author = item.authors[0];
        if (!author) {
            wrapper.textContent = "Autoria não informada";
            return wrapper;
        }
        const button = document.createElement("a");
        button.href = authorRoute(author.nome) || "/atividade-legislativa";
        button.setAttribute("aria-label", `Ver página de autoria de ${author.nome}`);
        const fallback = document.createElement("span");
        fallback.className = "activity-author__fallback tw:w-7.5 tw:h-10 tw:flex-none tw:border tw:border-solid tw:border-muted tw:rounded-none tw:object-cover tw:object-[top_center] tw:bg-[#f1f1ff] tw:text-accent tw:text-[12px] tw:font-bold tw:flex tw:items-center tw:justify-center";
        fallback.textContent = initials(author.nome);
        if (author.foto) {
            const photo = document.createElement("img");
            photo.src = author.foto.replace(/^http:/, "https:");
            photo.alt = "";
            photo.loading = "lazy";
            photo.addEventListener("error", () => photo.replaceWith(fallback), { once: true });
            button.append(photo);
        } else {
            button.append(fallback);
        }
        const copy = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = author.nome;
        const meta = document.createElement("small");
        meta.textContent = [author.partido, author.estado].filter(Boolean).join("/");
        copy.append(name, meta);
        button.append(copy);
        wrapper.append(button);
        if (!compact && item.authors.length > 1) {
            const extra = document.createElement("small");
            extra.className = "activity-author__extra tw:block tw:mt-1";
            extra.textContent = `+ ${item.authors.length - 1} ${item.authors.length === 2 ? "autoria" : "autorias"}`;
            wrapper.append(extra);
        }
        return wrapper;
    }

    function dashboardRow(row: DashboardRow, author = false) {
        const element = document.createElement("div");
        element.className = "activity-dashboard-card__row tw:grid tw:grid-cols-[minmax(0,1fr)_38px_80px] tw:min-h-8 tw:flex-none tw:items-center tw:gap-1.5 tw:text-sm tw:leading-4";
        const key = document.createElement("div");
        key.className = "activity-dashboard-card__key tw:min-w-0 tw:[overflow-wrap:anywhere]";
        if (author) {
            const control = document.createElement(row.key.startsWith("person:num:") ? "a" : "div");
            control.className = "activity-dashboard-card__author tw:items-center tw:gap-1.5 tw:[a&]:w-full tw:[a&]:text-inherit tw:[a&]:text-left tw:[a&]:no-underline tw:[a&]:cursor-pointer tw:[a&:hover_span_>_span]:text-accent tw:[a&:hover_span_>_span]:underline tw:[&_img]:block tw:[&_img]:w-6 tw:[&_img]:h-8 tw:[&_img]:flex-none tw:[&_img]:border tw:[&_img]:border-solid tw:[&_img]:border-muted tw:[&_img]:object-cover tw:[&_img]:object-[top_center] tw:[&_span]:flex tw:[&_span]:min-w-0 tw:[&_span]:flex-col tw:[&_span_>_span]:block tw:[&_span_>_span]:[overflow-wrap:anywhere] tw:[&_span_>_span]:leading-4 tw:[&_small]:text-[rgb(11_15_94_/_65%)] tw:[&_small]:text-[12px] tw:[&_small]:leading-3 tw:flex";
            if (control instanceof HTMLAnchorElement) {
                control.href = authorRoute(row.label) || "/atividade-legislativa";
                control.setAttribute("aria-label", `Ver página de autoria de ${row.label}`);
            }
            const fallback = document.createElement("span");
            fallback.className = "activity-dashboard-card__author-fallback tw:w-6 tw:h-8 tw:flex-none tw:border tw:border-solid tw:border-muted tw:object-cover tw:object-[top_center] tw:bg-[#f1f1ff] tw:text-accent tw:text-[10px] tw:font-bold tw:leading-[1] tw:flex tw:items-center tw:justify-center";
            fallback.textContent = initials(row.label);
            if (row.photo) {
                const image = document.createElement("img");
                image.src = row.photo.replace(/^http:/, "https:");
                image.alt = "";
                image.loading = "lazy";
                image.addEventListener("error", () => image.replaceWith(fallback), { once: true });
                control.append(image);
            } else {
                control.append(fallback);
            }
            const copy = document.createElement("span");
            const name = document.createElement("span");
            name.textContent = row.label;
            const meta = document.createElement("small");
            meta.textContent = row.meta || "Autoria institucional";
            copy.append(name, meta);
            control.append(copy);
            key.append(control);
        } else {
            key.textContent = row.label;
        }
        const bars = document.createElement("div");
        bars.className = "activity-dashboard-card__bars tw:relative tw:flex tw:w-20 tw:h-5 tw:justify-center tw:flex-col tw:gap-1 tw:before:absolute tw:before:z-2 tw:before:[inset-block:0] tw:before:[inset-inline-start:0] tw:before:w-0 tw:before:[border-inline-start:1px_solid_#0b0f5e] tw:before:content-[''] tw:before:pointer-events-none tw:[&_span]:block tw:[&_span]:w-[var(--bar-width,_0%)] tw:[&_span]:min-w-0 tw:[&_span]:max-w-20 tw:[&_span]:h-1.5 tw:[&_span:first-child]:bg-[#c1e639] tw:[&_span:last-child]:bg-[#ff5865]";
        const favorable = document.createElement("span");
        const unfavorable = document.createElement("span");
        favorable.style.setProperty("--bar-width", `${row.favorable_width}%`);
        unfavorable.style.setProperty("--bar-width", `${row.unfavorable_width}%`);
        bars.append(favorable, unfavorable);
        const values = document.createElement("div");
        values.className = "activity-dashboard-card__values tw:flex tw:items-end tw:flex-col tw:text-[rgb(11_15_94_/_75%)] tw:text-xs tw:leading-3 tw:[font-variant-numeric:tabular-nums]";
        const favorableValue = document.createElement("span");
        const unfavorableValue = document.createElement("span");
        favorableValue.textContent = formatNumber.format(row.favorable);
        unfavorableValue.textContent = formatNumber.format(row.unfavorable);
        values.append(favorableValue, unfavorableValue);
        // O Figma reserva a identidade (176px), os números (38px) e as
        // barras (80px), nesta ordem. Não inverter: isso encolhe a autoria.
        element.append(key, values, bars);
        return element;
    }

    function fillDashboardRows(selector: string, rows: DashboardRow[], author = false, singleResultMessage?: string) {
        const target = $(selector);
        target.replaceChildren(...rows.map((row) => dashboardRow(row, author)));
        if (!rows.length) {
            const message = document.createElement("p");
            message.textContent = "Sem dados para os filtros selecionados.";
            target.append(message);
        } else if (rows.length === 1 && singleResultMessage) {
            const message = document.createElement("p");
            message.className = "activity-dashboard-card__single-result tw:text-[rgb(11_15_94_/_65%)] tw:text-xs tw:leading-4 tw:mt-1 tw:mb-0 tw:mx-0";
            message.textContent = singleResultMessage;
            target.append(message);
        }
    }

    function renderDashboard() {
        if (!explorer) return;
        dashboard.toggleAttribute("hidden", explorer.total === 0);
        const rows = explorer.dashboard;
        stateDashboard = new Map(rows.state.map((row) => [row.key, row]));
        fillDashboardRows("[data-dashboard-gender]", rows.gender);
        fillDashboardRows("[data-dashboard-house]", rows.house);
        fillDashboardRows("[data-dashboard-party]", rows.party, false, "Para ver mais partidos, tente remover filtros.");
        fillDashboardRows("[data-dashboard-author]", rows.author, true, "Para ver mais parlamentares, tente remover filtros.");
        fillDashboardRows("[data-dashboard-category]", rows.category);
        $("[data-dashboard-category]").classList.toggle("activity-dashboard-card__empty", rows.category.length === 0);
        if (!rows.category.length) $("[data-dashboard-category]").textContent = "Sem categoria oficial para os filtros selecionados.";
        fillDashboardRows("[data-dashboard-status]", rows.status);
        for (const uf of MAP_UF_CODES) {
            const visualPath = mapVisualPaths.get(uf);
            const hitArea = mapHitAreas.get(uf);
            const row = stateDashboard.get(uf);
            if (!visualPath || !hitArea || !row) continue;
            visualPath.style.fill = row.color ?? "";
            hitArea.setAttribute("aria-label", row.favorable_percent === null
                ? `${uf}: sem proposições avaliadas nos filtros atuais`
                : `${uf}: ${row.favorable} favoráveis e ${row.unfavorable} desfavoráveis`);
            hitArea.setAttribute("aria-expanded", "false");
        }
    }

    const dashboardTooltipTriggers = $$<HTMLButtonElement>("[data-dashboard-tooltip-trigger]");
    const dashboardTooltips = $$<HTMLElement>("[data-dashboard-tooltip]");
    let activeDashboardTooltip: HTMLElement | null = null;
    let activeDashboardTooltipTrigger: HTMLButtonElement | null = null;

    function closeDashboardTooltip(restoreFocus = false) {
        if (!activeDashboardTooltip) return;
        activeDashboardTooltip.hidden = true;
        activeDashboardTooltip.removeAttribute("data-pinned");
        activeDashboardTooltipTrigger?.setAttribute("aria-expanded", "false");
        const trigger = activeDashboardTooltipTrigger;
        activeDashboardTooltip = null;
        activeDashboardTooltipTrigger = null;
        if (restoreFocus) trigger?.focus();
    }

    function positionDashboardTooltip(trigger: HTMLButtonElement, tooltip: HTMLElement) {
        const triggerBounds = trigger.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        const left = Math.min(window.innerWidth - tooltipWidth - 8, Math.max(8, triggerBounds.left + triggerBounds.width / 2 - tooltipWidth / 2));
        const top = Math.max(8, triggerBounds.top - tooltipHeight - 8);
        const tipOffset = Math.min(tooltipWidth - 20, Math.max(4, triggerBounds.left + triggerBounds.width / 2 - left - 8));
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.setProperty("--tooltip-tip-offset", `${tipOffset}px`);
    }

    function showDashboardTooltip(trigger: HTMLButtonElement, pinned = false) {
        const key = trigger.dataset.dashboardTooltipTrigger;
        const tooltip = dashboardTooltips.find((item) => item.dataset.dashboardTooltip === key);
        if (!tooltip) return;
        if (activeDashboardTooltip && activeDashboardTooltip !== tooltip) closeDashboardTooltip();
        tooltip.hidden = false;
        tooltip.toggleAttribute("data-pinned", pinned);
        trigger.setAttribute("aria-expanded", "true");
        activeDashboardTooltip = tooltip;
        activeDashboardTooltipTrigger = trigger;
        positionDashboardTooltip(trigger, tooltip);
    }

    dashboardTooltipTriggers.forEach((trigger) => {
        trigger.addEventListener("pointerenter", () => showDashboardTooltip(trigger));
        trigger.addEventListener("pointerleave", () => {
            if (!activeDashboardTooltip?.hasAttribute("data-pinned")) closeDashboardTooltip();
        });
        trigger.addEventListener("focus", () => showDashboardTooltip(trigger));
        trigger.addEventListener("blur", () => {
            window.setTimeout(() => {
                if (document.activeElement !== trigger && !activeDashboardTooltip?.hasAttribute("data-pinned")) closeDashboardTooltip();
            });
        });
        trigger.addEventListener("click", (event) => {
            event.stopPropagation();
            const isPinned = activeDashboardTooltipTrigger === trigger && activeDashboardTooltip?.hasAttribute("data-pinned");
            if (isPinned) closeDashboardTooltip();
            else showDashboardTooltip(trigger, true);
        });
    });

    function createTableRow(item: Proposal) {
        const row = document.createElement("tr");
        const number = document.createElement("td");
        const link = document.createElement("a");
        link.href = propositionRoute(item.numero) || "/atividade-legislativa";
        link.textContent = item.numero;
        const house = document.createElement("small");
        house.textContent = normalize(item.casa).startsWith("sen") ? "Senado" : "Câmara";
        number.append(link, house);

        const author = document.createElement("td");
        author.append(createAuthor(item));
        const summary = document.createElement("td");
        const summaryText = document.createElement("p");
        summaryText.textContent = item.resumo;
        summaryText.title = item.resumo;
        summary.append(summaryText);
        const stance = document.createElement("td");
        stance.append(createStance(item));
        const evaluator = document.createElement("td");
        evaluator.textContent = item.avaliador || "—";
        if (item.comentario) {
            const comment = document.createElement("a");
            comment.href = propositionRoute(item.numero) || "/atividade-legislativa";
            comment.className = "activity-table__comments tw:block tw:mt-1 tw:text-accent tw:text-xs tw:leading-4";
            comment.textContent = "Ler comentários";
            evaluator.append(comment);
        }
        const progress = document.createElement("td");
        progress.innerHTML = `<strong>${item.celerity.label}</strong><small>${item.celerity.movements_last_90_days} movimentações em 3 meses</small>`;
        const theme = document.createElement("td");
        theme.textContent = item.categoriaLabel || item.categoria || "Não informada";
        theme.title = item.categoria ? `Categoria oficial: ${item.categoriaLabel || item.categoria}` : "Sem categoria no dataset oficial para esta proposição";
        const updated = document.createElement("td");
        // Coluna "Atualização": data de apresentação quando disponível; nunca
        // created_at/updated_at técnicas do sistema.
        updated.textContent = item.apresentadaEm ? formatPresentedDate(item.apresentadaEm) : "—";
        updated.title = item.apresentadaEm ? "Data de apresentação (API oficial)" : "Sem data de apresentação na API oficial";
        row.append(number, author, summary, stance, evaluator, progress, theme, updated);
        return row;
    }

    function createCard(item: Proposal) {
        const article = document.createElement("article");
        article.className = "activity-card tw:max-md:flex tw:max-md:border-b tw:max-md:border-solid tw:max-md:border-b-[rgb(66_66_246_/_25%)] tw:max-md:bg-white tw:max-md:flex-col tw:max-md:py-2 tw:max-md:px-0 tw:max-md:[&_>_header]:flex tw:max-md:[&_>_header]:min-h-14 tw:max-md:[&_>_header]:items-start tw:max-md:[&_>_header]:justify-between tw:max-md:[&_>_header]:gap-2 tw:max-md:[&_>_header]:py-2 tw:max-md:[&_>_header]:px-0 tw:max-md:[&_>_header_>_div]:flex tw:max-md:[&_>_header_>_div]:flex-col tw:max-md:[&_>_header_a]:text-accent tw:max-md:[&_>_header_a]:font-display tw:max-md:[&_>_header_a]:text-lg tw:max-md:[&_>_header_a]:font-bold tw:max-md:[&_>_header_a]:[font-variation-settings:'wdth'_75] tw:max-md:[&_>_header_a]:leading-6 tw:max-md:[&_>_header_a]:no-underline tw:max-md:[&_>_header_a]:uppercase tw:max-md:[&_>_header_small]:text-xs tw:max-md:[&_>_header_small]:leading-4 tw:max-md:[&_>_footer]:flex tw:max-md:[&_>_footer]:min-h-12 tw:max-md:[&_>_footer]:items-start tw:max-md:[&_>_footer]:justify-between tw:max-md:[&_>_footer]:gap-3 tw:max-md:[&_>_footer]:py-2 tw:max-md:[&_>_footer]:px-0 tw:max-md:[&_>_footer_span]:flex tw:max-md:[&_>_footer_span]:flex-col tw:max-md:[&_>_footer_span]:text-xs tw:max-md:[&_>_footer_span]:leading-4 tw:max-md:[&_>_footer_span_+_span]:items-end tw:max-md:[&_>_footer_span_+_span]:text-right";
        const header = document.createElement("header");
        const titleWrap = document.createElement("div");
        const title = document.createElement("a");
        title.href = propositionRoute(item.numero) || "/atividade-legislativa";
        title.textContent = item.numero;
        const house = document.createElement("small");
        house.textContent = normalize(item.casa).startsWith("sen") ? "Senado" : "Câmara";
        titleWrap.append(title, house);
        header.append(titleWrap, createStance(item));
        const tag = document.createElement("span");
        tag.className = "activity-card__tag tw:max-md:self-start tw:max-md:border tw:max-md:border-solid tw:max-md:border-[rgb(66_66_246_/_40%)] tw:max-md:text-[rgb(11_15_94_/_65%)] tw:max-md:font-display tw:max-md:text-[12px] tw:max-md:font-bold tw:max-md:[font-variation-settings:'wdth'_75] tw:max-md:leading-4 tw:max-md:uppercase tw:max-md:py-[1px] tw:max-md:px-1 tw:max-md:mt-0 tw:max-md:mb-2 tw:max-md:mx-0";
        tag.textContent = item.categoriaLabel || item.categoria || "Categoria não informada";
        const summary = document.createElement("p");
        summary.className = "activity-card__summary tw:max-md:text-[rgb(11_15_94_/_72%)] tw:max-md:text-sm tw:max-md:leading-4 tw:max-md:line-clamp-5 tw:max-md:mt-2 tw:max-md:mb-3 tw:max-md:mx-0";
        summary.textContent = item.resumo;
        const footer = document.createElement("footer");
        const evaluation = document.createElement("span");
        evaluation.innerHTML = `<strong>${item.avaliador || "Sem avaliação"}</strong><small>${item.comentario ? "Há parecer complementar" : "Sem parecer complementar"}</small>`;
        const speed = document.createElement("span");
        speed.innerHTML = `<strong>${item.celerity.label}</strong><small>${item.celerity.movements_last_90_days} movimentações em 3 meses</small>`;
        footer.append(evaluation, speed);
        article.append(header, tag, createAuthor(item), summary, footer);
        return article;
    }

    function renderSummary() {
        if (!explorer) return;
        const { summary, total: count } = explorer;
        root.classList.toggle("is-empty-results", count === 0);
        const total = $("[data-total]");
        total.hidden = false;
        total.textContent = count ? `${formatNumber.format(count)} proposições` : "Nenhuma proposição encontrada";
        $("[data-favorable-count]").textContent = formatNumber.format(summary.favorable);
        $("[data-unfavorable-count]").textContent = formatNumber.format(summary.unfavorable);
        const bar = $("[data-result-bar]") as HTMLElement;
        bar.style.setProperty("--favorable-share", `${summary.favorable_share}%`);
        bar.classList.toggle("is-empty", count === 0);
        const downloadButton = $<HTMLButtonElement>("[data-download]");
        downloadButton.disabled = count === 0;
        downloadButton.setAttribute("aria-disabled", String(count === 0));
        const activeCount = summary.active_filter_count;
        $$<HTMLElement>("[data-filter-count]").forEach((badge) => {
            badge.textContent = String(activeCount);
            badge.hidden = activeCount === 0;
        });
        $$<HTMLButtonElement>("[data-clear-filters]").forEach((button) => {
            button.hidden = false;
            button.disabled = activeCount === 0;
            button.setAttribute("aria-disabled", String(activeCount === 0));
        });
    }

    function renderPagination() {
        if (!explorer) return;
        const pages = explorer.page_count;
        page = explorer.page;
        const compact = visible.length > 0 && pages <= 1;
        root.classList.toggle("is-compact-results", compact);
        const pagesRoot = $("[data-pages]");
        pagesRoot.replaceChildren();
        const makeButton = (label: string, target: number, disabled = false, current = false) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label;
            button.disabled = disabled;
            button.className = current ? "is-current" : "";
            if (current) button.setAttribute("aria-current", "page");
            button.addEventListener("click", () => { page = target; void load(); root.scrollIntoView({ behavior: "smooth", block: "start" }); });
            return button;
        };
        const label = document.createElement("span");
        label.className = "activity-pagination__page-label tw:text-sm tw:leading-5";
        label.textContent = `Página ${page} de ${pages}`;
        const controls = document.createElement("span");
        controls.append(makeButton("‹", page - 1, page === 1), makeButton("›", page + 1, page === pages));
        pagesRoot.append(label, controls);
        pagination.hidden = visible.length === 0 || pages <= 1;
    }

    function renderResults() {
        const slice = visible;
        empty.hidden = visible.length !== 0;
        $("[data-results]").toggleAttribute("hidden", visible.length === 0);
        renderSummary();
        renderDashboard();
        renderPagination();
        // Prioriza os painéis que estão acima da tabela. A construção das
        // linhas e dos cards ocorre no próximo frame, mantendo a mudança de
        // filtro responsiva mesmo em respostas grandes.
        const renderVersion = ++resultsRenderVersion;
        const results = $("[data-results]");
        results.setAttribute("aria-busy", "true");
        requestAnimationFrame(() => {
            if (renderVersion !== resultsRenderVersion) return;
            tableBody.replaceChildren(...slice.map(createTableRow));
            cards.replaceChildren(...slice.map(createCard));
            results.removeAttribute("aria-busy");
        });
    }

    function applyFilters(closePanel = true) {
        window.clearTimeout(Number(filters.dataset.searchTimer));
        page = 1;
        appliedFilters = currentFilters();
        if (closePanel && !filterPanel.hasAttribute("hidden")) closeFilters(false);
        void load();
    }

    function resetFilters() {
        window.clearTimeout(Number(filters.dataset.searchTimer));
        filters.reset();
        ["year_start", "year_end", ...ACTIVITY_SINGLE_FILTERS].forEach((name) => {
            const input = field(name);
            if (input) input.value = "";
        });
        ACTIVITY_MULTI_FILTERS.forEach((name) => {
            const input = field(name);
            if (input) input.value = "[]";
        });
        syncActivityYearRange(root, true);
        syncActivityMultiFilters(root, true);
        const authorMinimum = $<HTMLInputElement>("[data-dashboard-author-filter]");
        if (authorMinimum) authorMinimum.value = String(MIN_PROPOSICOES_POR_PARLAMENTAR);
        $$<HTMLInputElement>("[data-dashboard-sort]").forEach((input) => { input.value = DEFAULT_DASHBOARD_ORDER; });
        syncActivitySelects(root, true);
        page = 1;
        appliedFilters = currentFilters();
        void load();
        if (!filterPanel.hasAttribute("hidden")) closeFilters(false);
    }

    function openFilters(advanced = false) {
        panelAdvanced = advanced;
        filterPanel.classList.toggle("is-advanced", advanced);
        const advancedToggle = $<HTMLButtonElement>("[data-toggle-advanced]");
        advancedToggle.textContent = advanced ? "Menos filtros" : "Mais filtros";
        advancedToggle.setAttribute("aria-expanded", String(advanced));
        filterPanel.removeAttribute("hidden");
        backdrop.removeAttribute("hidden");
        root.classList.add("has-overlay");
        lastFocused = document.activeElement as HTMLElement;
        syncActivitySelects(root);
        panelSnapshot = new Map(panelControls().map((control) => [control.name, control.value]));
        $$<HTMLButtonElement>("[data-open-filters]").forEach((button) => button.setAttribute("aria-expanded", "true"));
        const focusSelector = window.matchMedia("(max-width: 1399px)").matches
            ? ".activity-filter-panel__basic button:not([disabled])"
            : ".activity-filter-panel__advanced button:not([disabled])";
        (filterPanel.querySelector(focusSelector) as HTMLElement | null)?.focus();
    }

    function closeFilters(restoreDraft = true) {
        if (restoreDraft && panelSnapshot) {
            panelControls().forEach((control) => {
                const previous = panelSnapshot?.get(control.name);
                if (previous !== undefined) control.value = previous;
            });
        }
        panelSnapshot = null;
        syncActivityYearRange(root, true);
        syncActivityMultiFilters(root, true);
        syncActivitySelects(root, true);
        filterPanel.setAttribute("hidden", "");
        backdrop.setAttribute("hidden", "");
        root.classList.remove("has-overlay");
        $$<HTMLButtonElement>("[data-open-filters]").forEach((button) => button.setAttribute("aria-expanded", "false"));
        lastFocused?.focus();
    }

    root.addEventListener(YEAR_RANGE_CHANGE_EVENT, (event) => {
        const { start, end } = (event as CustomEvent<ActivityYearRange>).detail;
        const startField = field("year_start");
        const endField = field("year_end");
        if (startField) startField.value = start;
        if (endField) endField.value = end;
        syncActivityYearRange(root, true);
        if (filterPanel.hasAttribute("hidden")) applyFilters(false);
    });

    root.addEventListener(MULTI_FILTER_CHANGE_EVENT, (event) => {
        const { name, values } = (event as CustomEvent<{ name: ActivityMultiFilterName; values: string[] }>).detail;
        const input = field(name);
        if (input) input.value = JSON.stringify(values);
        syncActivityMultiFilters(root);
        if (filterPanel.hasAttribute("hidden")) applyFilters(false);
    });

    root.addEventListener(SELECT_CHANGE_EVENT, (event) => {
        const { name, value } = (event as CustomEvent<{ name: string; value: string }>).detail;
        const input = activitySelectInput(root, name);
        if (!input) return;
        input.value = value;
        syncActivitySelects(root);
        if (name === "items") {
            itemsSelect.dataset.userSelected = "true";
            page = 1;
            void load();
        } else if (["party_sort", "author_sort", "author_minimum"].includes(name)) {
            void load();
        } else if (filterPanel.hasAttribute("hidden")) {
            applyFilters(false);
        }
    });

    filters.addEventListener("submit", (event) => { event.preventDefault(); applyFilters(true); });
    filters.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        if (target.name === "search" && window.matchMedia("(min-width: 768px)").matches) {
            window.clearTimeout(Number(filters.dataset.searchTimer));
            filters.dataset.searchTimer = String(window.setTimeout(() => applyFilters(false), 250));
        }
    });
    mobileViewport.addEventListener("change", () => syncResponsivePageSize(true));
    root.addEventListener("click", (event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("button, a");
        if (!target) return;
        if (target.matches("[data-apply-filters]")) {
            event.preventDefault();
            applyFilters(true);
            return;
        }
        if (target.matches("[data-open-filters]")) {
            if (filterPanel.hasAttribute("hidden")) openFilters(target.dataset.openFilters === "advanced");
            else closeFilters();
        }
        if (target.matches("[data-close-filters]")) closeFilters();
        if (target.matches("[data-toggle-advanced]")) {
            panelAdvanced = !panelAdvanced;
            filterPanel.classList.toggle("is-advanced", panelAdvanced);
            target.textContent = panelAdvanced ? "Menos filtros" : "Mais filtros";
            target.setAttribute("aria-expanded", String(panelAdvanced));
        }
        if (target.matches("[data-clear-filters]")) resetFilters();
        if (target.matches("[data-table-sort]")) {
            const next = target.dataset.tableSort as TableSort;
            tableSortDirection = tableSort === next && tableSortDirection === "descending" ? "ascending" : "descending";
            tableSort = next;
            $$<HTMLButtonElement>("[data-table-sort]").forEach((button) => {
                const active = button === target;
                button.classList.toggle("is-active", active);
                const heading = button.closest("th");
                heading?.removeAttribute("aria-sort");
                if (active) heading?.setAttribute("aria-sort", tableSortDirection);
            });
            page = 1;
            void load();
        }
        if (target.matches("[data-download]")) {
            event.preventDefault();
            const anchor = document.createElement("a");
            anchor.href = `${apiBase()}/activity/explorer/export?${queryParams()}`;
            anchor.download = "atividade-legislativa.csv";
            anchor.click();
        }
        if (target.matches("[data-retry]")) load();
    });
    backdrop.addEventListener("click", () => closeFilters());
    filterPanel.addEventListener("keydown", (event) => {
        if (event.key !== "Tab" || filterPanel.hasAttribute("hidden")) return;
        const focusable = $$<HTMLElement>("button:not([disabled]), input:not([disabled]):not([type=hidden]), textarea:not([disabled]), a[href]")
            .filter((element) => filterPanel.contains(element) && element.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
    const mapTooltip = $("[data-map-tooltip]");
    const mapTooltipTitle = $("[data-map-tooltip-title]");
    const mapTooltipSummary = $("[data-map-tooltip-summary]");
    const mapTooltipDetails = $("[data-map-tooltip-details]");
    let activeMapTarget: SVGUseElement | null = null;

    const getMapTarget = (target: EventTarget | null) => target instanceof Element
        ? target.closest<SVGUseElement>("[data-map-hitboxes] [data-uf]")
        : null;

    const closeMapTooltip = (restoreFocus = false) => {
        if (!activeMapTarget) return;
        mapTooltip.hidden = true;
        mapTooltip.removeAttribute("data-pinned");
        const target = activeMapTarget;
        target.setAttribute("aria-expanded", "false");
        activeMapTarget = null;
        if (restoreFocus) target.focus();
    };

    const showMapTooltip = (target: SVGUseElement, event?: PointerEvent, pinned = false) => {
        const uf = target.dataset.uf!;
        const row = stateDashboard.get(uf);
        const favorablePercent = row?.favorable_percent ?? null;
        if (activeMapTarget && activeMapTarget !== target) closeMapTooltip();
        mapTooltipTitle.textContent = favorablePercent === null ? `${uf} — N/A` : uf;
        mapTooltipSummary.textContent = favorablePercent === null
            ? "Não há proposições avaliadas para o filtro atual."
            : `${formatNumber.format(row!.favorable)} favoráveis · ${formatNumber.format(row!.unfavorable)} desfavoráveis`;
        mapTooltipDetails.textContent = favorablePercent === null
            ? "A taxa de favorabilidade não se aplica."
            : `${favorablePercent}% favoráveis · considera a UF de cada parlamentar que assina.`;
        mapTooltip.hidden = false;
        mapTooltip.toggleAttribute("data-pinned", pinned);
        target.setAttribute("aria-expanded", "true");
        activeMapTarget = target;
        const bounds = target.getBoundingClientRect();
        const anchorX = event?.clientX ?? bounds.left + bounds.width / 2;
        const tooltipWidth = mapTooltip.offsetWidth;
        const tooltipHeight = mapTooltip.offsetHeight;
        const left = Math.min(window.innerWidth - tooltipWidth - 8, Math.max(8, anchorX - tooltipWidth / 2));
        const top = Math.max(8, bounds.top - tooltipHeight - 8);
        const tipOffset = Math.min(tooltipWidth - 20, Math.max(4, anchorX - left - 8));
        mapTooltip.style.left = `${left}px`;
        mapTooltip.style.top = `${top}px`;
        mapTooltip.style.setProperty("--tooltip-tip-offset", `${tipOffset}px`);
    };
    root.addEventListener("pointerover", (event) => {
        const target = getMapTarget(event.target);
        if (target) showMapTooltip(target, event);
    });
    root.addEventListener("pointerout", (event) => {
        if (getMapTarget(event.target) && !mapTooltip.hasAttribute("data-pinned")) closeMapTooltip();
    });
    root.addEventListener("focusin", (event) => {
        const target = getMapTarget(event.target);
        if (target) showMapTooltip(target);
    });
    root.addEventListener("focusout", (event) => {
        if (getMapTarget(event.target) && !mapTooltip.hasAttribute("data-pinned")) closeMapTooltip();
    });
    root.addEventListener("click", (event) => {
        const target = getMapTarget(event.target);
        if (!target) return;
        const isPinned = activeMapTarget === target && mapTooltip.hasAttribute("data-pinned");
        if (isPinned) closeMapTooltip();
        else showMapTooltip(target, event as PointerEvent, true);
    });
    document.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target?.closest("[data-dashboard-tooltip-trigger]")) closeDashboardTooltip();
        if (!target?.closest("[data-map-hitboxes] [data-uf]")) closeMapTooltip();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (!filterPanel.hasAttribute("hidden")) closeFilters();
        if (activeDashboardTooltip) closeDashboardTooltip(true);
        if (activeMapTarget) closeMapTooltip(true);
    });

    async function load() {
        requestController?.abort();
        const controller = new AbortController();
        requestController = controller;
        ++resultsRenderVersion;
        status.hidden = false;
        status.classList.remove("is-error");
        status.classList.add("is-loading");
        status.innerHTML = `<span aria-hidden="true"></span><p>${explorer ? "Aplicando filtros…" : "Carregando atividade legislativa…"}</p>`;
        root.setAttribute("aria-busy", "true");
        $("[data-results]").setAttribute("hidden", "");
        dashboard.setAttribute("hidden", "");
        pagination.hidden = true;
        empty.hidden = true;
        $("[data-total]").hidden = true;
        try {
            const response = await fetch(`${apiBase()}/activity/explorer?${queryParams()}`, { signal: controller.signal });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json() as ActivityExplorerResponse;
            if (controller.signal.aborted) return;
            explorer = result;
            visible = result.items.map(displayProposal);
            page = result.page;
            hydrateOptions(result.options);
            status.hidden = true;
            renderResults();
        } catch (error) {
            if (controller.signal.aborted) return;
            console.error(error);
            status.classList.remove("is-loading");
            status.classList.add("is-error");
            status.innerHTML = `<p><strong>Não foi possível carregar as proposições.</strong><br />Confira sua conexão e tente novamente.</p><button type="button" data-retry>Tentar novamente</button>`;
            $("[data-results]").setAttribute("hidden", "");
            $("[data-total]").hidden = true;
            dashboard.setAttribute("hidden", "");
            pagination.hidden = true;
            empty.hidden = true;
        } finally {
            if (requestController === controller) root.removeAttribute("aria-busy");
        }
    }

    setupMobileAccordions();
    syncResponsivePageSize();
    void load();
}

const initialize = () => document.querySelectorAll<HTMLElement>("[data-activity-root]").forEach(initActivity);
initialize();
document.addEventListener("astro:page-load", initialize);
