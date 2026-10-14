import { Image, css, Photo } from "../shared/react-utils";
import thumbsUp from "../../assets/images/activity/thumbs-up.svg";
import thumbsDown from "../../assets/images/activity/thumbs-down.svg";
import circles from "../../assets/images/activity/parliamentarian-card-circles.svg";
import paperclip from "../../assets/images/activity/author-paperclip.png";
import arrowBack from "../../assets/images/parliamentarians/arrow-back.svg";
import arrowForward from "../../assets/images/parliamentarians/arrow-forward.svg";
import ReportagemCard from "../shared/ReportagemCard";
import { fetchNewsPage } from "../../lib/wp";
import { useNews } from "../../hooks/useNews";
import heroPaper from "../../assets/images/activity/author-hero-paper.png";
import {
    formatApiDate,
    genderLabel,
    houseLabel,
    normalizePhotoUrl,
    partyForTerm,
    type AuthorInitialData,
} from "../../lib/author-page";
import imageAsset8 from "../../assets/images/papelada/proposicao-1-96w.png";
import imageAsset9 from "../../assets/images/papelada/proposicao-desfavoravel-9-96w.png";
import { useMemo, useState } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import BackLink from "../shared/BackLink";
import { groupProposalRatings, paginateItems, selectAuthorReports } from "../../lib/author-page";
import { AuthorRow, AuthorCard, AuthorGroups, sortAuthorProposals } from "./AuthorResults";

