type RawParliamentarian = {
    nome: string;
    numero: number;
    foto?: string;
    genero?: string;
    partido?: string;
    cargo?: string;
    estado?: string;
    legislatura?: string[];
    slug?: string;
};

type RawProposal = {
    i: number;
    casa: string;
    numero: string;
    link?: string;
    comentario?: string | null;
    slug: string;
    resumo: string;
    avaliador?: string | null;
    favoravel: number;
    relevancia?: number;
    autores?: Record<string, number>;
    legislatura: number;
    quiteria_prob?: number;
};

type RawLegislature = {
    parlamentares: Record<string, RawParliamentarian>;
    proposicoes: Record<string, RawProposal>;
};

type RawData = { legislaturas: Record<string, RawLegislature> };
type Proposal = RawProposal & { year: number; authors: RawParliamentarian[]; parties: string[]; states: string[]; genders: string[] };
type DashboardRow = { key: string; label: string; favorable: number; unfavorable: number; photo?: string; meta?: string };
type TableSort = "number" | "author" | "summary" | "assessment" | "evaluator" | "progress" | "category" | "updated";

import {
    sortDashboardRows as sortDashboardRowsUtil,
    groupCanetadasByParty,
    aggregateAuthorships,
    countAuthorProposals,
    filterAuthorsByMinProposals,
    normalizeGenderCode,
    GENDER_LABELS,
    normalizeUfCode,
    normalizeCasa,
    CASA_LABELS,
    personKey,
    createQualityCollector,
    DEFAULT_DASHBOARD_ORDER,
    MIN_PROPOSICOES_POR_PARLAMENTAR,
    calculateMapFavorableRate,
    mapFavorableRateToColor,
    isMapUfCode,
    MOBILE_ITEMS_PER_PAGE,
    getSingleDashboardResultMessage,
    type DashboardSort as DashboardSortType,
    type QualityCollector,
} from "../lib/dashboard-utils";

