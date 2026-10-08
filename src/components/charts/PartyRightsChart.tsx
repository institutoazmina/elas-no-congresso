import { Image, css } from "../shared/react-utils";
import attention from "../../assets/images/party-chart/attention.svg";
import StanceToggle from "./StanceToggle";
import SectionDivider from "../shared/SectionDivider";
import thumbsDown from "../../assets/images/thumbs-down.svg";
import thumbsUp from "../../assets/images/thumbs-up.svg";
import Papelada from "./Papelada";

import type { Stance } from "../../service/api/stats";
import { Fragment, useState } from "react";

export default function PartyRightsChart({
    views,
    gap,
}: {
    views: {
        stance: Stance;
        caption: string;
        parties: { name: string; percentage: string; width: number; negative: number; positive: number }[];
    }[];
    gap: number;
}) {
    const [stance, setStance] = useState<Stance>("unfavorable");
    return (
        <section
            className={String.raw`
    party-rights-chart tw:h-182.5 tw:mb-12 tw:overflow-hidden tw:bg-white tw:shadow-[0_48px_0_#fff] tw:text-ink
    tw:font-sans tw:[&_h2]:m-0 tw:[&_p]:m-0 tw:max-[984px]:h-auto tw:max-[984px]:overflow-hidden tw:max-md:mb-0
    tw:max-md:shadow-none tw:max-md:[&_h2]:relative tw:max-md:[&_h2]:block tw:max-md:[&_h2]:w-[min(332px,100%)]
    tw:max-md:[&_h2]:h-auto tw:max-md:[&_h2]:min-h-28.5 tw:max-md:[&_h2]:flex-none tw:max-md:[&_h2]:text-[28px]
    tw:max-md:[&_h2]:leading-8 tw:[&[data-stance='unfavorable']_[data-stance-view='favorable']]:hidden
    tw:[&[data-stance='favorable']_[data-stance-view='unfavorable']]:hidden
    tw:min-[984px]:[&_h2_.stance-toggle]:w-max tw:min-[984px]:[&_h2_.stance-toggle]:h-14
    tw:min-[984px]:[&_h2_.stance-toggle]:flex-none tw:min-[984px]:[&_h2_.stance-toggle]:justify-start
    tw:min-[984px]:[&_h2_.stance-toggle]:gap-1.5 tw:min-[984px]:[&_h2_.stance-toggle]:text-4xl
    tw:min-[984px]:[&_h2_.stance-toggle]:leading-10.5 tw:min-[984px]:[&_h2_.stance-toggle\_\_chevron]:flex-none
    tw:max-md:[&_.stance-toggle]:absolute tw:max-md:[&_.stance-toggle]:top-11.5
    tw:max-md:[&_.stance-toggle]:left-28 tw:max-md:[&_.stance-toggle]:w-auto tw:max-md:[&_.stance-toggle]:h-10
    tw:max-md:[&_.stance-toggle]:gap-1.5 tw:max-md:[&_.stance-toggle]:border-2
    tw:max-md:[&_.stance-toggle]:justify-center tw:max-md:[&_.stance-toggle]:text-[16px]
    tw:max-md:[&_.stance-toggle]:leading-4.5 tw:max-md:[&_.stance-toggle]:whitespace-nowrap
    tw:max-md:[&_.stance-toggle]:py-2 tw:max-md:[&_.stance-toggle]:px-3
    tw:max-md:[&_.stance-toggle\_\_thumb]:w-5.5 tw:max-md:[&_.stance-toggle\_\_thumb]:h-5.5
    tw:max-md:[&_.stance-toggle\_\_chevron]:w-3 tw:max-md:[&_.stance-toggle\_\_chevron]:h-1.5
    tw:max-md:[&_.stance-toggle\_\_chevron]:ml-3
`}
            data-stance={stance}
            aria-labelledby="party-rights-chart-title"
        >
            <div
                className="
        party-rights-chart__container tw:relative tw:flex tw:w-246 tw:h-182.5 tw:flex-col tw:items-center
        tw:gap-2.5 tw:p-12 tw:my-0 tw:mx-auto tw:max-[984px]:w-full tw:max-[984px]:h-auto tw:max-[984px]:py-6
        tw:max-[984px]:px-4 tw:max-md:w-[min(344px,calc(100%-32px))] tw:max-md:py-6 tw:max-md:px-0
    "
            >
                <header
                    className="
            party-rights-chart__header tw:flex tw:w-180 tw:h-39 tw:flex-col tw:items-start tw:gap-4 tw:[&>p]:w-180
            tw:[&>p]:h-6 tw:[&>p]:text-lg tw:[&>p]:leading-6 tw:max-[984px]:w-full tw:max-[984px]:h-auto tw:max-[984px]:m-0
            tw:max-[984px]:[&>p]:w-full tw:max-[984px]:[&>p]:h-auto tw:max-md:w-full tw:max-md:h-auto tw:max-md:gap-4
            tw:max-md:[&>p]:w-full tw:max-md:[&>p]:h-auto tw:max-md:[&>p]:text-sm tw:max-md:[&>p]:font-normal
            tw:max-md:[&>p]:leading-6
        "
                >
                    <Image className="party-rights-chart__attention tw:w-24 tw:h-1" src={attention} alt="" />
                    <h2
                        className="
                tw:[--stance-toggle-font-size:36px] tw:flex tw:flex-wrap tw:w-162 tw:h-24 tw:items-center tw:gap-4 tw:font-display tw:text-4xl
                tw:font-bold tw:leading-10.5 tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:min-[984px]:w-162
                tw:min-[984px]:h-24 tw:min-[984px]:items-center tw:min-[984px]:gap-x-4 tw:min-[984px]:gap-y-4
                tw:max-[984px]:[--stance-toggle-font-size:28px] tw:max-[984px]:flex tw:max-[984px]:w-full tw:max-[984px]:h-auto
                tw:max-[984px]:gap-x-[normal] tw:max-[984px]:gap-y-[normal] tw:max-[984px]:text-[28px]
                tw:max-[984px]:leading-8.5 tw:min-[984px]:flex
            "
                        id="party-rights-chart-title"
                    >
                        <span
                            className="
                    tw:h-6 tw:whitespace-nowrap tw:min-[984px]:self-start tw:min-[984px]:h-6 tw:min-[984px]:leading-6
                    tw:max-[984px]:h-auto tw:max-[984px]:whitespace-normal tw:max-md:absolute tw:max-md:top-2.5 tw:max-md:left-0
                    tw:max-md:w-full tw:max-md:h-auto tw:max-md:text-[28px] tw:max-md:leading-8
                "
                        >
                            Estes são os partidos que mais têm
                        </span>
                        <div className="tw:contents tw:min-[984px]:flex tw:min-[984px]:w-full tw:min-[984px]:items-center tw:min-[984px]:gap-4">
                            <div className="tw:contents tw:min-[984px]:block tw:min-[984px]:w-57.5 tw:min-[984px]:shrink-0">
                                <StanceToggle
                                    value={stance}
                                    onChange={setStance}
                                    labels={{ unfavorable: "Atacado", favorable: "Defendido" }}
                                />
                            </div>
                            <span
                                className="
                    tw:h-6 tw:whitespace-nowrap tw:min-[984px]:self-center tw:min-[984px]:h-6 tw:min-[984px]:leading-6
                    tw:max-[984px]:h-auto tw:max-[984px]:whitespace-normal tw:max-md:absolute tw:max-md:top-22.5
                    tw:max-md:left-0 tw:max-md:h-auto tw:max-md:text-[28px] tw:max-md:leading-8 tw:max-md:whitespace-nowrap
                "
                            >
                                Nossos direitos
                                <span className="party-rights-chart__mobile-question tw:hidden tw:max-md:inline">
                                    ?
                                </span>
                            </span>
                        </div>
                    </h2>
                    <p>Extrema-direita, centro e esquerda têm atuação diferente em relação ao gênero</p>
                </header>

                {views.map((view) => (
                    <figure
                        key={view.stance}
                        className="
            party-rights-chart__figure tw:max-[984px]:w-full tw:max-[984px]:h-auto tw:max-[984px]:mt-2.5
            tw:max-[984px]:flex-wrap tw:max-[984px]:gap-5 tw:max-[984px]:overflow-visible tw:flex tw:w-222 tw:h-106.5
            tw:items-end tw:justify-center tw:gap-18 tw:overflow-hidden tw:py-6 tw:px-0 tw:m-0 tw:min-[984px]:w-222
            tw:min-[984px]:h-106.5 tw:min-[984px]:items-start tw:min-[984px]:gap-18 tw:min-[984px]:p-0 tw:max-md:w-full
            tw:max-md:h-auto tw:max-md:gap-x-5 tw:max-md:gap-y-5 tw:max-md:items-end tw:max-md:overflow-visible
            tw:max-md:pt-6 tw:max-md:pb-0 tw:max-md:px-0 tw:max-md:m-0 tw:max-md:flex tw:max-md:flex-wrap
            tw:max-md:justify-center
        "
                        data-stance-view={view.stance}
                        aria-label={`Partidos com mais proposições que ${view.caption} direitos`}
                    >
                        {view.parties.map((party) => (
                            <article
                                key={party.name}
                                className="
                    party-rights-chart__party tw:max-[984px]:w-[calc(50%-10px)]! tw:max-md:min-w-0 tw:max-md:py-4 tw:max-md:px-0
                    tw:flex tw:flex-none tw:flex-col tw:items-center tw:justify-end tw:gap-4 tw:py-4 tw:px-0 tw:min-[984px]:h-96.5
                    tw:min-[984px]:[align-content:start] tw:min-[984px]:items-stretch tw:min-[984px]:gap-4 tw:min-[984px]:p-0
                    tw:max-md:nth-3:justify-self-center tw:max-md:nth-5:justify-self-center
                    tw:min-[984px]:flex tw:min-[984px]:flex-col tw:max-md:w-[calc(50%-10px)]! tw:max-md:last:w-full!
                "
                                style={css(`width: ${party.width}px`)}
                            >
                                <div
                                    className="
                        party-rights-chart__piles tw:flex tw:min-w-12 tw:min-h-12 tw:items-end tw:justify-center tw:gap-4
                        tw:overflow-hidden tw:min-[984px]:h-70.5 tw:min-[984px]:min-h-0 tw:min-[984px]:pt-6 tw:min-[984px]:items-end
                        tw:min-[984px]:overflow-hidden
                    "
                                >
                                    <div
                                        className="
                            party-rights-chart__pile tw:min-[984px]:transform-[scaleY(0.94632)] tw:min-[984px]:origin-bottom tw:flex
                            tw:flex-col tw:items-center tw:justify-end tw:gap-2
                        "
                                    >
                                        <div
                                            className="
                                party-rights-chart__value tw:flex tw:flex-col tw:items-center tw:[&_strong]:h-8 tw:[&_strong]:font-display
                                tw:[&_strong]:text-[28px] tw:[&_strong]:font-bold tw:[&_strong]:leading-8
                                tw:[&_strong]:[font-variation-settings:'wdth'_75]
                            "
                                        >
                                            <strong>{party.negative}</strong>
                                            <Image
                                                className="party-rights-chart__thumb tw:relative tw:block tw:w-8 tw:h-8 tw:flex-none tw:overflow-hidden tw:rounded-[1000px]"
                                                src={thumbsDown}
                                                alt=""
                                            />
                                        </div>
                                        <Papelada
                                            className="party-rights-chart__paper tw:block tw:w-11.5 tw:h-auto"
                                            arrangement="pile"
                                            category="desfavoravel"
                                            size="a4"
                                            gap={gap}
                                            amount={party.negative}
                                            alt={`${party.negative} proposições desfavoráveis`}
                                        />
                                    </div>
                                    <div
                                        className="
                            party-rights-chart__pile tw:min-[984px]:transform-[scaleY(0.94632)] tw:min-[984px]:origin-bottom tw:flex
                            tw:flex-col tw:items-center tw:justify-end tw:gap-2
                        "
                                    >
                                        <div
                                            className="
                                party-rights-chart__value tw:flex tw:flex-col tw:items-center tw:[&_strong]:h-8 tw:[&_strong]:font-display
                                tw:[&_strong]:text-[28px] tw:[&_strong]:font-bold tw:[&_strong]:leading-8
                                tw:[&_strong]:[font-variation-settings:'wdth'_75]
                            "
                                        >
                                            <strong>{party.positive}</strong>
                                            <Image
                                                className="party-rights-chart__thumb tw:relative tw:block tw:w-8 tw:h-8 tw:flex-none tw:overflow-hidden tw:rounded-[1000px]"
                                                src={thumbsUp}
                                                alt=""
                                            />
                                        </div>
                                        <Papelada
                                            className="party-rights-chart__paper tw:block tw:w-11.5 tw:h-auto"
                                            arrangement="pile"
                                            category="favoravel"
                                            size="a4"
                                            gap={gap}
                                            amount={party.positive}
                                            alt={`${party.positive} proposições favoráveis`}
                                        />
                                    </div>
                                </div>
                                <div
                                    className="
                        party-rights-chart__description tw:flex tw:w-full tw:h-22 tw:flex-col tw:items-center tw:justify-center
                        tw:text-center tw:leading-6 tw:py-2 tw:px-0 tw:[&_strong]:max-w-48 tw:[&_strong]:min-w-24
                        tw:[&_strong]:font-display tw:[&_strong]:text-xl tw:[&_strong]:font-bold tw:[&_strong]:leading-6
                        tw:[&_strong]:uppercase tw:[&_strong]:[font-variation-settings:'wdth'_75] tw:[&_span]:text-base
                        tw:[&_span]:leading-6 tw:[&_span]:whitespace-nowrap tw:min-[984px]:h-22 tw:min-[984px]:min-h-22
                        tw:min-[984px]:block tw:min-[984px]:leading-6 tw:min-[984px]:pt-2 tw:min-[984px]:pb-0 tw:min-[984px]:px-0
                    "
                                >
                                    <strong
                                        className="
                        party-rights-chart__party-name tw:min-[984px]:block tw:min-[984px]:h-6 tw:min-[984px]:leading-6
                        tw:min-[984px]:text-center tw:min-[984px]:whitespace-nowrap tw:min-[984px]:m-0
                    "
                                    >
                                        {party.name}
                                    </strong>
                                    <span
                                        className="
                        party-rights-chart__party-percentage tw:min-[984px]:block tw:min-[984px]:min-h-12 tw:min-[984px]:leading-6
                        tw:min-[984px]:text-center tw:min-[984px]:m-0
                    "
                                    >
                                        {party.percentage.split("\n").map((line) => (
                                            <Fragment key={line}>
                                                {line}
                                                <br />
                                            </Fragment>
                                        ))}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </figure>
                ))}

                <SectionDivider
                    class="
                party-rights-chart__footer tw:absolute tw:right-12 tw:bottom-12 tw:left-12 tw:flex tw:w-222 tw:h-8
                tw:items-start tw:justify-between tw:border-t tw:border-solid tw:border-t-ink tw:pt-2 tw:text-sm tw:leading-4
                tw:max-[984px]:relative tw:max-[984px]:right-auto tw:max-[984px]:bottom-auto tw:max-[984px]:left-auto
                tw:max-[984px]:w-full tw:max-[984px]:h-auto tw:max-[984px]:min-h-8 tw:max-[984px]:mt-2.5 tw:max-[984px]:gap-4
                tw:max-md:relative tw:max-md:w-63 tw:max-md:h-24 tw:max-md:min-h-24 tw:max-md:pt-2 tw:max-md:flex-col
                tw:max-md:items-center tw:max-md:justify-start tw:max-md:gap-6 tw:max-md:text-center tw:max-md:my-0
                tw:max-md:mx-auto tw:[&_span]:mt-1 tw:[&_img]:w-28.5 tw:[&_img]:h-3 tw:[&_img]:mt-1.5 tw:[&_img]:mb-0
                tw:[&_img]:mx-2 tw:max-[984px]:[&_img]:flex-none tw:max-md:[&_span]:w-full tw:max-md:[&_span]:mt-0
                tw:max-md:[&_span]:text-sm tw:max-md:[&_span]:leading-4 tw:max-md:[&_span]:py-1 tw:max-md:[&_span]:px-0
                tw:max-md:[&_img]:w-28.5 tw:max-md:[&_img]:h-3 tw:max-md:[&_img]:mt-1.5 tw:max-md:[&_img]:mb-0
                tw:max-md:[&_img]:mx-0
            "
                    content="Acesse a aba Atividade de Legislativa para ver em detalhes"
                    href="/atividade-legislativa"
                />
            </div>
        </section>
    );
}