interface Props {
    authorId: number;
    house: string;
    initial: AuthorInitialData | null;
}
export default function AuthorPage({
    authorId,
    house,
    initial,
}: Props) {
    const authorName = initial?.person.social_name || initial?.person.full_name || initial?.activity.author.nome || "";
    const initialName = authorName || "Carregando…";
    // Reports citing the author, or the latest ones when none do.
    const reports = useNews(`author:${authorName}`, async (signal) => {
        const related = authorName
            ? await fetchNewsPage({ perPage: 3, orderByDate: true, search: authorName, signal })
            : undefined;
        const latest = related?.posts.length
            ? undefined
            : await fetchNewsPage({ perPage: 3, orderByDate: true, signal });
        return selectAuthorReports(related?.posts ?? [], latest?.posts ?? []);
    });
    const initialPhoto = normalizePhotoUrl(initial?.person.photo_url, initial?.activity.author.foto);
    const initialParty = initial ? partyForTerm(initial.parties, initial.term) : "";
    const initialState = initial?.term.state || initial?.activity.author.estado || "";
    const initialShare =
        initial && initial.activity.favorable + initial.activity.unfavorable > 0
            ? `${initial.activity.favorabilityRate * 100}%`
            : "0%";

    const [sort, setSort] = useState("number");
    const [direction, setDirection] = useState<"ascending" | "descending">("descending");
    const [page, setPage] = useState(1);
    const mobile = useMediaQuery("(max-width: 767px)");
    const proposals = useMemo(
        () =>
            sortAuthorProposals(
                initial?.activity.proposals ?? [],
                sort,
                direction,
                initial?.activity.author.nome ?? "",
            ),
        [initial, sort, direction],
    );
    const shown = paginateItems(proposals, page, mobile ? 5 : 13);
    function sortBy(next: string) {
        setDirection(sort === next && direction === "descending" ? "ascending" : "descending");
        setSort(next);
        setPage(1);
    }

    return (
        <main
            className="author-page tw:min-w-80 tw:overflow-x-clip tw:text-ink tw:font-sans tw:**:[[hidden]]:hidden!"
            data-author-root
            data-author-id={authorId}
            data-author-house={house}
            data-thumbs-up={thumbsUp.src}
            data-thumbs-down={thumbsDown.src}
            style={css(
                `--author-paper: url(${heroPaper.src}); --author-paperclip: url(${paperclip.src}); --author-circles: url(${circles.src}); --author-arrow-back: url(${arrowBack.src}); --author-arrow-forward: url(${arrowForward.src})`,
            )}
        >
            <section
                className="author-hero tw:[&>a]:absolute tw:[&>a]:top-3 tw:[&>a]:left-12 tw:[&>a]:text-[#d0d0fd] tw:[&>a]:text-base tw:[&>a]:font-bold tw:[&>a]:leading-6 tw:[&>a]:no-underline tw:[&_p]:font-display tw:[&_p]:font-bold tw:[&_p]:[font-variation-settings:'wdth'_75] tw:[&_p]:text-center tw:[&_p]:uppercase tw:[&_p]:text-2xl tw:[&_p]:leading-8 tw:[&_p]:m-0 tw:[&_h1]:font-display tw:[&_h1]:font-bold tw:[&_h1]:[font-variation-settings:'wdth'_75] tw:[&_h1]:text-center tw:[&_h1]:uppercase tw:[&_h1]:max-w-180 tw:[&_h1]:text-7xl tw:[&_h1]:leading-18 tw:[&_h1]:m-0 tw:max-md:h-50 tw:max-md:[&>a]:top-3 tw:max-md:[&>a]:left-4 tw:max-md:[&>a]:text-sm tw:max-md:[&_p]:text-base tw:max-md:[&_p]:leading-6 tw:max-md:[&_h1]:text-4xl tw:max-md:[&_h1]:leading-10.5 tw:relative tw:h-52.5 tw:overflow-hidden tw:bg-[#3838d9] tw:bg-(image:--author-paper) tw:bg-blend-multiply tw:bg-center tw:bg-no-repeat tw:bg-cover tw:text-white"
                data-page-hero
                aria-labelledby="author-page-title"
            >
                <BackLink
                    className="tw:hover:text-white tw:hover:underline tw:focus-visible:outline-2 tw:focus-visible:outline-white tw:focus-visible:outline-offset-1"
                    href="/atividade-legislativa"
                    data-history-back
                >
                    ←&nbsp; Voltar ao painel
                </BackLink>
                <div className="tw:flex tw:h-full tw:items-center tw:flex-col tw:pt-11.5 tw:max-md:justify-center tw:max-md:pt-6 tw:max-md:pb-0 tw:max-md:px-4">
                    <p className="">Autoria</p>
                    <h1 className="" id="author-page-title" data-author-hero-name>
                        {initialName}
                    </h1>
                </div>
            </section>

            <section
                className="author-status is-loading tw:flex tw:min-h-139 tw:items-center tw:justify-center tw:flex-col tw:gap-4 tw:text-center tw:p-12 tw:[&_p]:max-w-135 tw:[&_p]:text-base tw:[&_p]:leading-6 tw:[&_p]:m-0 tw:[&_button]:border-0 tw:[&_button]:bg-accent tw:[&_button]:text-white tw:[&_button]:font-bold tw:[&_button]:text-base tw:[&_button]:leading-6 tw:[&_button]:font-sans tw:[&_button]:cursor-pointer tw:[&_button]:py-2.5 tw:[&_button]:px-5 tw:max-md:min-h-125 tw:max-md:py-8 tw:max-md:px-4 tw:[.author-status&_>_span]:w-10 tw:[.author-status&_>_span]:h-10 tw:[.author-status&_>_span]:border-4 tw:[.author-status&_>_span]:border-solid tw:[.author-status&_>_span]:border-[rgb(66_66_246/20%)] tw:[.author-status&_>_span]:border-t-accent tw:[.author-status&_>_span]:rounded-[50%] tw:[.author-status&_>_span]:animate-spin tw:motion-reduce:[.author-status&_>_span]:[animation-duration:1.8s]"
                data-author-status
                role="status"
                aria-live="polite"
                hidden={Boolean(initial)}
            >
                <span className="" aria-hidden="true"></span>
                <p className="">Não foi possível carregar as informações desta autoria.</p>
            </section>

            <div className="" data-author-content hidden={!initial}>
                <section
                    className="author-profile tw:relative tw:min-h-139 tw:border-b-2 tw:border-solid tw:border-b-accent tw:bg-white tw:shadow-[0_-2px_10px_rgb(0_0_0/27%)] tw:max-md:border-b tw:max-md:shadow-[0_-2px_6px_rgb(0_0_0/20%)] "
                    aria-label="Perfil e resumo da pessoa parlamentar"
                >
                    <span
                        className="author-profile__paperclip tw:absolute tw:z-2 tw:-top-5 tw:left-[max(42px,calc(50%-678px))] tw:w-12 tw:h-21.5 tw:[background:var(--author-paperclip)_center/contain_no-repeat] tw:pointer-events-none tw:max-md:left-4 tw:max-md:w-9 tw:max-md:h-16.5 "
                        aria-hidden="true"
                    ></span>
                    <div className="author-profile__inner tw:w-full tw:max-w-360 tw:min-h-139 tw:pt-0 tw:pb-12 tw:pr-20.5 tw:pl-25.5 tw:my-0 tw:mx-auto tw:max-[1101px]:pr-12 tw:max-[1101px]:pl-12 tw:max-md:pt-0 tw:max-md:pb-10 tw:max-md:px-4 ">
                        <p className="author-profile__house tw:inline-flex tw:h-9 tw:items-center tw:gap-2.5 tw:bg-accent tw:text-white tw:font-display tw:text-xl tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:uppercase tw:pt-1.5 tw:pb-1 tw:px-2.5 tw:m-0 tw:[&>span]:w-4 tw:[&>span]:h-2 tw:[&>span]:[background:var(--author-circles)_center/18px_10px_no-repeat] tw:max-md:ml-10.5 tw:max-md:text-base ">
                            <span className="" aria-hidden="true"></span>
                            <b className="" data-author-house-label>
                                {initial ? houseLabel(initial.term.house) : ""}
                            </b>
                        </p>
                        <div className="author-profile__grid tw:mt-12.5 tw:grid tw:grid-cols-[minmax(500px,516px)_minmax(0,676px)] tw:gap-16.5 tw:*:min-w-0 tw:max-[1101px]:grid-cols-[minmax(420px,1fr)_minmax(0,1fr)] tw:max-[1101px]:gap-9 tw:max-[768px]:flex tw:max-[768px]:flex-col tw:max-[768px]:mt-10 tw:max-[768px]:gap-10">
                            <div className="author-identity tw:grid tw:grid-cols-[182px_minmax(0,1fr)] tw:grid-rows-[auto_1fr] tw:gap-x-6 tw:max-[1101px]:grid-cols-[150px_minmax(0,1fr)] tw:max-[768px]:grid-cols-[112px_minmax(0,1fr)] tw:max-[768px]:gap-x-4">
                                <div className="author-identity__photo tw:row-span-2 tw:max-[768px]:row-span-1 tw:[&_img]:block tw:[&_img]:w-full tw:[&_img]:h-full tw:[&_img]:object-cover tw:[&_img]:object-[top_center] tw:[&>span]:absolute tw:[&>span]:inset-0 tw:[&>span]:bg-[#f1f1ff] tw:[&>span]:text-accent tw:[&>span]:font-display tw:[&>span]:text-[54px] tw:[&>span]:font-bold tw:[&>span]:[font-variation-settings:'wdth'_75] tw:max-[1101px]:w-37.5 tw:max-[1101px]:h-50 tw:max-md:h-37.5 tw:relative tw:h-61 tw:overflow-hidden tw:border tw:border-solid tw:border-muted tw:bg-accent tw:[&>span]:flex tw:[&>span]:items-center tw:[&>span]:justify-center tw:w-45.5 tw:shrink-0 tw:max-md:w-28">
                                    <Photo
                                        src={initialPhoto}
                                        name={initialName}
                                        className="tw:w-46 tw:h-61 tw:object-cover tw:object-top"
                                    />
                                </div>
                                <div className="tw:contents">
                                    <div className="author-identity__name tw:pt-2 tw:[&_h2]:font-display tw:[&_h2]:text-4xl tw:[&_h2]:font-bold tw:[&_h2]:[font-variation-settings:'wdth'_75] tw:[&_h2]:leading-10.5 tw:[&_h2]:uppercase tw:[&_h2]:m-0 tw:[&_p]:text-lg tw:[&_p]:font-bold tw:[&_p]:leading-6 tw:[&_p]:mt-2.5 tw:[&_p]:mb-0 tw:[&_p]:mx-0 tw:max-md:[&_h2]:text-[28px] tw:max-md:[&_h2]:leading-8 tw:max-md:[&_p]:text-base tw:max-md:[&_p]:leading-6 ">
                                        <h2 className="" data-author-name>
                                            {initial ? initialName : ""}
                                        </h2>
                                        <p className="" data-author-party-state>
                                            {initial
                                                ? [initialParty, initialState].filter(Boolean).join("/")
                                                : ""}
                                        </p>
                                    </div>
                                    <dl className="author-identity__details tw:max-[768px]:col-span-2 tw:max-md:[&_dt]:w-[42%]! tw:[&_dd]:min-w-0 tw:flex tw:w-80 tw:flex-col tw:gap-1.5 tw:text-sm tw:leading-4 tw:mt-4.5 tw:mb-0 tw:mx-0 tw:max-[1101px]:w-full tw:max-md:w-full tw:max-md:mt-6 tw:max-md:gap-2.5">
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Nascimento</dt>
                                            <dd className="tw:wrap-anywhere tw:m-0" data-author-birth>
                                                {initial ? formatApiDate(initial.person.birth_date) : ""}
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Naturalidade</dt>
                                            <dd className="tw:wrap-anywhere tw:m-0" data-author-birthplace>
                                                {initial?.person.birthplace || "Indisponível"}
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Escolaridade</dt>
                                            <dd className="tw:wrap-anywhere tw:m-0" data-author-education>
                                                {initial?.person.education || "Indisponível"}
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Cor/Raça</dt>
                                            <dd className="tw:wrap-anywhere tw:m-0" data-author-race>
                                                {initial?.person.race || "Indisponível"}
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Gênero</dt>
                                            <dd className="tw:wrap-anywhere tw:m-0" data-author-gender>
                                                {initial
                                                    ? genderLabel(
                                                          initial.person.gender ||
                                                              initial.activity.author.genero,
                                                      )
                                                    : ""}
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Religião</dt>
                                            <dd className="tw:wrap-anywhere tw:m-0" data-author-religion>
                                                {initial?.person.religion || "Indisponível"}
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Frentes que integra</dt>
                                            <dd
                                                className={String.raw`is-unavailable tw:wrap-anywhere tw:m-0 tw:[.author-identity\_\_details_dd&]:text-muted`}
                                            >
                                                Indisponível
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Comissões que integra</dt>
                                            <dd
                                                className={String.raw`is-unavailable tw:wrap-anywhere tw:m-0 tw:[.author-identity\_\_details_dd&]:text-muted`}
                                            >
                                                Indisponível
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Bancadas que integra</dt>
                                            <dd
                                                className={String.raw`is-unavailable tw:wrap-anywhere tw:m-0 tw:[.author-identity\_\_details_dd&]:text-muted`}
                                            >
                                                Indisponível
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Profissões</dt>
                                            <dd className="tw:wrap-anywhere tw:m-0" data-author-profession>
                                                {initial?.person.profession || "Indisponível"}
                                            </dd>
                                        </div>
                                        <div className="tw:gap-2.5 tw:flex tw:*:first:w-36 tw:*:first:shrink-0 tw:*:last:flex-1">
                                            <dt className="tw:m-0">Cargos</dt>
                                            <dd className="tw:wrap-anywhere tw:m-0" data-author-role>
                                                {initial?.term.role ||
                                                    initial?.activity.author.cargo ||
                                                    "Indisponível"}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="author-dashboard tw:flex tw:flex-col tw:gap-12 tw:pt-5 tw:max-md:gap-8 tw:max-md:p-0 ">
                                <section
                                    className="author-summary tw:pt-6 "
                                    aria-label="Resumo das avaliações"
                                >
                                    <div
                                        className="author-summary__bar tw:flex tw:w-full tw:h-3 tw:gap-1 tw:overflow-hidden tw:bg-white tw:[&.is-empty_span]:bg-[#e8e8f4]"
                                        data-author-rating-bar
                                        style={css(`--favorable-share: ${initialShare}`)}
                                    >
                                        <span className="tw:w-(--favorable-share,0%) tw:bg-[#c1e639]"></span>
                                        <span className="tw:flex-1 tw:bg-[#ff5865]"></span>
                                    </div>
                                    <div className="author-summary__scores tw:[&_b]:font-display tw:[&_b]:font-bold tw:[&_b]:[font-variation-settings:'wdth'_75] tw:[&_b]:uppercase tw:[&_b]:text-lg tw:[&_b]:leading-6 tw:[&_strong]:font-display tw:[&_strong]:font-bold tw:[&_strong]:[font-variation-settings:'wdth'_75] tw:[&_strong]:uppercase tw:[&_strong]:text-[28px] tw:[&_strong]:leading-8 tw:max-md:gap-1 tw:max-md:[&_b]:text-sm tw:max-md:[&_b]:leading-4 tw:max-md:[&_strong]:text-2xl tw:mt-2 tw:gap-2.5 tw:flex tw:*:flex-1 tw:*:min-w-0">
                                        <div className="tw:flex tw:h-13.5 tw:items-center tw:gap-2">
                                            <Image
                                                className="author-summary__paper tw:w-9 tw:h-13 tw:-mr-3 tw:object-cover tw:transform-[rotate(5deg)] tw:max-md:hidden "
                                                src={imageAsset8}
                                                alt=""
                                                loading="eager"
                                            />
                                            <Image
                                                className="tw:w-8 tw:h-8 tw:max-md:w-7 tw:max-md:h-7"
                                                src={thumbsUp}
                                                alt=""
                                                loading="eager"
                                            />
                                            <b className="">Favorável</b>
                                            <strong className="" data-author-favorable>
                                                {initial?.activity.favorable || 0}
                                            </strong>
                                        </div>
                                        <div className="tw:flex tw:h-13.5 tw:items-center tw:gap-2 tw:justify-end">
                                            <strong className="" data-author-unfavorable>
                                                {initial?.activity.unfavorable || 0}
                                            </strong>
                                            <b className="">Desfavorável</b>
                                            <Image
                                                className="tw:w-8 tw:h-8 tw:max-md:w-7 tw:max-md:h-7"
                                                src={thumbsDown}
                                                alt=""
                                                loading="eager"
                                            />
                                            <Image
                                                className="author-summary__paper tw:w-9 tw:h-13 tw:object-cover tw:transform-[rotate(5deg)] tw:max-md:hidden tw:mr-0 tw:-ml-3"
                                                src={imageAsset9}
                                                alt=""
                                                loading="eager"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <div className="author-dashboard__cards tw:grid tw:grid-cols-2 tw:items-start tw:gap-4 tw:*:min-w-0 tw:max-[1101px]:grid-cols-1">
                                    <article className="author-dashboard-card tw:min-w-0 tw:bg-white tw:max-md:block tw:max-md:w-full ">
                                        <header className="tw:flex tw:h-6 tw:items-center tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                            <h3 className="tw:flex tw:h-6 tw:items-center tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:[border-bottom:0] tw:rounded-[4px_4px_0_0] tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:pt-1 tw:pb-0.5 tw:pr-1 tw:pl-3 tw:m-0">
                                                Por categoria
                                            </h3>
                                            <span
                                                className="tw:w-4 tw:h-4 tw:ml-1 tw:border tw:border-solid tw:border-accent tw:rounded-[50%] tw:text-accent tw:text-[10px] tw:leading-3.5 tw:text-center"
                                                title="Agrupamento por categoria informado na base"
                                            >
                                                i
                                            </span>
                                        </header>
                                        <div
                                            className="tw:flex tw:min-h-25 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:[border-top:0] tw:flex-col tw:gap-3 tw:p-3 tw:[&.is-empty]:justify-center tw:[&.is-empty]:text-muted tw:[&.is-empty]:text-[14px] tw:[&.is-empty]:leading-4.5"
                                            data-author-category-groups
                                        >
                                            <AuthorGroups
                                                groups={groupProposalRatings(
                                                    initial?.activity.proposals ?? [],
                                                    "categoria",
                                                )}
                                            />
                                        </div>
                                    </article>
                                    <article className="author-dashboard-card tw:min-w-0 tw:bg-white tw:max-md:block tw:max-md:w-full tw:max-[1101px]:hidden">
                                        <header className="tw:flex tw:h-6 tw:items-center tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/25%)]">
                                            <h3 className="tw:flex tw:h-6 tw:items-center tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:[border-bottom:0] tw:rounded-[4px_4px_0_0] tw:font-display tw:text-sm tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-4 tw:uppercase tw:pt-1 tw:pb-0.5 tw:pr-1 tw:pl-3 tw:m-0">
                                                Por tema
                                            </h3>
                                            <span
                                                className="tw:w-4 tw:h-4 tw:ml-1 tw:border tw:border-solid tw:border-accent tw:rounded-[50%] tw:text-accent tw:text-[10px] tw:leading-3.5 tw:text-center"
                                                title="Agrupamento por tema informado na base"
                                            >
                                                i
                                            </span>
                                        </header>
                                        <div
                                            className="tw:flex tw:min-h-25 tw:border tw:border-solid tw:border-[rgb(66_66_246/25%)] tw:[border-top:0] tw:flex-col tw:gap-3 tw:p-3 tw:[&.is-empty]:justify-center tw:[&.is-empty]:text-muted tw:[&.is-empty]:text-[14px] tw:[&.is-empty]:leading-4.5"
                                            data-author-theme-groups
                                        >
                                            <AuthorGroups
                                                groups={groupProposalRatings(
                                                    initial?.activity.proposals ?? [],
                                                    "tema",
                                                )}
                                            />
                                        </div>
                                    </article>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className="author-proposals tw:bg-white tw:pt-6 "
                    aria-labelledby="author-proposals-title"
                >
                    <h2
                        id="author-proposals-title"
                        className="sr-only tw:-m-px tw:absolute! tw:w-px! tw:h-px! tw:overflow-hidden! tw:[clip:rect(0,0,0,0)]! tw:whitespace-nowrap! tw:border-0! tw:p-0!"
                    >
                        Proposições desta autoria
                    </h2>
                    <div className="author-table-wrap tw:w-full tw:overflow-x-auto tw:py-0 tw:px-9.5 tw:max-md:hidden ">
                        <table className="activity-table tw:w-full tw:min-w-336 tw:border-collapse tw:table-fixed tw:[&_th]:h-8.5 tw:[&_th]:border-b tw:[&_th]:border-solid tw:[&_th]:border-b-accent tw:[&_th]:text-ink tw:[&_th]:text-sm tw:[&_th]:font-normal tw:[&_th]:leading-4 tw:[&_th]:text-left tw:[&_th]:p-0 tw:[&_th_button]:flex tw:[&_th_button]:w-full tw:[&_th_button]:min-h-8 tw:[&_th_button]:items-center tw:[&_th_button]:gap-1 tw:[&_th_button]:border-0 tw:[&_th_button]:[background:none] tw:[&_th_button]:text-inherit tw:[&_th_button]:[font:inherit] tw:[&_th_button]:text-left tw:[&_th_button]:cursor-pointer tw:[&_th_button]:p-2 tw:[&_th:nth-child(1)]:w-32 tw:[&_th:nth-child(2)]:w-48 tw:[&_th:nth-child(3)]:w-68 tw:[&_th:nth-child(4)]:w-36 tw:[&_th:nth-child(5)]:w-44 tw:[&_th:nth-child(6)]:w-32 tw:[&_th:nth-child(7)]:w-34 tw:[&_th:nth-child(8)]:w-28 tw:[&_td]:min-h-16 tw:[&_td]:border-b tw:[&_td]:border-solid tw:[&_td]:border-b-[rgb(66_66_246/25%)] tw:[&_td]:align-top tw:[&_td]:text-sm tw:[&_td]:leading-4 tw:[&_td]:p-2 tw:[&_td_>_a:first-child]:text-accent tw:[&_td_>_a:first-child]:font-display tw:[&_td_>_a:first-child]:text-base tw:[&_td_>_a:first-child]:font-bold tw:[&_td_>_a:first-child]:[font-variation-settings:'wdth'_75] tw:[&_td_>_a:first-child]:leading-6 tw:[&_td_>_a:first-child]:no-underline tw:[&_td_>_a:first-child]:uppercase tw:[&_td_>_small]:block tw:[&_td_>_small]:mt-1 tw:[&_td_>_small]:text-[rgb(11_15_94/65%)] tw:[&_td_>_small]:text-xs tw:[&_td_>_small]:leading-4 tw:[&_td:nth-child(3)_p]:line-clamp-3 tw:[&_td:nth-child(3)_p]:m-0">
                            <thead className="">
                                <tr className="">
                                    <th aria-sort={sort === "number" ? direction : undefined} className="">
                                        <button
                                            className=""
                                            type="button"
                                            data-author-sort="number"
                                            onClick={() => sortBy("number")}
                                        >
                                            Proposição
                                        </button>
                                    </th>
                                    <th aria-sort={sort === "author" ? direction : undefined} className="">
                                        <button
                                            className=""
                                            type="button"
                                            data-author-sort="author"
                                            onClick={() => sortBy("author")}
                                        >
                                            Autoria
                                        </button>
                                    </th>
                                    <th aria-sort={sort === "summary" ? direction : undefined} className="">
                                        <button
                                            className=""
                                            type="button"
                                            data-author-sort="summary"
                                            onClick={() => sortBy("summary")}
                                        >
                                            Ementa
                                        </button>
                                    </th>
                                    <th
                                        aria-sort={sort === "assessment" ? direction : undefined}
                                        className=""
                                    >
                                        <button
                                            className=""
                                            type="button"
                                            data-author-sort="assessment"
                                            onClick={() => sortBy("assessment")}
                                        >
                                            Avaliação
                                        </button>
                                    </th>
                                    <th aria-sort={sort === "evaluator" ? direction : undefined} className="">
                                        <button
                                            className=""
                                            type="button"
                                            data-author-sort="evaluator"
                                            onClick={() => sortBy("evaluator")}
                                        >
                                            Quem avaliou?
                                        </button>
                                    </th>
                                    <th aria-sort={sort === "progress" ? direction : undefined} className="">
                                        <button
                                            className=""
                                            type="button"
                                            data-author-sort="progress"
                                            onClick={() => sortBy("progress")}
                                        >
                                            Como está?
                                        </button>
                                    </th>
                                    <th aria-sort={sort === "category" ? direction : undefined} className="">
                                        <button
                                            className=""
                                            type="button"
                                            data-author-sort="category"
                                            onClick={() => sortBy("category")}
                                        >
                                            Categoria
                                        </button>
                                    </th>
                                    <th aria-sort={sort === "updated" ? direction : undefined} className="">
                                        <button
                                            className=""
                                            type="button"
                                            data-author-sort="updated"
                                            onClick={() => sortBy("updated")}
                                        >
                                            Atualização
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="" data-author-table>
                                {shown.items.map((proposal) => (
                                    <AuthorRow
                                        key={proposal.i}
                                        proposal={proposal}
                                        author={initial!.activity.author}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div
                        className="author-proposal-cards tw:hidden tw:max-md:flex tw:max-md:flex-col tw:max-md:py-0 tw:max-md:px-4 "
                        data-author-cards
                    >
                        {shown.items.map((proposal) => (
                            <AuthorCard
                                key={proposal.i}
                                proposal={proposal}
                                author={initial!.activity.author}
                            />
                        ))}
                    </div>
                    <div
                        className="author-proposals__empty tw:min-h-70 tw:text-center tw:py-18 tw:px-6 tw:[&_p]:max-w-130 tw:[&_p]:mt-2 tw:[&_p]:mb-0 tw:[&_p]:mx-auto "
                        data-author-empty
                        hidden={!!proposals.length}
                    >
                        <strong className="">Nenhuma proposição encontrada</strong>
                        <p className="">
                            Esta pessoa parlamentar não possui proposições compatíveis com a base da Atividade
                            Legislativa.
                        </p>
                    </div>
                    <nav
                        className="author-pagination tw:flex tw:min-h-23 tw:items-center tw:justify-between tw:py-6 tw:px-12 tw:[&_p]:text-sm tw:[&_p]:leading-5 tw:[&_p]:m-0 tw:[&_button]:w-14 tw:[&_button]:h-10 tw:[&_button]:overflow-hidden tw:[&_button]:border-2 tw:[&_button]:border-solid tw:[&_button]:border-accent tw:[&_button]:bg-white tw:[&_button]:bg-center tw:[&_button]:bg-size-[24px_16px] tw:[&_button]:bg-no-repeat tw:[&_button]:text-transparent tw:[&_button]:cursor-pointer tw:max-md:py-5 tw:max-md:px-4 "
                        data-author-pagination
                        aria-label="Paginação das proposições"
                        hidden={shown.pages <= 1}
                    >
                        <p className="" data-author-page-label>
                            Página {shown.page} de {shown.pages}
                        </p>
                        <div className="tw:flex tw:gap-1">
                            <button
                                className="tw:bg-(image:--author-arrow-back) tw:disabled:opacity-30 tw:disabled:cursor-default"
                                type="button"
                                disabled={shown.page === 1}
                                onClick={() => setPage(shown.page - 1)}
                                data-author-previous
                                aria-label="Página anterior"
                            >
                                Anterior
                            </button>
                            <button
                                className="tw:bg-(image:--author-arrow-forward) tw:disabled:opacity-30 tw:disabled:cursor-default"
                                type="button"
                                disabled={shown.page === shown.pages}
                                onClick={() => setPage(shown.page + 1)}
                                data-author-next
                                aria-label="Próxima página"
                            >
                                Próxima
                            </button>
                        </div>
                    </nav>
                </section>

                <section
                    className={String.raw`author-reports tw:bg-white tw:pt-12 tw:pb-24 tw:px-12 tw:[&_h2]:max-w-205 tw:[&_h2]:font-display tw:[&_h2]:text-[32px] tw:[&_h2]:font-bold tw:[&_h2]:[font-variation-settings:'wdth'_75] tw:[&_h2]:leading-8 tw:[&_h2]:text-center tw:[&_h2]:uppercase tw:[&_h2]:mt-0 tw:[&_h2]:mb-8 tw:[&_h2]:mx-auto tw:[&>p]:text-muted tw:[&>p]:text-center tw:[&>p]:m-0 tw:max-md:pt-12 tw:max-md:pb-18 tw:max-md:px-4 tw:max-md:[&_h2]:text-[28px] tw:max-md:[&_h2]:leading-8 tw:max-md:[&_h2]:text-left tw:[&_h2_[data-author-reports-name]::before]:[content:'“'] tw:[&_h2_[data-author-reports-name]::after]:[content:'”'] tw:[&_.reportagem-card]:flex tw:[&_.reportagem-card]:min-w-0 tw:[&_.reportagem-card]:flex-col tw:[&_.reportagem-card]:gap-4 tw:[&_.reportagem-card\_\_image]:block tw:[&_.reportagem-card\_\_image]:aspect-384/216 tw:[&_.reportagem-card\_\_image]:overflow-hidden tw:[&_.reportagem-card\_\_image]:border-2 tw:[&_.reportagem-card\_\_image]:border-solid tw:[&_.reportagem-card\_\_image]:border-accent tw:[&_.reportagem-card\_\_image]:cursor-pointer tw:[&_.reportagem-card\_\_image_img]:w-full tw:[&_.reportagem-card\_\_image_img]:h-full tw:[&_.reportagem-card\_\_image_img]:object-cover tw:[&_.reportagem-card_h3]:min-h-16 tw:[&_.reportagem-card_h3]:text-ink tw:[&_.reportagem-card_h3]:font-display tw:[&_.reportagem-card_h3]:text-2xl tw:[&_.reportagem-card_h3]:font-bold tw:[&_.reportagem-card_h3]:[font-variation-settings:'wdth'_75] tw:[&_.reportagem-card_h3]:leading-8 tw:[&_.reportagem-card_h3]:uppercase tw:[&_.reportagem-card_h3]:m-0 tw:[&_.reportagem-card_h3_a]:text-inherit tw:[&_.reportagem-card_h3_a]:no-underline tw:[&_.reportagem-card_h3_a:hover]:text-inherit tw:[&_.reportagem-card_h3_a:hover]:no-underline tw:[&_.reportagem-card_h3_a:focus-visible]:outline-2 tw:[&_.reportagem-card_h3_a:focus-visible]:outline-accent tw:[&_.reportagem-card_h3_a:focus-visible]:outline-offset-1 tw:[&_.reportagem-card\_\_details]:flex tw:[&_.reportagem-card\_\_details]:flex-col tw:[&_.reportagem-card\_\_details]:gap-4 tw:[&_.reportagem-card\_\_link]:inline-flex tw:[&_.reportagem-card\_\_link]:self-start tw:[&_.reportagem-card\_\_link]:h-9.5 tw:[&_.reportagem-card\_\_link]:items-center tw:[&_.reportagem-card\_\_link]:gap-2 tw:[&_.reportagem-card\_\_link]:bg-accent tw:[&_.reportagem-card\_\_link]:text-white tw:[&_.reportagem-card\_\_link]:font-display tw:[&_.reportagem-card\_\_link]:text-lg tw:[&_.reportagem-card\_\_link]:font-bold tw:[&_.reportagem-card\_\_link]:[font-variation-settings:'wdth'_75] tw:[&_.reportagem-card\_\_link]:leading-6 tw:[&_.reportagem-card\_\_link]:no-underline tw:[&_.reportagem-card\_\_link]:uppercase tw:[&_.reportagem-card\_\_link]:pt-2 tw:[&_.reportagem-card\_\_link]:pb-1.5 tw:[&_.reportagem-card\_\_link]:pr-3 tw:[&_.reportagem-card\_\_link]:pl-3.5 tw:[&_.reportagem-card\_\_link_img]:w-3 tw:[&_.reportagem-card\_\_link_img]:h-1.5 tw:[&_.reportagem-card\_\_link_img]:transform-[rotate(-90deg)] tw:[&_.reportagem-card\_\_date]:text-navy tw:[&_.reportagem-card\_\_date]:text-sm tw:[&_.reportagem-card\_\_date]:leading-4 tw:max-md:[&_.reportagem-card]:flex-[0_0_min(320px,calc(100vw-48px))] tw:max-md:[&_.reportagem-card]:snap-start tw:max-md:[&_.reportagem-card_h3]:min-h-0 tw:max-md:[&_.reportagem-card_h3]:text-xl tw:max-md:[&_.reportagem-card_h3]:leading-6`}
                    data-author-reports
                    aria-labelledby="author-reports-title"
                    aria-busy={!reports}
                >
                    <h2 className="" id="author-reports-title">
                        <span
                            className=""
                            data-author-reports-related-title
                            hidden={(reports?.title ?? "related") !== "related"}
                        >
                            Reportagens que citam
                            <br className="" />
                            <span className="" data-author-reports-name>
                                {initialName}
                            </span>
                        </span>
                        <span
                            className=""
                            data-author-reports-latest-title
                            hidden={reports?.title !== "latest"}
                        >
                            Reportagens mais recentes
                        </span>
                    </h2>
                    <div
                        className="tw:max-w-312 tw:gap-12 tw:my-0 tw:mx-auto tw:max-md:flex tw:max-md:overflow-x-auto tw:max-md:gap-6 tw:max-md:[scroll-snap-type:x_mandatory] tw:flex tw:*:min-w-0 tw:*:flex-1 tw:*:grow"
                        data-author-reports-grid
                    >
                        {reports?.reports.map((post) => (
                            <ReportagemCard key={post.link} post={post} />
                        ))}
                    </div>
                    <p className="" data-author-reports-empty hidden={!reports || reports.reports.length > 0}>
                        Nenhuma reportagem relacionada foi encontrada.
                    </p>
                </section>
            </div>
        </main>
    );
}