const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const escapeCsv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const formatNumber = new Intl.NumberFormat("pt-BR");

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
    const mapSvg = root.querySelector<SVGSVGElement>("[data-map-hitboxes] svg");
    mapSvg?.setAttribute("preserveAspectRatio", "xMidYMid meet");
    root.querySelectorAll<SVGPathElement>("[data-map-hitboxes] path[id]").forEach((path) => {
        if (isMapUfCode(path.id)) path.setAttribute("data-uf", path.id.toUpperCase());
    });
    const filterPanel = $("[data-filter-panel]");
    const backdrop = $("[data-backdrop]");
    const parliamentarianDialog = $("[data-parliamentarian-dialog]") as HTMLDialogElement;
    const itemsSelect = $("[data-items-per-page]") as HTMLSelectElement;
    const apiBase = (import.meta.env.PUBLIC_API_BASE_URL || "https://api.elasnocongresso.com.br/api/v1").replace(/\/$/, "");

    let all: Proposal[] = [];
    let visible: Proposal[] = [];
    let page = 1;
    let tableSort: TableSort = "updated";
    let tableSortDirection: "ascending" | "descending" = "descending";
    let panelAdvanced = false;
    let lastFocused: HTMLElement | null = null;
    let stateDashboard = new Map<string, DashboardRow>();
    let dataQuality: QualityCollector = createQualityCollector();
    let mobileAccordionsReady = false;
    let mobileViewport = window.matchMedia("(max-width: 767px)");

    function syncResponsivePageSize(render = false) {
        if (!itemsSelect.dataset.userSelected && mobileViewport.matches && itemsSelect.value !== String(MOBILE_ITEMS_PER_PAGE)) {
            itemsSelect.value = String(MOBILE_ITEMS_PER_PAGE);
            if (render && visible.length) {
                page = 1;
                renderResults();
            }
        }
    }

    const field = (name: string) => filters.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
    const value = (name: string) => field(name)?.value ?? "";

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
            toggle.className = "activity-dashboard-card__toggle";
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

    function hydrateOptions(data: RawData) {
        const proposals: Proposal[] = [];
        const parties = new Set<string>();
        const years = new Set<number>();
        const states = new Set<string>();
        const evaluators = new Set<string>();
        dataQuality = createQualityCollector();

        Object.entries(data.legislaturas).forEach(([legislatureId, legislature]) => {
            const people = legislature.parlamentares || {};
            Object.values(legislature.proposicoes || {}).forEach((proposal) => {
                const rawAuthorIds = Object.keys(proposal.autores || {});
                const authors = rawAuthorIds.map((id) => people[id]).filter(Boolean);
                if (authors.length !== rawAuthorIds.length) {
                    dataQuality.record("autoria-nao-resolvida", `${proposal.numero}: ${rawAuthorIds.length - authors.length} autoria(s) sem cadastro correspondente`);
                }
                const casa = normalizeCasa(proposal.casa);
                if (!casa) {
                    dataQuality.record("casa-desconhecida", `${proposal.numero}: casa=${JSON.stringify(proposal.casa)}`);
                }
                for (const author of authors) {
                    if (author.numero === undefined || author.numero === null) {
                        dataQuality.record("autor-sem-numero", `${author.nome || author.slug || "?"} em ${proposal.numero}`);
                    }
                    if (normalizeGenderCode(author.genero) === "U") {
                        dataQuality.record("genero-invalido", `${author.nome} (num ${author.numero}): genero=${JSON.stringify(author.genero)}`);
                    }
                    if (normalizeUfCode(author.estado) === null) {
                        dataQuality.record("uf-invalida", `${author.nome} (num ${author.numero}): estado=${JSON.stringify(author.estado)}`);
                    }
                    if (author.partido === undefined || author.partido === null || String(author.partido).trim() === "") {
                        dataQuality.record("partido-ausente", `${author.nome} (num ${author.numero}) em ${proposal.numero}`);
                    }
                }
                const year = Number(proposal.numero?.match(/\/(\d{4})/)?.[1] || 0);
                const item: Proposal = {
                    ...proposal,
                    legislatura: Number(proposal.legislatura || legislatureId),
                    year,
                    authors,
                    parties: [...new Set(authors.map((author) => author.partido).filter(Boolean) as string[])],
                    states: [...new Set(authors.map((author) => normalizeUfCode(author.estado)).filter((uf): uf is string => uf !== null))],
                    genders: [...new Set(authors.map((author) => normalizeGenderCode(author.genero)).filter((code) => code === "F" || code === "M"))],
                };
                proposals.push(item);
                if (year) years.add(year);
                item.parties.forEach((party) => parties.add(party));
                item.states.forEach((stateName) => states.add(stateName));
                if (proposal.avaliador) evaluators.add(proposal.avaliador);
            });
        });

        const addOptions = (name: string, values: (string | number)[], label?: (item: string | number) => string) => {
            const select = field(name) as HTMLSelectElement | null;
            if (!select) return;
            values.forEach((item) => {
                const option = document.createElement("option");
                option.value = String(item);
                option.textContent = label ? label(item) : String(item);
                select.append(option);
            });
        };
        addOptions("year", [...years].sort((a, b) => b - a));
        addOptions("year-mobile", [...years].sort((a, b) => b - a));
        addOptions("party", [...parties].sort((a, b) => a.localeCompare(b, "pt-BR")));
        addOptions("party-mobile", [...parties].sort((a, b) => a.localeCompare(b, "pt-BR")));
        addOptions("state", [...states].sort());
        addOptions("evaluator", [...evaluators].sort((a, b) => a.localeCompare(b, "pt-BR")));
        all = proposals.sort((a, b) => b.year - a.year || b.i - a.i);
        const quality = dataQuality.summary();
        if (quality.total > 0) {
            console.warn("[atividade-legislativa] relatório de qualidade dos dados:", JSON.stringify(quality));
        }
    }

    function matches(item: Proposal) {
        const query = normalize(value("search").trim());
        const haystack = normalize([item.numero, item.resumo, item.avaliador, ...item.authors.map((author) => `${author.nome} ${author.partido} ${author.estado}`)].join(" "));
        const stance = value("assessment");
        const withComments = value("comments");
        return (!query || haystack.includes(query))
            && (!value("house") || normalize(item.casa).startsWith(normalize(value("house"))))
            && (!value("year") || item.year === Number(value("year")))
            && (!value("party") || item.parties.includes(value("party")))
            && (!stance || (stance === "favorable" ? item.favoravel > 0 : stance === "unfavorable" ? item.favoravel < 0 : !item.avaliador))
            && (!value("gender") || item.genders.includes(value("gender")))
            && (!value("state") || item.states.includes(value("state")))
            && (!value("evaluator") || item.avaliador === value("evaluator"))
            && (!value("relevance") || Number(item.relevancia || 0) === Number(value("relevance")))
            && (!withComments || (withComments === "yes" ? Boolean(item.comentario) : !item.comentario));
    }

    function sortItems(items: Proposal[]) {
        const text = (item: Proposal, key: TableSort) => {
            if (key === "number") return item.numero;
            if (key === "author") return item.authors[0]?.nome || "";
            if (key === "summary") return item.resumo;
            if (key === "evaluator") return item.avaliador || "";
            return "";
        };
        const number = (item: Proposal, key: TableSort) => {
            if (key === "assessment") return item.favoravel;
            if (key === "progress") return item.quiteria_prob ?? -1;
            if (key === "updated") return item.year * 1_000_000 + item.i;
            return 0;
        };
        const direction = tableSortDirection === "ascending" ? 1 : -1;
        return [...items].sort((a, b) => {
            if (["assessment", "progress", "updated"].includes(tableSort)) return (number(a, tableSort) - number(b, tableSort)) * direction;
            if (tableSort === "category") return (a.i - b.i) * direction;
            return text(a, tableSort).localeCompare(text(b, tableSort), "pt-BR", { numeric: true }) * direction;
        });
    }

    function currentSlice() {
        const amount = Number(itemsSelect.value);
        const start = (page - 1) * amount;
        return visible.slice(start, start + amount);
    }

    function stanceData(item: Proposal) {
        if (!item.avaliador) return { label: "Sem avaliação", className: "neutral", icon: "" };
        return item.favoravel > 0
            ? { label: "Favorável", className: "favorable", icon: root.dataset.thumbsUp || "" }
            : { label: "Desfavorável", className: "unfavorable", icon: root.dataset.thumbsDown || "" };
    }

    function createStance(item: Proposal) {
        const data = stanceData(item);
        const wrap = document.createElement("span");
        wrap.className = `activity-stance activity-stance--${data.className}`;
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
        wrapper.className = "activity-author";
        const author = item.authors[0];
        if (!author) {
            wrapper.textContent = "Autoria não informada";
            return wrapper;
        }
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.parliamentarian = String(author.numero);
        button.setAttribute("aria-label", `Ver informações de ${author.nome}`);
        if (author.foto) {
            const photo = document.createElement("img");
            photo.src = author.foto.replace(/^http:/, "https:");
            photo.alt = "";
            photo.loading = "lazy";
            photo.addEventListener("error", () => photo.remove(), { once: true });
            button.append(photo);
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
            extra.className = "activity-author__extra";
            extra.textContent = `+ ${item.authors.length - 1} ${item.authors.length === 2 ? "autoria" : "autorias"}`;
            wrapper.append(extra);
        }
        return wrapper;
    }

    function aggregateRows(items: Proposal[], groupsFor: (item: Proposal) => { key: string; label: string; photo?: string; meta?: string }[]) {
    const rows = new Map<string, DashboardRow>();
    items.forEach((item) => {
        const seen = new Set<string>();
        groupsFor(item).forEach((group) => {
            if (!group.key || seen.has(group.key)) return;
            seen.add(group.key);
            const row = rows.get(group.key) || { ...group, favorable: 0, unfavorable: 0 };
            if (item.favoravel > 0) row.favorable += 1;
            if (item.favoravel < 0) row.unfavorable += 1;
            rows.set(group.key, row);
        });
    });
    return [...rows.values()];
    }

    function aggregatePartyCanetadas(items: Proposal[]): DashboardRow[] {
        const mappedItems = items.map((item) => ({
            authors: item.authors.map((author) => ({ numero: author.numero, nome: author.nome, slug: author.slug, partido: author.partido })),
            favorable: item.favoravel,
        }));
        const groups = groupCanetadasByParty(mappedItems);
        return [...groups.entries()].map(([party, counts]) => ({
            key: party,
            label: party,
            ...counts,
        }));
    }

    function sortDashboardRows(rows: DashboardRow[], mode?: DashboardSortType) {
    return sortDashboardRowsUtil(rows, mode);
    }

    function dashboardRow(row: DashboardRow, peak: number, author = false) {
        const element = document.createElement("div");
        element.className = "activity-dashboard-card__row";
        const key = document.createElement("div");
        key.className = "activity-dashboard-card__key";
        if (author) {
            const control = document.createElement(row.key.startsWith("person:") ? "button" : "div");
            control.className = "activity-dashboard-card__author";
            if (control instanceof HTMLButtonElement) {
                control.type = "button";
                control.dataset.parliamentarian = row.key.slice(7);
                control.setAttribute("aria-label", `Ver informações de ${row.label}`);
            }
            if (row.photo) {
                const image = document.createElement("img");
                image.src = row.photo.replace(/^http:/, "https:");
                image.alt = "";
                image.loading = "lazy";
                image.addEventListener("error", () => image.remove(), { once: true });
                control.append(image);
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
        bars.className = "activity-dashboard-card__bars";
        const favorable = document.createElement("span");
        const unfavorable = document.createElement("span");
        favorable.style.setProperty("--bar-width", `${(row.favorable / peak) * 100}%`);
        unfavorable.style.setProperty("--bar-width", `${(row.unfavorable / peak) * 100}%`);
        bars.append(favorable, unfavorable);
        const values = document.createElement("div");
        values.className = "activity-dashboard-card__values";
        const favorableValue = document.createElement("span");
        const unfavorableValue = document.createElement("span");
        favorableValue.textContent = formatNumber.format(row.favorable);
        unfavorableValue.textContent = formatNumber.format(row.unfavorable);
        values.append(favorableValue, unfavorableValue);
        element.append(key, bars, values);
        return element;
    }

    function fillDashboardRows(selector: string, rows: DashboardRow[], options: { sort?: DashboardSortType; author?: boolean; limit?: number; singleResultMessage?: string | null } = {}) {
        const target = $(selector);
        const sorted = options.sort ? sortDashboardRows(rows, options.sort) : rows;
        const shown = options.limit ? sorted.slice(0, options.limit) : sorted;
        const peak = Math.max(1, ...shown.flatMap((row) => [row.favorable, row.unfavorable]));
        target.replaceChildren(...shown.map((row) => dashboardRow(row, peak, options.author)));
        if (!shown.length) {
            const message = document.createElement("p");
            message.textContent = "Sem dados para os filtros selecionados.";
            target.append(message);
        } else if (options.singleResultMessage) {
            const message = document.createElement("p");
            message.className = "activity-dashboard-card__single-result";
            message.textContent = options.singleResultMessage;
            target.append(message);
        }
    }

    function renderDashboard() {
        if (!visible.length) {
            stateDashboard = new Map();
            dashboard.setAttribute("hidden", "");
            return;
        }
        dashboard.removeAttribute("hidden");
        // Visão por autorias: cada item carrega os autores resolvidos e a
        // avaliação da proposição. Usado pelos painéis de canetadas.
        const authorshipItems = visible.map((item) => ({ authors: item.authors, favorable: item.favoravel }));
        // Por gênero: autorias únicas por proposição (GENDER_COUNT_MODE, provisório).
        // Valores inválidos (ex.: nome próprio no campo `genero`) viram "Não informado".
        const genders = aggregateAuthorships(authorshipItems, (author) => {
            const code = normalizeGenderCode(author.genero);
            return { key: code, label: GENDER_LABELS[code] };
        });
        // Por casa: proposições únicas. Poder Executivo excluído da visualização
        // (sem apagar da base); casa ausente/desconhecida vai ao relatório de
        // qualidade e não é convertida silenciosamente em Câmara/Senado.
        const houses = aggregateRows(visible, (item) => {
            const casa = normalizeCasa(item.casa);
            if (!casa || casa === "executivo") return [];
            return [{ key: casa, label: CASA_LABELS[casa] }];
        });
        const partyCanetadas = aggregatePartyCanetadas(visible);
        // Por UF: UF de cada autoria única (UF_COUNT_MODE, provisório).
        // Siglas inválidas/ausentes vão ao relatório; sem inferência.
        const states = aggregateAuthorships(authorshipItems, (author) => {
            const uf = normalizeUfCode(author.estado);
            return uf ? { key: uf, label: uf } : null;
        });
        const allAuthors = aggregateRows(visible, (item) => item.authors.map((author) => ({
            key: `person:${personKey(author)}`,
            label: author.nome,
            photo: author.foto,
            meta: [author.partido, author.estado].filter(Boolean).join("/"),
        })));
        const authorProposalCounts = countAuthorProposals(visible);
        // O limite é aplicado depois dos filtros gerais e da contagem de
        // proposições únicas por parlamentar, antes da ordenação/renderização.
        const authorMinimum = Number($<HTMLSelectElement>("[data-dashboard-author-filter]")?.value || MIN_PROPOSICOES_POR_PARLAMENTAR);
        const authors = filterAuthorsByMinProposals(allAuthors, authorProposalCounts, authorMinimum);
        stateDashboard = new Map(states.map((row) => [row.key, row]));

        const partySort = ($<HTMLSelectElement>('[data-dashboard-sort="party"]')?.value as DashboardSortType) ?? DEFAULT_DASHBOARD_ORDER;
        const authorSort = ($<HTMLSelectElement>('[data-dashboard-sort="author"]')?.value as DashboardSortType) ?? DEFAULT_DASHBOARD_ORDER;

        // Regra estritamente visual: os dados desconhecidos continuam agregados e
        // auditados, mas o painel exibe apenas F/M nesta ordem editorial fixa.
        const displayedGenders = (["F", "M"] as const).flatMap((code) => genders.filter((row) => row.key === code));
        fillDashboardRows("[data-dashboard-gender]", displayedGenders);
        // Casa segue a ordem editorial do design (Câmara, Senado); somente
        // partido e autoria expõem ordenação interativa.
        const displayedHouses = (["camara", "senado"] as const).flatMap((key) => houses.filter((row) => row.key === key));
        fillDashboardRows("[data-dashboard-house]", displayedHouses);
        fillDashboardRows("[data-dashboard-party]", partyCanetadas, { sort: partySort, singleResultMessage: getSingleDashboardResultMessage("party", partyCanetadas) });
        fillDashboardRows("[data-dashboard-author]", authors, { sort: authorSort, author: true, singleResultMessage: getSingleDashboardResultMessage("author", authors) });
        $("[data-dashboard-category]").textContent = "Categorias não estão disponíveis no arquivo de dados desta listagem.";
        $("[data-dashboard-status]").textContent = "Status legislativos completos não estão disponíveis no arquivo de dados desta listagem.";

        $$<SVGPathElement>("[data-map-hitboxes] path[data-uf]").filter((path) => isMapUfCode(path.dataset.uf || path.id)).forEach((path) => {
            const uf = (path.dataset.uf || path.id).toUpperCase();
            const row = stateDashboard.get(uf);
            const favorableRate = row ? calculateMapFavorableRate(row) : null;
            path.style.fill = mapFavorableRateToColor(favorableRate);
            path.tabIndex = 0;
            path.setAttribute("aria-label", favorableRate === null
                ? `${path.id}: sem proposições avaliadas nos filtros atuais`
                : `${path.id}: ${row!.favorable} favoráveis e ${row!.unfavorable} desfavoráveis`);
            path.setAttribute("aria-describedby", "activity-map-tooltip");
            path.setAttribute("aria-expanded", "false");
        });
        dashboard.removeAttribute("hidden");
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
        link.href = `/proposta/${item.slug}`;
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
            comment.href = `/proposta/${item.slug}`;
            comment.className = "activity-table__comments";
            comment.textContent = "Ler comentários";
            evaluator.append(comment);
        }
        const progress = document.createElement("td");
        progress.innerHTML = `<strong>${(item.quiteria_prob ?? 0) >= .55 ? "Rápida" : "Lenta"}</strong><small>${Math.round((item.quiteria_prob ?? 0) * 100)}% de chance de avançar</small>`;
        const theme = document.createElement("td");
        theme.textContent = "Não informada";
        theme.title = "A base desta listagem não fornece a categoria da proposição";
        const updated = document.createElement("td");
        updated.textContent = "—";
        updated.title = "A base desta listagem não fornece a data de atualização";
        row.append(number, author, summary, stance, evaluator, progress, theme, updated);
        return row;
    }

    function createCard(item: Proposal) {
        const article = document.createElement("article");
        article.className = "activity-card";
        const header = document.createElement("header");
        const titleWrap = document.createElement("div");
        const title = document.createElement("a");
        title.href = `/proposta/${item.slug}`;
        title.textContent = item.numero;
        const house = document.createElement("small");
        house.textContent = normalize(item.casa).startsWith("sen") ? "Senado" : "Câmara";
        titleWrap.append(title, house);
        header.append(titleWrap, createStance(item));
        const tag = document.createElement("span");
        tag.className = "activity-card__tag";
        tag.textContent = "Categoria não informada";
        const summary = document.createElement("p");
        summary.className = "activity-card__summary";
        summary.textContent = item.resumo;
        const footer = document.createElement("footer");
        const evaluation = document.createElement("span");
        evaluation.innerHTML = `<strong>${item.avaliador || "Sem avaliação"}</strong><small>${item.comentario ? "Há parecer complementar" : "Sem parecer complementar"}</small>`;
        const speed = document.createElement("span");
        speed.innerHTML = `<strong>${(item.quiteria_prob ?? 0) >= .55 ? "Rápida" : "Lenta"}</strong><small>Tramitação estimada</small>`;
        footer.append(evaluation, speed);
        article.append(header, tag, createAuthor(item), summary, footer);
        return article;
    }

    function renderSummary() {
        const favorable = visible.filter((item) => item.favoravel > 0).length;
        const unfavorable = visible.filter((item) => item.favoravel < 0).length;
        const totalRated = favorable + unfavorable || 1;
        root.classList.toggle("is-empty-results", visible.length === 0);
        $("[data-total]").textContent = visible.length ? `${formatNumber.format(visible.length)} proposições` : "Nenhuma proposição encontrada";
        $("[data-favorable-count]").textContent = formatNumber.format(favorable);
        $("[data-unfavorable-count]").textContent = formatNumber.format(unfavorable);
        const bar = $("[data-result-bar]") as HTMLElement;
        bar.style.setProperty("--favorable-share", `${(favorable / totalRated) * 100}%`);
        bar.classList.toggle("is-empty", visible.length === 0);
        const activeNames = new Set($$<HTMLInputElement | HTMLSelectElement>("input, select")
            .filter((control) => !control.disabled && control.name && !["items", "sort"].includes(control.name) && Boolean(control.value))
            .map((control) => control.name.replace(/-mobile$/, "")));
        const activeCount = activeNames.size;
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
        const pages = Math.max(1, Math.ceil(visible.length / Number(itemsSelect.value)));
        page = Math.min(page, pages);
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
            button.addEventListener("click", () => { page = target; renderResults(); root.scrollIntoView({ behavior: "smooth", block: "start" }); });
            return button;
        };
        const label = document.createElement("span");
        label.className = "activity-pagination__page-label";
        label.textContent = `Página ${page} de ${pages}`;
        const controls = document.createElement("span");
        controls.append(makeButton("‹", page - 1, page === 1), makeButton("›", page + 1, page === pages));
        pagesRoot.append(label, controls);
        pagination.hidden = visible.length === 0 || pages <= 1;
    }

    function renderResults() {
        const slice = currentSlice();
        tableBody.replaceChildren(...slice.map(createTableRow));
        cards.replaceChildren(...slice.map(createCard));
        empty.hidden = visible.length !== 0;
        $("[data-results]").toggleAttribute("hidden", visible.length === 0);
        renderSummary();
        renderDashboard();
        renderPagination();
    }

    function applyFilters() {
        page = 1;
        visible = sortItems(all.filter(matches));
        renderResults();
        closeFilters();
    }

    function resetFilters() {
        filters.reset();
        page = 1;
        visible = sortItems(all);
        renderResults();
        closeFilters();
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
        ["house", "year", "party", "category", "assessment"].forEach((name) => {
            const desktop = field(name);
            const mobile = field(`${name}-mobile`);
            if (desktop && mobile) mobile.value = desktop.value;
        });
        $$<HTMLButtonElement>("[data-open-filters]").forEach((button) => button.setAttribute("aria-expanded", "true"));
        (filterPanel.querySelector(".activity-filter-panel__basic select, .activity-filter-panel__basic input, input, select, button") as HTMLElement | null)?.focus();
    }

    function closeFilters() {
        filterPanel.setAttribute("hidden", "");
        backdrop.setAttribute("hidden", "");
        root.classList.remove("has-overlay");
        $$<HTMLButtonElement>("[data-open-filters]").forEach((button) => button.setAttribute("aria-expanded", "false"));
        lastFocused?.focus();
    }

    async function openParliamentarian(id: string) {
        const author = all.flatMap((item) => item.authors).find((person) => personKey(person) === id);
        if (!author) return;
        lastFocused = document.activeElement as HTMLElement;
        const photo = $("[data-dialog-photo]") as HTMLImageElement;
        photo.src = (author.foto || "").replace(/^http:/, "https:");
        photo.alt = `Foto de ${author.nome}`;
        photo.hidden = !author.foto;
        photo.onerror = () => { photo.hidden = true; };
        photo.onload = () => { photo.hidden = false; };
        $("[data-dialog-house]").textContent = author.cargo || "Parlamentar";
        $("[data-dialog-name]").textContent = author.nome;
        $("[data-dialog-party]").textContent = [author.partido, author.estado].filter(Boolean).join("/");
        $("[data-dialog-birth]").textContent = "Carregando…";
        $("[data-dialog-profession]").textContent = "Carregando…";
        $("[data-dialog-education]").textContent = "Carregando…";
        $("[data-dialog-race]").textContent = "Carregando…";
        $("[data-dialog-religion]").textContent = "Carregando…";
        const authored = all.filter((item) => item.authors.some((person) => personKey(person) === personKey(author)));
        $("[data-dialog-favorable]").textContent = formatNumber.format(authored.filter((item) => item.favoravel > 0).length);
        $("[data-dialog-unfavorable]").textContent = formatNumber.format(authored.filter((item) => item.favoravel < 0).length);
        parliamentarianDialog.showModal();
        try {
            const house = normalize(author.cargo).includes("sen") ? "senado" : "camara";
            const response = await fetch(`${apiBase}/parliamentarians/?house=${house}&current=true&limit=1000&offset=0`);
            if (!response.ok) throw new Error(String(response.status));
            const body = await response.json();
            const match = (body.items || []).find((person: { full_name?: string; social_name?: string }) => [person.full_name, person.social_name].some((name) => normalize(name) === normalize(author.nome)));
            if (!match) throw new Error("not-found");
            const detailResponse = await fetch(`${apiBase}/parliamentarians/${match.id}`);
            if (!detailResponse.ok) throw new Error(String(detailResponse.status));
            const detail = await detailResponse.json();
            $("[data-dialog-birth]").textContent = detail.birth_date ? new Intl.DateTimeFormat("pt-BR").format(new Date(`${detail.birth_date}T12:00:00`)) : "Não informado";
            $("[data-dialog-profession]").textContent = detail.profession || "Não informado";
            $("[data-dialog-education]").textContent = detail.education || "Não informado";
            $("[data-dialog-race]").textContent = detail.race || "Não informado";
            $("[data-dialog-religion]").textContent = detail.religion || "Não informado";
        } catch {
            ["birth", "profession", "education", "race", "religion"].forEach((key) => { $( `[data-dialog-${key}]`).textContent = "Não informado"; });
        }
    }

    filters.addEventListener("submit", (event) => { event.preventDefault(); applyFilters(); });
    filters.addEventListener("input", (event) => {
        const target = event.target as HTMLInputElement;
        if (target.name.endsWith("-mobile")) {
            const desktop = field(target.name.replace(/-mobile$/, ""));
            if (desktop) desktop.value = target.value;
        } else if (target.name && !target.name.includes("-mobile")) {
            const mobile = field(`${target.name}-mobile`);
            if (mobile) mobile.value = target.value;
        }
        if (target.name === "search" && window.matchMedia("(min-width: 768px)").matches) {
            window.clearTimeout(Number(filters.dataset.searchTimer));
            filters.dataset.searchTimer = String(window.setTimeout(applyFilters, 250));
        }
    });
    itemsSelect.addEventListener("change", () => { itemsSelect.dataset.userSelected = "true"; page = 1; renderResults(); });
    mobileViewport.addEventListener("change", () => syncResponsivePageSize(true));
    root.addEventListener("click", (event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("button, a");
        if (!target) return;
        if (target.matches("[data-open-filters]")) openFilters(target.dataset.openFilters === "advanced");
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
            visible = sortItems(visible);
            page = 1;
            renderResults();
        }
        if (target.matches("[data-download]")) {
            event.preventDefault();
            const rows = [["Proposição", "Casa", "Ano", "Autoria", "Partido/UF", "Ementa", "Avaliação", "Quem avaliou", "Ressalvas"], ...visible.map((item) => [item.numero, item.casa, item.year, item.authors.map((author) => author.nome).join("; "), item.authors.map((author) => `${author.partido}/${author.estado}`).join("; "), item.resumo, stanceData(item).label, item.avaliador || "", item.comentario || ""])];
            const blob = new Blob(["\ufeff" + rows.map((row) => row.map(escapeCsv).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "atividade-legislativa.csv";
            anchor.click();
            URL.revokeObjectURL(url);
        }
        if (target.matches("[data-parliamentarian]")) openParliamentarian(target.dataset.parliamentarian!);
        if (target.matches("[data-dialog-close]")) parliamentarianDialog.close();
        if (target.matches("[data-retry]")) load();
    });
    backdrop.addEventListener("click", closeFilters);
    filterPanel.addEventListener("keydown", (event) => {
        if (event.key !== "Tab" || filterPanel.hasAttribute("hidden")) return;
        const focusable = $$<HTMLElement>("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]")
            .filter((element) => filterPanel.contains(element));
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
    filters.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement;
        if (!target.name) return;
        const pairedName = target.name.endsWith("-mobile") ? target.name.replace(/-mobile$/, "") : `${target.name}-mobile`;
        const paired = field(pairedName);
        if (paired) paired.value = target.value;
    });
    $$<HTMLSelectElement>("[data-dashboard-sort], [data-dashboard-author-filter]").forEach((select) => select.addEventListener("change", renderDashboard));
    const mapTooltip = $("[data-map-tooltip]");
    const mapTooltipTitle = $("[data-map-tooltip-title]");
    const mapTooltipSummary = $("[data-map-tooltip-summary]");
    const mapTooltipDetails = $("[data-map-tooltip-details]");
    let activeMapPath: SVGPathElement | null = null;

    const closeMapTooltip = (restoreFocus = false) => {
        if (!activeMapPath) return;
        mapTooltip.hidden = true;
        mapTooltip.removeAttribute("data-pinned");
        const path = activeMapPath;
        path.setAttribute("aria-expanded", "false");
        activeMapPath = null;
        if (restoreFocus) path.focus();
    };

    const showMapTooltip = (path: SVGPathElement, event?: PointerEvent, pinned = false) => {
        const row = stateDashboard.get(path.id.toUpperCase());
        const favorableRate = row ? calculateMapFavorableRate(row) : null;
        if (activeMapPath && activeMapPath !== path) closeMapTooltip();
        mapTooltipTitle.textContent = favorableRate === null ? `${path.id} — N/A` : path.id;
        mapTooltipSummary.textContent = favorableRate === null
            ? "Não há proposições avaliadas para o filtro atual."
            : `${formatNumber.format(row!.favorable)} favoráveis · ${formatNumber.format(row!.unfavorable)} desfavoráveis`;
        mapTooltipDetails.textContent = favorableRate === null
            ? "A taxa de favorabilidade não se aplica."
            : `${Math.round(favorableRate * 100)}% favoráveis · considera a UF de cada parlamentar que assina.`;
        mapTooltip.hidden = false;
        mapTooltip.toggleAttribute("data-pinned", pinned);
        path.setAttribute("aria-expanded", "true");
        activeMapPath = path;
        const bounds = path.getBoundingClientRect();
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
        const path = event.target instanceof Element ? event.target.closest<SVGPathElement>("[data-map-hitboxes] path[data-uf]") : null;
        if (path) showMapTooltip(path, event);
    });
    root.addEventListener("pointerout", (event) => {
        if (event.target instanceof Element && event.target.closest("[data-map-hitboxes] path[data-uf]") && !mapTooltip.hasAttribute("data-pinned")) closeMapTooltip();
    });
    root.addEventListener("focusin", (event) => {
        const path = event.target instanceof Element ? event.target.closest<SVGPathElement>("[data-map-hitboxes] path[data-uf]") : null;
        if (path) showMapTooltip(path);
    });
    root.addEventListener("focusout", (event) => {
        if (event.target instanceof Element && event.target.closest("[data-map-hitboxes] path[data-uf]") && !mapTooltip.hasAttribute("data-pinned")) closeMapTooltip();
    });
    root.addEventListener("click", (event) => {
        const path = event.target instanceof Element ? event.target.closest<SVGPathElement>("[data-map-hitboxes] path[data-uf]") : null;
        if (!path) return;
        const isPinned = activeMapPath === path && mapTooltip.hasAttribute("data-pinned");
        if (isPinned) closeMapTooltip();
        else showMapTooltip(path, event as PointerEvent, true);
    });
    parliamentarianDialog.addEventListener("close", () => lastFocused?.focus());
    parliamentarianDialog.addEventListener("click", (event) => { if (event.target === parliamentarianDialog) parliamentarianDialog.close(); });
    document.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target : null;
        if (!target?.closest("[data-dashboard-tooltip-trigger]")) closeDashboardTooltip();
        if (!target?.closest("[data-map-hitboxes] path[data-uf]")) closeMapTooltip();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        if (!filterPanel.hasAttribute("hidden")) closeFilters();
        if (activeDashboardTooltip) closeDashboardTooltip(true);
        if (activeMapPath) closeMapTooltip(true);
    });

    async function load() {
        status.hidden = false;
        status.className = "activity-status is-loading";
        status.innerHTML = `<span aria-hidden="true"></span><p>Carregando atividade legislativa…</p>`;
        try {
            const response = await fetch("/dados.json");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            hydrateOptions(await response.json());
            syncResponsivePageSize();
            visible = sortItems(all);
            status.hidden = true;
            renderResults();
        } catch (error) {
            console.error(error);
            status.className = "activity-status is-error";
            status.innerHTML = `<p><strong>Não foi possível carregar as proposições.</strong><br />Confira sua conexão e tente novamente.</p><button type="button" data-retry>Tentar novamente</button>`;
            $("[data-results]").setAttribute("hidden", "");
            dashboard.setAttribute("hidden", "");
            pagination.hidden = true;
        }
    }

    setupMobileAccordions();
    load();
}

const initialize = () => document.querySelectorAll<HTMLElement>("[data-activity-root]").forEach(initActivity);
initialize();
document.addEventListener("astro:page-load", initialize);
