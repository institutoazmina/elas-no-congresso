import { papelada, papeladaSize, pileGap } from "../lib/papelada";

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
    const chart = $("[data-chart]");
    const filterPanel = $("[data-filter-panel]");
    const backdrop = $("[data-backdrop]");
    const parliamentarianDialog = $("[data-parliamentarian-dialog]") as HTMLDialogElement;
    const itemsSelect = $("[data-items-per-page]") as HTMLSelectElement;
    const sortSelect = $("[data-sort]") as HTMLSelectElement;
    const apiBase = (import.meta.env.PUBLIC_API_BASE_URL || "https://api.elasnocongresso.com.br/api/v1").replace(/\/$/, "");

    let all: Proposal[] = [];
    let visible: Proposal[] = [];
    let page = 1;
    let activeView: "list" | "charts" = "list";
    let panelAdvanced = false;
    let lastFocused: HTMLElement | null = null;

    const field = (name: string) => filters.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
    const value = (name: string) => field(name)?.value ?? "";

    function hydrateOptions(data: RawData) {
        const proposals: Proposal[] = [];
        const parties = new Set<string>();
        const years = new Set<number>();
        const states = new Set<string>();
        const evaluators = new Set<string>();

        Object.entries(data.legislaturas).forEach(([legislatureId, legislature]) => {
            const people = legislature.parlamentares || {};
            Object.values(legislature.proposicoes || {}).forEach((proposal) => {
                const authors = Object.keys(proposal.autores || {}).map((id) => people[id]).filter(Boolean);
                const year = Number(proposal.numero?.match(/\/(\d{4})/)?.[1] || 0);
                const item: Proposal = {
                    ...proposal,
                    legislatura: Number(proposal.legislatura || legislatureId),
                    year,
                    authors,
                    parties: [...new Set(authors.map((author) => author.partido).filter(Boolean) as string[])],
                    states: [...new Set(authors.map((author) => author.estado).filter(Boolean) as string[])],
                    genders: [...new Set(authors.map((author) => author.genero).filter(Boolean) as string[])],
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
        const sort = sortSelect.value;
        return [...items].sort((a, b) => {
            if (sort === "oldest") return a.year - b.year || a.i - b.i;
            if (sort === "number") return a.numero.localeCompare(b.numero, "pt-BR", { numeric: true });
            if (sort === "assessment") return b.favoravel - a.favoravel;
            return b.year - a.year || b.i - a.i;
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
            const comment = document.createElement("small");
            comment.textContent = "Ler comentários";
            evaluator.append(comment);
        }
        const progress = document.createElement("td");
        progress.innerHTML = `<strong>${(item.quiteria_prob ?? 0) >= .55 ? "Rápida" : "Lenta"}</strong><small>${Math.round((item.quiteria_prob ?? 0) * 100)}% de chance de avançar</small>`;
        const theme = document.createElement("td");
        theme.textContent = "Não classificada";
        const updated = document.createElement("td");
        updated.textContent = String(item.year || "—");
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
        tag.textContent = item.comentario ? "Com ressalvas" : "Sem ressalvas";
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
        $$<HTMLElement>("[data-clear-filters]").forEach((button) => { button.hidden = activeCount === 0; });
    }

    function renderPagination() {
        const pages = Math.max(1, Math.ceil(visible.length / Number(itemsSelect.value)));
        page = Math.min(page, pages);
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
        pagination.hidden = activeView !== "list" || visible.length === 0;
    }

    async function renderChart() {
        chart.replaceChildren();
        const wrapper = document.createElement("div");
        wrapper.className = "activity-chart-card";
        wrapper.innerHTML = `<div class="activity-chart-card__attention"></div><p class="activity-chart-card__eyebrow">Panorama dos resultados</p><h2>Partidos com mais proposições avaliadas</h2><p class="activity-chart-card__description">Comparação entre proposições favoráveis e desfavoráveis aos direitos de meninas e mulheres.</p>`;
        const grouped = new Map<string, { favorable: number; unfavorable: number }>();
        visible.forEach((item) => item.parties.forEach((party) => {
            const stats = grouped.get(party) || { favorable: 0, unfavorable: 0 };
            if (item.favoravel > 0) stats.favorable += 1;
            if (item.favoravel < 0) stats.unfavorable += 1;
            grouped.set(party, stats);
        }));
        const rankings = [...grouped.entries()].sort((a, b) => (b[1].favorable + b[1].unfavorable) - (a[1].favorable + a[1].unfavorable)).slice(0, 5);
        const graph = document.createElement("div");
        graph.className = "activity-chart-bars";
        const peak = Math.max(1, ...rankings.flatMap(([, stats]) => [stats.favorable, stats.unfavorable]));
        const gap = pileGap({ width: 46, height: 180, peak });
        rankings.forEach(([party, stats]) => {
            const group = document.createElement("article");
            const piles = document.createElement("div");
            piles.className = "activity-chart-bars__piles";
            (["unfavorable", "favorable"] as const).forEach((stance) => {
                const pile = document.createElement("div");
                const count = stats[stance];
                const amount = document.createElement("strong");
                amount.textContent = String(count);
                const canvas = document.createElement("canvas");
                const dimensions = papeladaSize({ arrangement: "pile", size: "a4", category: stance === "favorable" ? "favoravel" : "desfavoravel", gap, amount: count });
                canvas.width = dimensions.width;
                canvas.height = dimensions.height;
                canvas.setAttribute("aria-label", `${count} proposições ${stance === "favorable" ? "favoráveis" : "desfavoráveis"}`);
                pile.append(amount, canvas);
                piles.append(pile);
                papelada(canvas, { arrangement: "pile", size: "a4", category: stance === "favorable" ? "favoravel" : "desfavoravel", gap, amount: count }).catch(console.error);
            });
            const label = document.createElement("b");
            label.textContent = party;
            group.append(piles, label);
            graph.append(group);
        });
        const legend = document.createElement("div");
        legend.className = "activity-chart-legend";
        legend.innerHTML = `<span><i class="is-unfavorable"></i>Desfavoráveis</span><span><i class="is-favorable"></i>Favoráveis</span>`;
        wrapper.append(graph, legend);
        chart.append(wrapper);
    }

    function renderResults() {
        const slice = currentSlice();
        tableBody.replaceChildren(...slice.map(createTableRow));
        cards.replaceChildren(...slice.map(createCard));
        empty.hidden = visible.length !== 0;
        $("[data-results]").toggleAttribute("hidden", visible.length === 0 || activeView !== "list");
        chart.hidden = activeView !== "charts";
        if (activeView === "charts") renderChart();
        renderSummary();
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
        filterPanel.removeAttribute("hidden");
        backdrop.removeAttribute("hidden");
        root.classList.add("has-overlay");
        lastFocused = document.activeElement as HTMLElement;
        (filterPanel.querySelector("input, select, button") as HTMLElement | null)?.focus();
    }

    function closeFilters() {
        filterPanel.setAttribute("hidden", "");
        backdrop.setAttribute("hidden", "");
        root.classList.remove("has-overlay");
        lastFocused?.focus();
    }

    async function openParliamentarian(id: string) {
        const author = all.flatMap((item) => item.authors).find((person) => String(person.numero) === id);
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
        const authored = all.filter((item) => item.authors.some((person) => person.numero === author.numero));
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
        }
        if (target.name === "search" && window.matchMedia("(min-width: 768px)").matches) {
            window.clearTimeout(Number(filters.dataset.searchTimer));
            filters.dataset.searchTimer = String(window.setTimeout(applyFilters, 250));
        }
    });
    sortSelect.addEventListener("change", () => { visible = sortItems(visible); page = 1; renderResults(); });
    itemsSelect.addEventListener("change", () => { page = 1; renderResults(); });
    root.addEventListener("click", (event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>("button, a");
        if (!target) return;
        if (target.matches("[data-open-filters]")) openFilters(target.dataset.openFilters === "advanced");
        if (target.matches("[data-close-filters]")) closeFilters();
        if (target.matches("[data-toggle-advanced]")) {
            panelAdvanced = !panelAdvanced;
            filterPanel.classList.toggle("is-advanced", panelAdvanced);
            target.textContent = panelAdvanced ? "Menos filtros" : "Mais filtros";
        }
        if (target.matches("[data-clear-filters]")) resetFilters();
        if (target.matches("[data-view]")) {
            activeView = target.dataset.view as "list" | "charts";
            root.classList.toggle("is-chart-view", activeView === "charts");
            $$<HTMLElement>("[data-view]").forEach((tab) => { tab.classList.toggle("is-active", tab.dataset.view === activeView); tab.setAttribute("aria-selected", String(tab.dataset.view === activeView)); });
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
    parliamentarianDialog.addEventListener("close", () => lastFocused?.focus());
    parliamentarianDialog.addEventListener("click", (event) => { if (event.target === parliamentarianDialog) parliamentarianDialog.close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !filterPanel.hasAttribute("hidden")) closeFilters(); });

    async function load() {
        status.hidden = false;
        status.className = "activity-status is-loading";
        status.innerHTML = `<span aria-hidden="true"></span><p>Carregando atividade legislativa…</p>`;
        try {
            const response = await fetch("/dados.json");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            hydrateOptions(await response.json());
            visible = sortItems(all);
            status.hidden = true;
            renderResults();
        } catch (error) {
            console.error(error);
            status.className = "activity-status is-error";
            status.innerHTML = `<p><strong>Não foi possível carregar as proposições.</strong><br />Confira sua conexão e tente novamente.</p><button type="button" data-retry>Tentar novamente</button>`;
            $("[data-results]").setAttribute("hidden", "");
            pagination.hidden = true;
        }
    }

    load();
}

const initialize = () => document.querySelectorAll<HTMLElement>("[data-activity-root]").forEach(initActivity);
initialize();
document.addEventListener("astro:page-load", initialize);
