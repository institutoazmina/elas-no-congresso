import { Image, cx } from "../shared/react-utils";
import attention from "../../assets/images/party-chart/attention.svg";
import buttonChevron from "../../assets/images/home-reportagens/chevron-right.svg";
import mapBase from "../../assets/images/charts/map/map-br-base@2.5x.webp";
import mapLabels from "../../assets/images/charts/map/map-br-labels@2.5x.webp";
import mapHitboxes from "../../assets/images/charts/map/map-br-ufs-vector.svg?raw";
import rankingHighlighter1a from "../../assets/images/charts/table-ranking-highlighter-1-a.svg";
import rankingHighlighter1b from "../../assets/images/charts/table-ranking-highlighter-1-b.svg";
import rankingHighlighter2a from "../../assets/images/charts/table-ranking-highlighter-2-a.svg";
import rankingHighlighter2b from "../../assets/images/charts/table-ranking-highlighter-2-b.svg";
import rankingHighlighter3a from "../../assets/images/charts/table-ranking-highlighter-3-a.svg";
import rankingHighlighter3b from "../../assets/images/charts/table-ranking-highlighter-3-b.svg";
import rankingHighlighter4a from "../../assets/images/charts/table-ranking-highlighter-4-a.svg";
import rankingHighlighter4b from "../../assets/images/charts/table-ranking-highlighter-4-b.svg";
import rankingHighlighter5a from "../../assets/images/charts/table-ranking-highlighter-5-a.svg";
import rankingHighlighter5b from "../../assets/images/charts/table-ranking-highlighter-5-b.svg";
import favorableRankingHighlighter1a from "../../assets/images/charts/table-ranking-highlighter-favorable-1-a.svg";
import favorableRankingHighlighter1b from "../../assets/images/charts/table-ranking-highlighter-favorable-1-b.svg";
import favorableRankingHighlighter2a from "../../assets/images/charts/table-ranking-highlighter-favorable-2-a.svg";
import favorableRankingHighlighter2b from "../../assets/images/charts/table-ranking-highlighter-favorable-2-b.svg";
import favorableRankingHighlighter3a from "../../assets/images/charts/table-ranking-highlighter-favorable-3-a.svg";
import favorableRankingHighlighter3b from "../../assets/images/charts/table-ranking-highlighter-favorable-3-b.svg";
import favorableRankingHighlighter4a from "../../assets/images/charts/table-ranking-highlighter-favorable-4-a.svg";
import favorableRankingHighlighter4b from "../../assets/images/charts/table-ranking-highlighter-favorable-4-b.svg";
import favorableRankingHighlighter5a from "../../assets/images/charts/table-ranking-highlighter-favorable-5-a.svg";
import favorableRankingHighlighter5b from "../../assets/images/charts/table-ranking-highlighter-favorable-5-b.svg";
import StanceToggle from "./StanceToggle";
import SectionDivider from "../shared/SectionDivider";
import type { Stance } from "../../service/api/stats";
const MAP_HIGHLIGHTS = 5;
const tableRankingHighlighters = [
    [rankingHighlighter1a, rankingHighlighter1b],
    [rankingHighlighter2a, rankingHighlighter2b],
    [rankingHighlighter3a, rankingHighlighter3b],
    [rankingHighlighter4a, rankingHighlighter4b],
    [rankingHighlighter5a, rankingHighlighter5b],
] as const;
const favorableTableRankingHighlighters = [
    [favorableRankingHighlighter1a, favorableRankingHighlighter1b],
    [favorableRankingHighlighter2a, favorableRankingHighlighter2b],
    [favorableRankingHighlighter3a, favorableRankingHighlighter3b],
    [favorableRankingHighlighter4a, favorableRankingHighlighter4b],
    [favorableRankingHighlighter5a, favorableRankingHighlighter5b],
] as const;

import { useState } from "react";

