import {
    assertSuccessfulApiStatus,
    buildAuthorActivityFromApi,
    formatApiDate,
    genderLabel,
    groupProposalRatings,
    authorRoute,
    houseLabel,
    normalizePhotoUrl,
    paginateItems,
    partyForTerm,
    type ApiParliamentarian,
    type ApiParty,
    type AuthorActivity,
    type AuthorInitialData,
    type AuthorProposal,
    type ParliamentarianTerm,
    type RatingGroup,
} from "../lib/author-page";
import { fetchActivity } from "../lib/activity-api";
import { PUBLIC_API_BASE_URL } from "astro:env/client";
import { extractPropositionYear, formatPresentedDate } from "../lib/canonical";
import { propositionRoute } from "../lib/proposition-utils";

type AuthorSort = "number" | "author" | "summary" | "assessment" | "evaluator" | "progress" | "category" | "updated";
type AuthorWindow = Window & { __authorPageAbortController?: AbortController };

const authorWindow = window as AuthorWindow;
const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const formatNumber = new Intl.NumberFormat("pt-BR");
const unavailable = (value: unknown) => String(value ?? "").trim() || "Indisponível";

async function fetchJson<T>(url: string, signal: AbortSignal): Promise<T> {
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal });
    try {
        assertSuccessfulApiStatus(response.status);
    } catch {
        throw new Error(`HTTP ${response.status} em ${new URL(url, window.location.href).pathname}`);
    }
    return response.json() as Promise<T>;
}