export default function UfProjectsChart({
    views,
    highlights,
    ufData,
    ufLabels,
}: {
    views: {
        stance: Stance;
        heading: string;
        rows: { uf: string; unfavorable: number; favorable: number; total: number; share: number }[];
    }[];
    highlights: {
        stance: Stance;
        ufs: string[];
        layers: { uf: string; image: import("astro").ImageMetadata }[];
    }[];
    ufData: Record<string, { favorable: number; unfavorable: number }>;
    ufLabels: Record<string, string>;
}) {
    const [stance, setStance] = useState<Stance>("unfavorable");
    const [panel, setPanel] = useState("map");
    const [activeUf, setActiveUf] = useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    function showUf(uf: string, x: number, y: number) {
        setActiveUf(uf);
        setTooltipPosition({
            x: Math.max(16, Math.min(x + 16, window.innerWidth - 256)),
            y: Math.max(16, Math.min(y + 16, window.innerHeight - 130)),
        });
    }
    return (
        <section
            className="
    uf-projects-chart tw:relative tw:min-h-316.5 tw:overflow-hidden tw:bg-white tw:shadow-[0_48px_0_#fff] tw:text-ink
    tw:font-sans tw:[&_h2]:w-131.5 tw:[&_h2]:h-16.5 tw:[&_h2]:font-display tw:[&_h2]:text-4xl tw:[&_h2]:font-bold
    tw:[&_h2]:leading-8 tw:[&_h2]:uppercase tw:[&_h2]:[font-variation-settings:'wdth'_75] tw:[&_h2]:m-0 tw:[&_p]:m-0
    tw:max-md:min-h-0 tw:max-md:overflow-visible tw:max-md:pt-6 tw:max-md:pb-12 tw:max-md:px-6
    tw:max-md:[&_h2]:w-full tw:max-md:[&_h2]:h-auto tw:max-md:[&_h2]:max-w-83 tw:max-md:[&_h2]:text-[28px]
    tw:max-md:[&_h2]:leading-8 tw:min-[821px]:h-304.5 tw:min-[821px]:min-h-304.5 tw:min-[821px]:[&_h2]:w-131.5
    tw:min-[821px]:[&_h2]:text-4xl tw:min-[821px]:[&_h2]:font-bold
    tw:[&[data-panel='map']_[data-panel-view='table']]:hidden
    tw:[&[data-panel='table']_[data-panel-view='map']]:hidden
    tw:[&[data-stance='unfavorable']_[data-stance-view='favorable']]:hidden
    tw:[&[data-stance='favorable']_[data-stance-view='unfavorable']]:hidden
"
            data-stance={stance}
            data-panel={panel}
            aria-labelledby="uf-projects-chart-title"
        >
            <div
                className="
        uf-projects-chart__container tw:relative tw:w-204 tw:h-302.5 tw:p-12 tw:my-0 tw:mx-auto tw:max-md:w-full
        tw:max-md:h-auto tw:max-md:p-0 tw:min-[821px]:h-290.5 tw:min-[821px]:py-6 tw:min-[821px]:px-12
    "
            >
                <header
                    className="
            uf-projects-chart__header tw:flex tw:w-180 tw:h-61.5 tw:flex-col tw:items-start tw:gap-4 tw:[&>p]:w-180
            tw:[&>p]:h-18 tw:[&>p]:text-lg tw:[&>p]:font-normal tw:[&>p]:leading-6
            tw:max-md:w-[min(344px,calc(100%+16px))] tw:max-md:h-auto tw:max-md:-ml-2 tw:max-md:items-start
            tw:max-md:gap-4 tw:max-md:text-left tw:max-md:[&>p]:w-full tw:max-md:[&>p]:h-auto tw:max-md:[&>p]:max-w-none
            tw:max-md:[&>p]:basis-auto tw:max-md:[&>p]:self-stretch tw:max-md:[&>p]:text-sm tw:max-md:[&>p]:font-normal
            tw:max-md:[&>p]:leading-6 tw:max-md:[&>p]:text-left tw:min-[821px]:h-auto tw:min-[821px]:gap-4
            tw:min-[821px]:[&>p]:w-180 tw:min-[821px]:[&>p]:h-18 tw:min-[821px]:[&>p]:text-lg
            tw:min-[821px]:[&>p]:font-normal tw:min-[821px]:[&>p]:leading-6 tw:min-[821px]:[&>p]:m-0
        "
                >
                    <Image
                        className="uf-projects-chart__attention tw:block tw:w-24 tw:h-1 tw:min-[821px]:w-24 tw:min-[821px]:h-1"
                        src={attention}
                        alt=""
                    />
                    <div
                        className={String.raw`
                uf-projects-chart__heading uf-title-group tw:flex tw:w-180 tw:h-34.5 tw:flex-col tw:items-start tw:gap-4
                tw:max-md:w-full tw:max-md:h-auto tw:max-md:items-start tw:max-md:gap-4 tw:max-md:text-left tw:min-[821px]:flex
                tw:min-[821px]:h-auto tw:min-[821px]:flex-col tw:min-[821px]:items-start tw:min-[821px]:gap-4
                tw:min-[821px]:content-start tw:max-md:[&_.stance-toggle]:w-max tw:max-md:[&_.stance-toggle]:h-10
                tw:max-md:[&_.stance-toggle]:gap-1.5 tw:max-md:[&_.stance-toggle]:border-2
                tw:max-md:[&_.stance-toggle]:border-solid tw:max-md:[&_.stance-toggle]:border-accent
                tw:max-md:[&_.stance-toggle]:inline-flex tw:max-md:[&_.stance-toggle]:items-center
                tw:max-md:[&_.stance-toggle]:justify-center tw:max-md:[&_.stance-toggle]:box-border
                tw:max-md:[&_.stance-toggle]:whitespace-nowrap tw:max-md:[&_.stance-toggle]:py-2
                tw:max-md:[&_.stance-toggle]:px-3 tw:max-md:[&_.stance-toggle\_\_thumb]:w-5.5
                tw:max-md:[&_.stance-toggle\_\_thumb]:h-5.5 tw:max-md:[&_.stance-toggle\_\_chevron]:w-3
                tw:max-md:[&_.stance-toggle\_\_chevron]:h-1.5 tw:max-md:[&_.stance-toggle\_\_chevron]:flex-none
                tw:max-md:[&_.stance-toggle\_\_chevron]:ml-3 tw:min-[821px]:[&_.stance-toggle]:w-max
                tw:min-[821px]:[&_.stance-toggle]:h-14 tw:min-[821px]:[&_.stance-toggle]:flex-none
                tw:min-[821px]:[&_.stance-toggle]:box-border tw:min-[821px]:[&_.stance-toggle]:gap-2
                tw:min-[821px]:[&_.stance-toggle]:text-4xl tw:min-[821px]:[&_.stance-toggle]:leading-10.5
                tw:min-[821px]:[&_.stance-toggle]:py-3 tw:min-[821px]:[&_.stance-toggle]:px-4
                tw:min-[821px]:[&_.stance-toggle\_\_chevron]:block tw:min-[821px]:[&_.stance-toggle\_\_chevron]:w-6
                tw:min-[821px]:[&_.stance-toggle\_\_chevron]:h-6 tw:min-[821px]:[&_.stance-toggle\_\_chevron]:flex-[0_0_24px]
                tw:min-[821px]:[&_.stance-toggle\_\_chevron]:ml-0 tw:min-[821px]:[&_.stance-toggle\_\_chevron]:max-w-none
                tw:min-[821px]:[&_.stance-toggle\_\_chevron]:object-contain
                tw:min-[821px]:[&_.stance-toggle\_\_chevron]:object-center
                tw:min-[821px]:[&_.stance-toggle\_\_chevron]:py-2 tw:min-[821px]:[&_.stance-toggle\_\_chevron]:px-1
            `}
                    >
                        <h2
                            className="
                    uf-section-title tw:min-[821px]:block tw:min-[821px]:h-auto tw:min-[821px]:min-h-0 tw:min-[821px]:leading-10.5!
                    tw:min-[821px]:overflow-visible tw:min-[821px]:[text-box-trim:trim-both]
                    tw:min-[821px]:[text-box-edge:cap_alphabetic] tw:min-[821px]:p-0 tw:min-[821px]:m-0
                "
                            id="uf-projects-chart-title"
                        >
                            Estas são as UFs dos parlamentares que apresentam mais projetos
                        </h2>
                        <div className="uf-state-selector tw:min-[821px]:m-0">
                            <StanceToggle
                                value={stance}
                                onChange={setStance}
                                labels={{ unfavorable: "Desfavoráveis", favorable: "Favoráveis" }}
                            />
                        </div>
                    </div>
                    <p>
                        Boa parte das bancadas dos estados do Centro-Oeste, além das de Tocantins,
                        <br className="tw:max-md:hidden" /> Espírito Santo e Santa Catarina, lidera a
                        apresentação de propostas que restringem
                        <br className="tw:max-md:hidden" /> direitos de mulheres, meninas e da população
                        LGBTQIAPN+
                    </p>
                </header>

                <figure
                    className="
            uf-projects-chart__figure tw:w-180 tw:h-204 tw:py-6 tw:px-0 tw:max-md:w-full tw:max-md:h-auto tw:m-0
            tw:max-md:mt-2.5 tw:max-md:py-6 tw:max-md:px-0 tw:min-[821px]:w-180 tw:min-[821px]:h-204 tw:min-[821px]:mt-2.5
            tw:min-[821px]:py-6 tw:min-[821px]:px-0
        "
                >
                    <div className="uf-projects-chart__map-table tw:w-180 tw:h-192 tw:max-md:w-full tw:max-md:h-auto tw:max-md:text-left tw:min-[821px]:w-180 tw:min-[821px]:h-192">
                        <div
                            className="
                    uf-projects-chart__tabs tw:flex tw:w-180 tw:h-12 tw:items-end tw:justify-end tw:gap-0 tw:border-b-4
                    tw:border-solid tw:border-b-accent tw:max-md:w-full tw:max-md:h-auto tw:max-md:hidden tw:min-[821px]:w-180
                    tw:min-[821px]:h-12 tw:min-[821px]:gap-0 tw:min-[821px]:py-0 tw:min-[821px]:px-4
                "
                            role="tablist"
                        >
                            <button
                                className="
                        uf-projects-chart__tab tw:w-26 tw:h-12 tw:border-0 tw:[background:none] tw:text-accent tw:font-display tw:text-xl
                        tw:font-bold tw:leading-6 tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:cursor-pointer
                        tw:min-[821px]:w-auto tw:min-[821px]:h-12 tw:min-[821px]:rounded-[16px_16px_0_0]
                        tw:min-[821px]:transform-[translateY(4px)] tw:min-[821px]:[background:rgba(66,66,246,0.1)]
                        tw:min-[821px]:text-accent tw:min-[821px]:py-3 tw:min-[821px]:px-6
                        tw:aria-selected:rounded-[16px_16px_0_0] tw:aria-selected:bg-accent
                        tw:aria-selected:text-white tw:min-[821px]:aria-selected:bg-accent
                        tw:min-[821px]:aria-selected:text-white tw:flex tw:items-center tw:justify-center
                    "
                                type="button"
                                role="tab"
                                data-panel-tab="map"
                                onClick={() => setPanel("map")}
                                aria-selected={panel === "map"}
                                aria-controls="uf-panel-map"
                            >
                                Mapa
                            </button>
                            <button
                                className="
                        uf-projects-chart__tab tw:w-26 tw:h-12 tw:border-0 tw:[background:none] tw:text-accent tw:font-display tw:text-xl
                        tw:font-bold tw:leading-6 tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:cursor-pointer
                        tw:min-[821px]:w-auto tw:min-[821px]:h-12 tw:min-[821px]:rounded-[16px_16px_0_0]
                        tw:min-[821px]:transform-[translateY(4px)] tw:min-[821px]:[background:rgba(66,66,246,0.1)]
                        tw:min-[821px]:text-accent tw:min-[821px]:py-3 tw:min-[821px]:px-6
                        tw:aria-selected:rounded-[16px_16px_0_0] tw:aria-selected:bg-accent
                        tw:aria-selected:text-white tw:min-[821px]:aria-selected:bg-accent
                        tw:min-[821px]:aria-selected:text-white tw:flex tw:items-center tw:justify-center
                    "
                                type="button"
                                role="tab"
                                data-panel-tab="table"
                                onClick={() => setPanel("table")}
                                aria-selected={panel === "table"}
                                aria-controls="uf-panel-table"
                            >
                                Tabela
                            </button>
                        </div>

                        <div
                            className="
                    uf-projects-chart__panel tw:data-[panel-view='table']:flex tw:data-[panel-view='table']:w-180
                    tw:data-[panel-view='table']:h-180 tw:data-[panel-view='table']:flex-col
                    tw:data-[panel-view='table']:items-center tw:data-[panel-view='table']:justify-center
                    tw:data-[panel-view='table']:overflow-clip tw:data-[panel-view='table']:border
                    tw:data-[panel-view='table']:border-solid tw:data-[panel-view='table']:border-accent
                    tw:data-[panel-view='table']:py-12 tw:data-[panel-view='table']:px-0
                    tw:max-md:data-[panel-view='map']:text-left tw:max-md:data-[panel-view='map']:block!
                    tw:max-md:data-[panel-view='table']:hidden! tw:min-[821px]:data-[panel-view='table']:w-180
                    tw:min-[821px]:data-[panel-view='table']:h-180
                "
                            id="uf-panel-map"
                            role="tabpanel"
                            data-panel-view="map"
                        >
                            <div
                                className="
                        uf-projects-chart__map tw:relative tw:w-180 tw:aspect-[1] tw:md:border tw:md:border-solid tw:md:border-accent
                        tw:[&_img]:absolute tw:[&_img]:inset-0 tw:[&_img]:w-full tw:[&_img]:h-full tw:max-md:w-full tw:max-md:h-auto
                        tw:max-md:aspect-[1] tw:max-md:border tw:max-md:border-solid tw:max-md:border-accent tw:min-[821px]:w-180
                        tw:min-[821px]:h-180
                    "
                            >
                                <Image
                                    className="tw:relative"
                                    decoding="async"
                                    src={mapBase}
                                    alt=""
                                    width={720}
                                    height={720}
                                    loading="lazy"
                                    draggable={false}
                                />
                                {highlights.map((view) => (
                                    <div
                                        key={view.stance}
                                        data-stance-view={view.stance}
                                        role="img"
                                        aria-label={`Mapa do Brasil com destaque para ${view.ufs.join(", ")}`}
                                    >
                                        {view.layers.map((layer) => (
                                            <Image
                                                key={layer.uf}
                                                decoding="async"
                                                src={layer.image}
                                                alt=""
                                                width={720}
                                                height={720}
                                                loading="lazy"
                                                draggable={false}
                                            />
                                        ))}
                                    </div>
                                ))}
                                <Image
                                    decoding="async"
                                    src={mapLabels}
                                    alt=""
                                    width={720}
                                    height={720}
                                    loading="lazy"
                                    draggable={false}
                                />
                                <div
                                    className="
                            uf-projects-chart__map-hitbox tw:absolute tw:inset-0 tw:z-2 tw:pointer-events-none tw:[&_svg]:block
                            tw:[&_svg]:w-full tw:[&_svg]:h-full tw:[&_svg]:pointer-events-none tw:[&_path]:[pointer-events:all]
                            tw:[&_path]:fill-transparent
                        "
                                    aria-hidden="true"
                                >
                                    <svg viewBox="0 0 1800 1800">
                                        {Array.from(
                                            mapHitboxes.matchAll(/<path id="([A-Z]{2})" d="([^"]+)"/g),
                                        ).map((match) => (
                                            <path
                                                key={match[1]}
                                                d={match[2]}
                                                tabIndex={0}
                                                role="button"
                                                aria-label={ufLabels[match[1]]}
                                                onFocus={(event) =>
                                                    showUf(
                                                        match[1],
                                                        event.currentTarget.getBoundingClientRect().left,
                                                        event.currentTarget.getBoundingClientRect().top,
                                                    )
                                                }
                                                onBlur={() => setActiveUf(null)}
                                                onPointerEnter={(event) =>
                                                    showUf(match[1], event.clientX, event.clientY)
                                                }
                                                onPointerLeave={() => setActiveUf(null)}
                                                onClick={(event) =>
                                                    showUf(match[1], event.clientX, event.clientY)
                                                }
                                                onKeyDown={(event) => {
                                                    if (event.key === "Escape") setActiveUf(null);
                                                }}
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div
                            className="
                    uf-projects-chart__panel tw:data-[panel-view='table']:flex tw:data-[panel-view='table']:w-180
                    tw:data-[panel-view='table']:h-180 tw:data-[panel-view='table']:flex-col
                    tw:data-[panel-view='table']:items-center tw:data-[panel-view='table']:justify-center
                    tw:data-[panel-view='table']:overflow-clip tw:data-[panel-view='table']:border
                    tw:data-[panel-view='table']:border-solid tw:data-[panel-view='table']:border-accent
                    tw:data-[panel-view='table']:py-12 tw:data-[panel-view='table']:px-0
                    tw:max-md:data-[panel-view='map']:text-left tw:max-md:data-[panel-view='map']:block!
                    tw:max-md:data-[panel-view='table']:hidden! tw:min-[821px]:data-[panel-view='table']:w-180
                    tw:min-[821px]:data-[panel-view='table']:h-180
                "
                            id="uf-panel-table"
                            role="tabpanel"
                            data-panel-view="table"
                        >
                            {views.map((view) => {
                                const tableRows = view.rows;
                                const isFavorable = view.stance === "favorable";
                                const stanceLabel = isFavorable ? "Favoráveis" : "Desfavoráveis";
                                const rankingHighlighters = isFavorable
                                    ? favorableTableRankingHighlighters
                                    : tableRankingHighlighters;
                                return (
                                    <table
                                        key={view.stance}
                                        className="
                            uf-projects-chart__table tw:block tw:w-156 tw:h-156 tw:flex-none tw:overflow-clip tw:text-ink tw:text-base
                            tw:[&_tr>*]:flex-[0_0_144px] tw:[&_tr>:first-child]:basis-48
                            tw:leading-6 tw:[&_td]:flex tw:[&_td]:h-6 tw:[&_td]:items-center tw:[&_td]:justify-end
                            tw:[&_td]:border-b tw:[&_td]:border-solid tw:[&_td]:border-b-[rgba(66,66,246,0.25)] tw:[&_td]:text-right
                            tw:[&_td]:whitespace-nowrap tw:[&_td]:py-0 tw:[&_td]:px-3
                        "
                                        data-stance-view={view.stance}
                                    >
                                        <thead className="tw:block">
                                            <tr className="tw:h-6 tw:overflow-clip tw:flex">
                                                <th
                                                    className="
                                    tw:flex tw:h-6 tw:items-center tw:justify-start tw:border-b-2 tw:border-solid tw:border-b-ink
                                    tw:text-left tw:whitespace-nowrap tw:font-display tw:text-lg tw:font-bold tw:leading-6 tw:uppercase
                                    tw:[font-variation-settings:'wdth'_75] tw:relative tw:py-0 tw:px-3
                                "
                                                    scope="col"
                                                >
                                                    Unidade Federativa
                                                </th>
                                                <th
                                                    className="
                                    tw:flex tw:h-6 tw:items-center tw:justify-end tw:border-b-2 tw:border-solid tw:border-b-ink
                                    tw:text-right tw:whitespace-nowrap tw:font-display tw:text-lg tw:font-bold tw:leading-6 tw:uppercase
                                    tw:[font-variation-settings:'wdth'_75] tw:py-0 tw:px-3
                                "
                                                    scope="col"
                                                >
                                                    Proposições
                                                </th>
                                                <th
                                                    className="
                                    tw:flex tw:h-6 tw:items-center tw:justify-end tw:border-b-2 tw:border-solid tw:border-b-ink
                                    tw:text-right tw:whitespace-nowrap tw:font-display tw:text-lg tw:font-bold tw:leading-6 tw:uppercase
                                    tw:[font-variation-settings:'wdth'_75] tw:py-0 tw:px-3
                                "
                                                    scope="col"
                                                >
                                                    {stanceLabel}
                                                </th>
                                                <th
                                                    className="
                                    tw:flex tw:h-6 tw:items-center tw:justify-end tw:border-b-2 tw:border-solid tw:border-b-ink
                                    tw:text-right tw:whitespace-nowrap tw:font-display tw:text-lg tw:font-bold tw:leading-6 tw:uppercase
                                    tw:[font-variation-settings:'wdth'_75] tw:py-0 tw:px-3
                                "
                                                    scope="col"
                                                >
                                                    % {stanceLabel}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="tw:block">
                                            {tableRows.map((row, index) => (
                                                <tr key={row.uf} className="tw:h-6 tw:overflow-clip tw:flex">
                                                    <th
                                                        className="
                                            tw:flex tw:h-6 tw:items-center tw:justify-start tw:border-b tw:border-solid
                                            tw:border-b-[rgba(66,66,246,0.25)] tw:text-left tw:whitespace-nowrap tw:relative tw:font-bold tw:py-0 tw:px-3
                                        "
                                                        scope="row"
                                                    >
                                                        <span className="uf-projects-chart__state tw:relative tw:z-1 tw:inline-block">
                                                            {index < MAP_HIGHLIGHTS && (
                                                                <span
                                                                    className={cx([
                                                                        "uf-projects-chart__ranking-highlighter tw:pointer-events-none tw:absolute tw:z-0 tw:left-(--ranking-highlight-left) tw:w-[calc(100%-var(--ranking-highlight-left)+4px)]",
                                                                        `uf-projects-chart__ranking-highlighter--${index + 1}`,
                                                                        [
                                                                            "tw:-top-1 tw:h-8.5 tw:[--ranking-highlight-left:-16px]",
                                                                            "tw:top-px tw:h-7.5 tw:[--ranking-highlight-left:-10px]",
                                                                            "tw:top-px tw:h-8.5 tw:[--ranking-highlight-left:-8px]",
                                                                            "tw:-top-0.5 tw:h-8.5 tw:[--ranking-highlight-left:-12px]",
                                                                            "tw:top-px tw:h-8.5 tw:[--ranking-highlight-left:-12px]",
                                                                        ][index],
                                                                    ])}
                                                                    aria-hidden="true"
                                                                >
                                                                    <span
                                                                        className={String.raw`
                                                            uf-projects-chart__ranking-highlighter-layer uf-projects-chart__ranking-highlighter-layer--one tw:absolute
                                                            tw:block tw:mix-blend-darken tw:left-[5.7326%] tw:w-[94.2675%]
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--1]:top-0.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--1]:h-6.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--2]:top-0.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--2]:h-5.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--3]:top-0.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--3]:h-6
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--4]:top-0.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--4]:h-6
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--5]:top-0.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--5]:h-6
                                                        `}
                                                                    >
                                                                        <span className="uf-projects-chart__ranking-highlighter-image uf-projects-chart__ranking-highlighter-image--one tw:absolute tw:block tw:inset-0">
                                                                            <Image
                                                                                src={
                                                                                    rankingHighlighters[
                                                                                        index
                                                                                    ][0]
                                                                                }
                                                                                alt=""
                                                                            />
                                                                        </span>
                                                                    </span>
                                                                    <span
                                                                        className={String.raw`
                                                            uf-projects-chart__ranking-highlighter-layer uf-projects-chart__ranking-highlighter-layer--two tw:absolute
                                                            tw:block tw:mix-blend-darken tw:left-[1.9109%] tw:w-[98.0892%]
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--1]:top-1.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--1]:h-6
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--2]:top-1
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--2]:h-5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--3]:top-1.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--3]:h-6
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--4]:top-1.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--4]:h-6
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--5]:top-1.5
                                                            tw:in-[.uf-projects-chart__ranking-highlighter--5]:h-6
                                                        `}
                                                                    >
                                                                        <span className="uf-projects-chart__ranking-highlighter-image uf-projects-chart__ranking-highlighter-image--two tw:absolute tw:block tw:inset-0">
                                                                            <Image
                                                                                src={
                                                                                    rankingHighlighters[
                                                                                        index
                                                                                    ][1]
                                                                                }
                                                                                alt=""
                                                                            />
                                                                        </span>
                                                                    </span>
                                                                </span>
                                                            )}
                                                            <span className="uf-projects-chart__state-label tw:relative tw:z-1">
                                                                {ufLabels[row.uf.trim().toUpperCase()] ??
                                                                    row.uf}
                                                            </span>
                                                        </span>
                                                    </th>
                                                    <td>{row.total}</td>
                                                    <td>{isFavorable ? row.favorable : row.unfavorable}</td>
                                                    <td
                                                        className={
                                                            index < MAP_HIGHLIGHTS
                                                                ? "tw:font-bold"
                                                                : undefined
                                                        }
                                                    >
                                                        {row.share}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                );
                            })}
                        </div>
                    </div>
                </figure>

                <SectionDivider
                    class="
                uf-projects-chart__footer tw:absolute tw:right-12 tw:bottom-12 tw:left-12 tw:flex tw:w-180 tw:h-8 tw:items-start
                tw:justify-between tw:border-t tw:border-solid tw:border-t-ink tw:pt-2 tw:text-sm tw:leading-4
                tw:max-md:w-[min(252px,100%)] tw:max-md:h-auto tw:max-md:relative tw:max-md:right-auto tw:max-md:bottom-auto
                tw:max-md:left-auto tw:max-md:min-h-20 tw:max-md:flex-col tw:max-md:items-center tw:max-md:justify-start
                tw:max-md:gap-4 tw:max-md:text-center tw:max-md:mt-0 tw:max-md:mb-12 tw:max-md:mx-auto tw:min-[821px]:bottom-6
                tw:min-[821px]:left-12 tw:min-[821px]:right-12 tw:min-[821px]:w-180 tw:min-[821px]:h-8 tw:min-[821px]:text-ink
                tw:[&_span]:mt-1 tw:[&_img]:w-28.5 tw:[&_img]:h-3 tw:[&_img]:mt-1.5 tw:[&_img]:mb-0 tw:[&_img]:mx-2
                tw:max-md:[&_span]:mt-1 tw:max-md:[&_img]:flex-none tw:max-md:[&_img]:m-0 tw:min-[821px]:[&_span]:mt-1
                tw:min-[821px]:[&_span]:ml-3 tw:min-[821px]:[&_span]:text-ink
            "
                    content="A atuação das bancadas regionais revela estados com atuação mais conservadora"
                />
            </div>
            <a
                className="
        uf-projects-chart__button tw:absolute tw:bottom-0 tw:left-[50%] tw:flex tw:w-73.5 tw:h-14 tw:items-center
        tw:justify-center tw:gap-4 tw:border-0 tw:transform-[translateX(-50%)] tw:bg-accent tw:text-white tw:font-display
        tw:text-lg tw:font-bold tw:leading-6 tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:no-underline
        tw:[transition:background-color_220ms_ease-out] tw:py-4 tw:px-6 tw:[&_img]:w-3.5 tw:[&_img]:h-2.5
        tw:[&_img]:transform-[rotate(-90deg)] tw:hover:bg-ink tw:focus-visible:outline-2 tw:focus-visible:outline-ink
        tw:focus-visible:outline-offset-1 tw:max-md:relative tw:max-md:bottom-auto tw:max-md:left-[50%]
        tw:max-md:max-w-full tw:min-[821px]:bottom-0 tw:min-[821px]:w-73.5 tw:min-[821px]:h-14
    "
                href="/atividade-legislativa"
            >
                Veja como está o seu estado <Image src={buttonChevron} alt="" />
            </a>
            <div
                className="
        uf-projects-chart__tooltip tw:fixed tw:z-1000 tw:pointer-events-none tw:max-w-60 tw:bg-white tw:text-ink
        tw:border tw:border-solid tw:border-accent tw:shadow-[0_16px_30px_rgba(0,0,0,0.2)] tw:font-sans tw:text-sm
        tw:leading-normal tw:py-3 tw:px-4 tw:[&_p]:m-0 tw:[[hidden]]:hidden
    "
                role="status"
                aria-live="polite"
                data-tooltip
                hidden={!activeUf}
                style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
            >
                <p
                    className="uf-projects-chart__tooltip-uf tw:mb-2 tw:font-display tw:text-base tw:font-bold tw:uppercase tw:[font-variation-settings:'wdth'_75]"
                    data-tooltip-uf
                >
                    {activeUf ? ufLabels[activeUf] : ""}
                </p>
                <p>
                    Favoráveis:{" "}
                    <strong className="tw:[font-variant-numeric:tabular-nums]" data-tooltip-fav>
                        {activeUf ? (ufData[activeUf]?.favorable ?? 0) : ""}
                    </strong>
                </p>
                <p>
                    Desfavoráveis:{" "}
                    <strong className="tw:[font-variant-numeric:tabular-nums]" data-tooltip-des>
                        {activeUf ? (ufData[activeUf]?.unfavorable ?? 0) : ""}
                    </strong>
                </p>
            </div>
        </section>
    );
}