function initAuthorPage() {
    const rootCandidate = document.querySelector<HTMLElement>("[data-author-root]");
    if (!rootCandidate) {
        authorWindow.__authorPageAbortController?.abort();
        authorWindow.__authorPageAbortController = undefined;
        return;
    }
    const root = rootCandidate;
    if (root.dataset.initialized === "true") return;
    root.dataset.initialized = "true";

    authorWindow.__authorPageAbortController?.abort();
    const controller = new AbortController();
    authorWindow.__authorPageAbortController = controller;
    const { signal } = controller;
    const $ = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
    const $$ = <T extends Element = HTMLElement>(selector: string) => [...root.querySelectorAll<T>(selector)];
    const imageTemplates = new Map([...root.querySelectorAll<HTMLTemplateElement>("template[data-author-image]")].map(template => [template.dataset.authorImage!, template]));
    const cloneImage = (src: string) => imageTemplates.get(src.replace(/^http:/, "https:"))?.content.querySelector("img")?.cloneNode(true) as HTMLImageElement | undefined;
    const authorId = Number(root.dataset.authorId);
    const mobileViewport = window.matchMedia("(max-width: 767px)");
    let activity: AuthorActivity | null = null;
    let initialData: AuthorInitialData | null = null;
    const initialNode = document.querySelector<HTMLScriptElement>("[data-author-initial]");
    if (initialNode?.textContent) {
        try {
            initialData = JSON.parse(initialNode.textContent) as AuthorInitialData;
        } catch (error) {
            console.error("Dados iniciais da autoria inválidos", error);
        }
    }
    let page = 1;
    let sort: AuthorSort = "number";
    let direction: "ascending" | "descending" = "descending";

    function initials(name: string) {
        return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    }

    function setText(selector: string, value: unknown) {
        $(selector).textContent = unavailable(value);
        $(selector).classList.toggle("is-unavailable", unavailable(value) === "Indisponível");
    }

    function showStatus(kind: "loading" | "error" | "not-found", message?: string) {
        const status = $("[data-author-status]");
        status.hidden = false;
        for (const state of ["loading", "error", "not-found"]) status.classList.toggle(`is-${state}`, state === kind);
        if (kind === "loading") {
            status.innerHTML = `<span aria-hidden="true"></span><p>${message || "Carregando informações da autoria…"}</p>`;
        } else if (kind === "not-found") {
            status.innerHTML = `<p><strong>Parlamentar não encontrado.</strong><br />O identificador informado não está disponível na Atividade Legislativa.</p><a href="/atividade-legislativa">Voltar ao painel</a>`;
        } else {
            status.innerHTML = `<p><strong>Não foi possível carregar as informações.</strong><br />Confira sua conexão e tente novamente.</p><button type="button" data-author-retry>Tentar novamente</button>`;
        }
        $("[data-author-content]").setAttribute("hidden", "");
    }

    function setPhoto(source: string | null | undefined, name: string) {
        const image = $<HTMLImageElement>("[data-author-photo]");
        const fallback = $("[data-author-photo-fallback]");
        fallback.textContent = initials(name);
        const useFallback = () => {
            image.hidden = true;
            fallback.hidden = false;
        };
        const normalizedSource = normalizePhotoUrl(source);
        if (!normalizedSource) {
            useFallback();
            return;
        }
        image.alt = `Foto de ${name}`;
        image.onload = () => { image.hidden = false; fallback.hidden = true; };
        image.onerror = useFallback;
        image.src = normalizedSource;
    }

    function createGroupedRows(targetSelector: string, groups: RatingGroup[]) {
        const target = $(targetSelector);
        if (groups.length === 0) {
            target.classList.add("is-empty");
            target.textContent = "Não informado na base da Atividade Legislativa";
            return;
        }
        target.classList.remove("is-empty");
        const shown = groups.slice(0, 3);
        const peak = Math.max(1, ...shown.flatMap((group) => [group.favorable, group.unfavorable]));
        target.replaceChildren(...shown.map((group) => {
            const row = document.createElement("div");
            row.className = "author-dashboard-card__row tw:grid tw:grid-cols-[minmax(0,1fr)_38px_80px] tw:min-h-8 tw:items-center tw:gap-1.5 tw:text-sm tw:leading-4 tw:[&_>_span:first-child]:overflow-hidden tw:[&_>_span:first-child]:text-ellipsis tw:[&_>_span:first-child]:whitespace-nowrap";
            const label = document.createElement("span");
            label.textContent = group.label;
            label.title = group.label;
            const values = document.createElement("span");
            values.className = "author-dashboard-card__values tw:flex tw:items-end tw:flex-col tw:text-[rgb(11_15_94_/_75%)] tw:text-xs tw:leading-3";
            values.innerHTML = `<span>${formatNumber.format(group.favorable)}</span><span>${formatNumber.format(group.unfavorable)}</span>`;
            const bars = document.createElement("span");
            bars.className = "author-dashboard-card__bars tw:flex tw:h-5 tw:border-l tw:border-solid tw:border-l-ink tw:flex-col tw:gap-1 tw:py-0.5 tw:px-0 tw:[&_span]:block tw:[&_span]:h-1.5 tw:[&_span]:w-[var(--bar-width,_0%)] tw:[&_span:first-child]:bg-[#c1e639] tw:[&_span:last-child]:bg-[#ff5865]";
            const favorable = document.createElement("span");
            const unfavorable = document.createElement("span");
            favorable.style.setProperty("--bar-width", `${(group.favorable / peak) * 100}%`);
            unfavorable.style.setProperty("--bar-width", `${(group.unfavorable / peak) * 100}%`);
            bars.append(favorable, unfavorable);
            row.append(label, values, bars);
            return row;
        }));
    }

    function stanceData(proposal: AuthorProposal) {
        if (proposal.favoravel > 0) return { label: "Favorável", icon: root.dataset.thumbsUp || "", className: "is-favorable" };
        if (proposal.favoravel < 0) return { label: "Desfavorável", icon: root.dataset.thumbsDown || "", className: "is-unfavorable" };
        return { label: "Sem avaliação", icon: "", className: "is-unrated" };
    }

    function createStance(proposal: AuthorProposal) {
        const data = stanceData(proposal);
        const element = document.createElement("span");
        element.className = `activity-table__stance tw:flex tw:items-center tw:gap-1.5 tw:[&_img]:w-6 tw:[&_img]:h-6 ${data.className}`;
        if (data.icon) {
            const icon = cloneImage(data.icon);
            if (icon) element.append(icon);
        }
        element.append(document.createTextNode(data.label));
        return element;
    }

    function createAuthorLink(proposal: AuthorProposal) {
        const author = activity!.author;
        const link = document.createElement("a");
        link.className = "activity-table__author tw:flex tw:items-center tw:gap-2 tw:text-inherit tw:no-underline tw:[&_img]:w-7.5 tw:[&_img]:h-10 tw:[&_img]:flex-none tw:[&_img]:border tw:[&_img]:border-solid tw:[&_img]:border-muted tw:[&_img]:object-cover tw:[&_img]:object-[top_center] tw:[&_>_span]:flex tw:[&_>_span]:min-w-0 tw:[&_>_span]:flex-col tw:[&_strong]:overflow-hidden tw:[&_strong]:text-ellipsis tw:[&_strong]:whitespace-nowrap tw:[&_small]:text-[rgb(11_15_94_/_65%)] tw:[&_small]:text-xs tw:[&_small]:leading-4";
        link.href = authorRoute(author.nome) || "/atividade-legislativa";
        link.setAttribute("aria-label", `Ver página de autoria de ${author.nome}`);
        const image = author.foto ? cloneImage(author.foto) : undefined;
        if (image) {
            image.onerror = () => {
                const fallback = document.createElement("span");
                fallback.className = "activity-table__author-fallback tw:w-7.5 tw:h-10 tw:flex-none tw:border tw:border-solid tw:border-muted tw:object-cover tw:object-[top_center] tw:bg-[#f1f1ff] tw:text-accent tw:font-bold tw:flex tw:items-center tw:justify-center";
                fallback.textContent = initials(author.nome);
                image.replaceWith(fallback);
            };
            link.append(image);
        } else {
            const fallback = document.createElement("span");
            fallback.className = "activity-table__author-fallback tw:w-7.5 tw:h-10 tw:flex-none tw:border tw:border-solid tw:border-muted tw:object-cover tw:object-[top_center] tw:bg-[#f1f1ff] tw:text-accent tw:font-bold tw:flex tw:items-center tw:justify-center";
            fallback.textContent = initials(author.nome);
            link.append(fallback);
        }
        const copy = document.createElement("span");
        const name = document.createElement("strong");
        name.textContent = author.nome;
        const meta = document.createElement("small");
        meta.textContent = [author.partido, author.estado].filter(Boolean).join("/");
        copy.append(name, meta);
        link.append(copy);
        if (proposal.authors.length > 1) link.title = `Também possui ${proposal.authors.length - 1} coautoria(s)`;
        return link;
    }

    function createTableRow(proposal: AuthorProposal) {
        const row = document.createElement("tr");
        const number = document.createElement("td");
        const proposalLink = document.createElement("a");
        proposalLink.href = propositionRoute(proposal.numero) || "/atividade-legislativa";
        proposalLink.textContent = proposal.numero;
        const house = document.createElement("small");
        house.textContent = normalize(proposal.casa).includes("sen") ? "Senado" : "Câmara";
        number.append(proposalLink, house);
        const author = document.createElement("td");
        author.append(createAuthorLink(proposal));
        const summary = document.createElement("td");
        const summaryText = document.createElement("p");
        summaryText.textContent = proposal.resumo;
        summaryText.title = proposal.resumo;
        summary.append(summaryText);
        const assessment = document.createElement("td");
        assessment.append(createStance(proposal));
        if (proposal.comentario) {
            const comment = document.createElement("small");
            comment.textContent = "Com ressalvas";
            assessment.append(comment);
        }
        const evaluator = document.createElement("td");
        evaluator.textContent = proposal.avaliador || "—";
        const progress = document.createElement("td");
        const progressLabel = (proposal.quiteria_prob ?? 0) >= .55 ? "Rápida" : "Lenta";
        progress.innerHTML = `<strong>${progressLabel}</strong><small>${Math.round((proposal.quiteria_prob ?? 0) * 100)}% de chance de avançar</small>`;
        const category = document.createElement("td");
        category.textContent = proposal.categoria || "Não informada";
        const updated = document.createElement("td");
        // Coluna "Atualização": mesma origem/regra da tabela principal —
        // data de apresentação (apresentadaEm); nunca updated_at técnico.
        updated.textContent = proposal.apresentadaEm ? formatPresentedDate(proposal.apresentadaEm) : "—";
        updated.title = proposal.apresentadaEm ? "Data de apresentação (API oficial)" : "Sem data de apresentação na API oficial";
        row.append(number, author, summary, assessment, evaluator, progress, category, updated);
        return row;
    }

    function createMobileCard(proposal: AuthorProposal) {
        const card = document.createElement("article");
        card.className = "author-card tw:max-md:flex tw:max-md:border-b tw:max-md:border-solid tw:max-md:border-b-[rgb(66_66_246_/_25%)] tw:max-md:flex-col tw:max-md:gap-2.5 tw:max-md:py-4 tw:max-md:px-0 tw:max-md:[&_header]:flex tw:max-md:[&_header]:justify-between tw:max-md:[&_header]:gap-3 tw:max-md:[&_header_>_span]:flex tw:max-md:[&_header_>_span]:flex-col tw:max-md:[&_footer]:flex tw:max-md:[&_footer]:justify-between tw:max-md:[&_footer]:gap-3 tw:max-md:[&_footer]:text-xs tw:max-md:[&_footer]:leading-4 tw:max-md:[&_footer_>_span]:flex tw:max-md:[&_footer_>_span]:flex-col tw:max-md:[&_footer_>_span:last-child]:text-right";
        const header = document.createElement("header");
        const identity = document.createElement("span");
        const link = document.createElement("a");
        link.className = "author-card__number tw:text-accent tw:font-display tw:text-base tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:no-underline tw:uppercase tw:max-md:text-lg";
        link.href = propositionRoute(proposal.numero) || "/atividade-legislativa";
        link.textContent = proposal.numero;
        const house = document.createElement("small");
        house.textContent = normalize(proposal.casa).includes("sen") ? "Senado" : "Câmara";
        identity.append(link, house);
        header.append(identity, createStance(proposal));
        const category = document.createElement("small");
        category.textContent = proposal.categoria || "Categoria não informada";
        card.append(header, category, createAuthorLink(proposal));
        const summary = document.createElement("p");
        summary.className = "author-card__summary tw:max-md:text-[rgb(11_15_94_/_75%)] tw:max-md:text-sm tw:max-md:leading-[18px] tw:max-md:m-0";
        summary.textContent = proposal.resumo;
        const footer = document.createElement("footer");
        const evaluator = document.createElement("span");
        evaluator.innerHTML = `<strong>${proposal.avaliador || "Sem avaliação"}</strong><small>${proposal.comentario ? "Com ressalvas" : "Sem ressalvas"}</small>`;
        const progress = document.createElement("span");
        progress.innerHTML = `<strong>${(proposal.quiteria_prob ?? 0) >= .55 ? "Rápida" : "Lenta"}</strong><small>Tramitação estimada</small>`;
        footer.append(evaluator, progress);
        card.append(summary, footer);
        return card;
    }

    function sortedProposals() {
        const proposals = [...(activity?.proposals || [])];
        const text = (item: AuthorProposal) => {
            if (sort === "number") return item.numero;
            if (sort === "author") return activity?.author.nome || "";
            if (sort === "summary") return item.resumo;
            if (sort === "evaluator") return item.avaliador || "";
            if (sort === "category") return item.categoria || "";
            return "";
        };
        const numeric = (item: AuthorProposal) => {
            if (sort === "assessment") return item.favoravel;
            if (sort === "progress") return item.quiteria_prob ?? 0;
            // "Atualização": mesma semântica da tabela principal — chave temporal
            // (ano da apresentação × 1e6 + índice), nunca o texto DD/MM/AAAA.
            if (sort === "updated") return extractPropositionYear(item.apresentadaEm, item.numero) * 1_000_000 + item.i;
            return 0;
        };
        const multiplier = direction === "ascending" ? 1 : -1;
        return proposals.sort((a, b) => {
            if (["assessment", "progress", "updated"].includes(sort)) return (numeric(a) - numeric(b)) * multiplier;
            return text(a).localeCompare(text(b), "pt-BR", { numeric: true }) * multiplier;
        });
    }

    function renderProposals() {
        const proposals = sortedProposals();
        const pageSize = mobileViewport.matches ? 5 : 13;
        const paginationState = paginateItems(proposals, page, pageSize);
        page = paginationState.page;
        const { pages } = paginationState;
        const shown = paginationState.items;
        $("[data-author-table]").replaceChildren(...shown.map(createTableRow));
        $("[data-author-cards]").replaceChildren(...shown.map(createMobileCard));
        $("[data-author-empty]").toggleAttribute("hidden", proposals.length !== 0);
        const pagination = $("[data-author-pagination]");
        pagination.toggleAttribute("hidden", pages <= 1);
        $("[data-author-page-label]").textContent = `Página ${page} de ${pages}`;
        $<HTMLButtonElement>("[data-author-previous]").disabled = page === 1;
        $<HTMLButtonElement>("[data-author-next]").disabled = page === pages;
    }

    function renderProfile(person: ApiParliamentarian, term: ParliamentarianTerm, parties: ApiParty[]) {
        if (!activity) return;
        const name = unavailable(person.social_name || person.full_name || activity.author.nome);
        const party = partyForTerm(parties, term);
        const state = unavailable(term?.state || activity.author.estado);
        $("[data-author-hero-name]").textContent = name;
        $("[data-author-name]").textContent = name;
        $("[data-author-party-state]").textContent = [party, state].filter((value) => value !== "Indisponível").join("/") || "Indisponível";
        $("[data-author-house-label]").textContent = houseLabel(term?.house || activity.author.cargo);
        setPhoto(person.photo_url || activity.author.foto, name);
        setText("[data-author-birth]", formatApiDate(person.birth_date));
        setText("[data-author-birthplace]", person.birthplace);
        setText("[data-author-education]", person.education);
        setText("[data-author-race]", person.race);
        setText("[data-author-gender]", genderLabel(person.gender || activity.author.genero));
        setText("[data-author-religion]", person.religion);
        setText("[data-author-profession]", person.profession);
        setText("[data-author-role]", term?.role || activity.author.cargo);
        $("[data-author-favorable]").textContent = formatNumber.format(activity.favorable);
        $("[data-author-unfavorable]").textContent = formatNumber.format(activity.unfavorable);
        const bar = $("[data-author-rating-bar]");
        bar.style.setProperty("--favorable-share", `${activity.favorabilityRate * 100}%`);
        bar.classList.toggle("is-empty", activity.favorable + activity.unfavorable === 0);
        createGroupedRows("[data-author-category-groups]", groupProposalRatings(activity.proposals, "categoria"));
        createGroupedRows("[data-author-theme-groups]", groupProposalRatings(activity.proposals, "tema"));
        $("[data-author-reports-name]").textContent = name;
        document.title = `${name} | Autoria | Elas no Congresso`;
        renderProposals();
        $("[data-author-status]").setAttribute("hidden", "");
        $("[data-author-content]").removeAttribute("hidden");
    }

    async function load() {
        showStatus("loading");
        try {
            if (!initialData) {
                const apiBase = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)
                    ? `${location.origin}/api/v1`
                    : PUBLIC_API_BASE_URL;
                activity = buildAuthorActivityFromApi(await fetchActivity(apiBase, signal), authorId);
                if (!activity) {
                    showStatus("not-found");
                    return;
                }
                showStatus("error", "Os dados iniciais desta autoria não foram gerados.");
                return;
            }
            activity = initialData.activity;
            if (!activity) {
                showStatus("not-found");
                return;
            }
            renderProfile(initialData.person, initialData.term, initialData.parties);
        } catch (error) {
            if ((error as Error).name === "AbortError") return;
            console.error("Falha ao carregar página de autoria", error);
            showStatus("error");
        }
    }

    root.addEventListener("click", (event) => {
        const target = (event.target as Element).closest<HTMLElement>("button");
        if (!target) return;
        if (target.matches("[data-author-retry]")) void load();
        if (target.matches("[data-author-previous]")) { page = Math.max(1, page - 1); renderProposals(); }
        if (target.matches("[data-author-next]")) { page += 1; renderProposals(); }
        if (target.matches("[data-author-sort]")) {
            const next = target.dataset.authorSort as AuthorSort;
            direction = sort === next && direction === "descending" ? "ascending" : "descending";
            sort = next;
            page = 1;
            $$<HTMLButtonElement>("[data-author-sort]").forEach((button) => button.classList.toggle("is-active", button === target));
            renderProposals();
        }
    }, { signal });
    mobileViewport.addEventListener("change", () => { page = 1; if (activity) renderProposals(); }, { signal });
    void load();
}

initAuthorPage();
document.addEventListener("astro:page-load", initAuthorPage);
