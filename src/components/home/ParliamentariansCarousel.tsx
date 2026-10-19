import { Image, css, cx } from "../shared/react-utils";
import { useCarousel } from "../../hooks/useCarousel";
import arrowBack from "../../assets/images/parliamentarians/arrow-back.svg";
import arrowForward from "../../assets/images/parliamentarians/arrow-forward.svg";
import backgroundPattern from "../../assets/images/parliamentarians/bg-pattern.svg";
import halftoneShadow from "../../assets/images/hero/halftone-shadow.png";
import thumbDown from "../../assets/images/thumbs-down.svg";
import thumbUp from "../../assets/images/thumbs-up.svg";
import favorableProposal from "../../assets/images/proposition-favorable.svg";
import unfavorableProposal from "../../assets/images/proposition-unfavorable.svg";
import { authorRoute } from "../../lib/author-page";
import type { getCurrentParliamentarians } from "../../service/api/parliamentarians";

export default function ParliamentariansCarousel({
    people,
    content,
}: {
    people: Awaited<ReturnType<typeof getCurrentParliamentarians>>;
    content: Record<string, string>;
}) {
    const { trackRef, index: active, move, style } = useCarousel(people.length);
    const itemCount = people.length;
    const propositionCountLabel = (count: number) => `${count} ${count === 1 ? "proposição" : "proposições"}`;
    const profileRoute = (name: string) => authorRoute(name) ?? "/atividade-legislativa";

    return (
        <section
            className="
        parliamentarians tw:[&_h2]:font-display tw:[&_h2]:text-4xl tw:[&_h2]:font-bold tw:[&_h2]:leading-[42px]
        tw:[&_h2]:uppercase tw:[&_h2]:[font-variation-settings:'wdth'_75] tw:[&_h2]:m-0 tw:[&_p]:m-0
        tw:max-md:[&_h2]:text-[28px] tw:max-md:[&_h2]:leading-8 tw:[--card-width:384px] tw:[--card-padding:32px]
        tw:[--card-radius:24px] tw:[--hole-width:98px] tw:[--hole-height:18px] tw:[--hole-top:24px]
        tw:[--rating-art-height:54px] tw:[--rating-art-width:64px] tw:[--proposal-width:42px] tw:[--thumb-size:32px]
        tw:[--track-gap:48px] tw:mt-12 tw:bg-white tw:shadow-[0_-48px_0_#fff] tw:text-ink tw:font-sans tw:overflow-hidden
        tw:max-md:[--card-width:min(280px,_calc(100vw_-_32px))] tw:max-md:[--card-padding:24px]
        tw:max-md:[--card-radius:18px] tw:max-md:[--hole-width:72px] tw:max-md:[--hole-height:14px]
        tw:max-md:[--hole-top:18px] tw:max-md:[--rating-art-height:40px] tw:max-md:[--rating-art-width:48px]
        tw:max-md:[--proposal-width:30px] tw:max-md:[--thumb-size:24px] tw:max-md:[--track-gap:24px] tw:max-md:mt-0
        tw:max-md:shadow-none
    "
            aria-labelledby="parliamentarians-title"
            data-parliamentarians
            data-item-count={itemCount}
            style={css(
                `--parliamentarians-background: url(${backgroundPattern.src}); --parliamentarians-halftone-shadow: url(${halftoneShadow.src})`,
            )}
        >
            <header
                className="
        parliamentarians__header tw:w-[min(100%,_816px)] tw:px-12 tw:flex tw:flex-col tw:gap-4 tw:mt-12 tw:mb-2.5
        tw:mx-auto tw:[&_p]:text-lg tw:[&_p]:leading-6 tw:max-md:mt-12 tw:max-md:px-[16px] tw:max-md:[&_p]:text-sm
        tw:max-md:[&_p]:leading-6
    "
            >
                <span
                    className="parliamentarians__attention tw:block tw:w-24 tw:h-1 tw:bg-ink"
                    aria-hidden="true"
                ></span>
                <h2 id="parliamentarians-title">{content.parliamentarians_title}</h2>
                <p>
                    {content.parliamentarians_subtitle}
                </p>
            </header>

            <div
                className="parliamentarians__figure tw:overflow-hidden tw:py-6 tw:px-0"
                aria-label="Carrossel de parlamentares"
            >
                <div
                    className="
            parliamentarians__carousel tw:relative tw:overflow-hidden
            tw:[background:#fff_var(--parliamentarians-background)_left_top_/_400px_400px_repeat] tw:py-12 tw:px-0
            tw:before:absolute tw:before:z-1 tw:before:block tw:before:w-full tw:before:h-6
            tw:before:[background:var(--parliamentarians-halftone-shadow)_left_bottom_/_1440px_24px_repeat-x]
            tw:before:content-[''] tw:before:pointer-events-none tw:before:mix-blend-multiply tw:before:top-0
            tw:before:[transform:scaleY(-1)] tw:after:absolute tw:after:z-1 tw:after:block tw:after:w-full tw:after:h-6
            tw:after:[background:var(--parliamentarians-halftone-shadow)_left_bottom_/_1440px_24px_repeat-x]
            tw:after:content-[''] tw:after:pointer-events-none tw:after:mix-blend-multiply tw:after:bottom-0
        "
                >
                    <div
                        className="
                parliamentarians__controls tw:relative tw:z-3 tw:flex tw:justify-center tw:gap-1 tw:mb-6 tw:[&_button]:w-14
                tw:[&_button]:h-10 tw:[&_button]:border-[2px] tw:[&_button]:border-solid tw:[&_button]:border-accent
                tw:[&_button]:bg-white tw:[&_button]:cursor-pointer tw:[&_button]:py-2 tw:[&_button]:px-4 tw:[&_img]:block
                tw:[&_img]:w-6 tw:[&_img]:h-6 tw:[&_button]:flex tw:[&_button]:items-center tw:[&_button]:justify-center
            "
                    >
                        <button
                            className="tw:focus-visible:outline-2 tw:focus-visible:outline-white tw:focus-visible:outline-offset-[4px]"
                            type="button"
                            aria-label="Parlamentar anterior"
                            onClick={() => move(-1)}
                            data-previous
                            disabled={itemCount <= 1}
                        >
                            <Image src={arrowBack} alt="" />
                        </button>
                        <button
                            className="tw:focus-visible:outline-2 tw:focus-visible:outline-white tw:focus-visible:outline-offset-[4px]"
                            type="button"
                            aria-label="Próximo parlamentar"
                            onClick={() => move(1)}
                            data-next
                            disabled={itemCount <= 1}
                        >
                            <Image src={arrowForward} alt="" />
                        </button>
                    </div>
                    <div className="parliamentarians__viewport tw:relative tw:z-2 tw:w-full">
                        <div
                            className="
                    parliamentarians__track tw:relative tw:left-[50%] tw:flex tw:items-start tw:w-max tw:gap-[var(--track-gap)]
                    tw:[transition:transform_0.2s_ease]
                "
                            ref={trackRef}
                            style={style}
                            data-track
                        >
                            {[...people, ...people, ...people].map((person, index) => Math.abs(index - active) > 3 ? (
                                <div key={`${person.id}-${index}`} className="tw:w-[var(--card-width)] tw:flex-none" aria-hidden="true" />
                            ) : (
                                <a
                                    className={cx([
                                        "parliamentarians__card tw:relative tw:w-[var(--card-width)] tw:flex-none tw:border tw:border-solid tw:border-[#c8c8cc] tw:rounded-[var(--card-radius)] tw:bg-transparent tw:text-inherit tw:no-underline tw:overflow-hidden",
                                        {
                                            "parliamentarians__card--active tw:z-1 tw:shadow-[-4px_4px_0_#0b0f5e]":
                                                index === active,
                                        },
                                    ])}
                                    key={`${person.id}-${index}`}
                                    tabIndex={index === active ? 0 : -1}
                                    href={profileRoute(person.displayName)}
                                    data-parliamentarian-id={String(person.id)}
                                    aria-label={`Ver perfil de ${person.displayName}`}
                                    aria-hidden={index === active ? undefined : "true"}
                                >
                                    <div
                                        className="
                                parliamentarians__card-content tw:max-md:pt-12 tw:relative tw:flex tw:flex-col
                                tw:p-[64px_var(--card-padding)_32px] tw:bg-white

                                tw:[mask-image:url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2098%2018%27%3E%3Crect%20width=%2798%27%20height=%2718%27%20rx=%279%27%20fill=%27black%27/%3E%3C/svg%3E'),_linear-gradient(#000_0_0)]
                                tw:[mask-composite:exclude] tw:[mask-position:center_var(--hole-top),0_0] tw:[mask-size:var(--hole-width)_var(--hole-height),100%_100%] tw:[mask-repeat:no-repeat]
                            "
                                    >
                                        <span
                                            className="
                                        parliamentarians__card-lime tw:absolute tw:z-0 tw:inset-[0_auto_auto_0] tw:w-full tw:h-24
                                        tw:rounded-[var(--card-radius)_var(--card-radius)_0_0]
                                        tw:[background:linear-gradient(#def279_0_64px,_transparent_64px)] tw:max-md:h-18
                                        tw:max-md:[background:linear-gradient(#def279_0_48px,_transparent_48px)]
                                    "
                                            aria-hidden="true"
                                        ></span>
                                        <header className="parliamentarians__card-header tw:relative tw:z-1">
                                            <span
                                                className={cx([
                                                    "parliamentarians__tag tw:max-md:min-h-6 tw:max-md:gap-2 tw:max-md:text-sm tw:max-md:leading-[18px] tw:max-md:py-[4px] tw:max-md:px-1.5 tw:relative tw:flex tw:w-fit tw:min-h-8 tw:items-center tw:gap-2.5 tw:bg-accent tw:text-white tw:font-display tw:font-bold tw:text-lg tw:leading-6 tw:[font-variation-settings:'wdth'_75] tw:uppercase tw:whitespace-nowrap tw:py-1 tw:px-2 tw:[&_i]:relative tw:[&_i]:block tw:[&_i]:w-4.5 tw:[&_i]:h-[12px] tw:[&_i]:flex-none tw:[&_i]:border-[2px] tw:[&_i]:border-solid tw:[&_i]:border-white tw:[&_i]:[border-top:0] tw:[&_i]:rounded-[0_0_12px_12px] tw:[&_i::before]:absolute tw:[&_i::before]:-top-0.5 tw:[&_i::before]:-left-0.5 tw:[&_i::before]:w-4.5 tw:[&_i::before]:border-t-[2px] tw:[&_i::before]:border-solid tw:[&_i::before]:border-t-white tw:[&_i::before]:content-[''] tw:max-md:[&_i]:w-3.5 tw:max-md:[&_i]:h-[10px] tw:max-md:[&_i::before]:w-3.5",
                                                    {
                                                        "parliamentarians__tag--senate tw:[&_i]:[transform:rotate(180deg)]":
                                                            person.house === "Senado Federal",
                                                    },
                                                ])}
                                            >
                                                <i aria-hidden="true"></i>
                                                {person.house}
                                            </span>
                                            <div
                                                className="
                                        parliamentarians__identity tw:gap-2.5 tw:items-end tw:mt-4 tw:max-md:mt-3 tw:flex tw:items-end
                                        tw:[&>:first-child]:w-30 tw:[&>:first-child]:shrink-0 tw:max-md:[&>:first-child]:w-22
                                    "
                                            >
                                                {person.photoUrl !== "Indisponível" ? (
                                                    <Image
                                                        className="parliamentarians__portrait tw:block tw:w-full tw:aspect-[120/161] tw:border tw:border-solid tw:border-muted tw:object-cover"
                                                        src={person.photoUrl}
                                                        width={240}
                                                        height={322}
                                                        alt={`Foto de ${person.displayName}`}
                                                        loading="lazy"
                                                        draggable={false}
                                                    />
                                                ) : (
                                                    <span
                                                        className="
                                                parliamentarians__portrait parliamentarians__portrait--unavailable tw:w-full tw:aspect-[120/161] tw:border
                                                tw:border-solid tw:border-muted tw:object-cover tw:bg-[#f7f7f7] tw:text-muted tw:text-sm tw:text-center tw:p-2
                                                tw:flex tw:items-center tw:justify-center
                                            "
                                                    >
                                                        Indisponível
                                                    </span>
                                                )}
                                                <div
                                                    className="
                                            parliamentarians__person-name tw:min-w-0 tw:pb-[8px] tw:[&_h3]:overflow-hidden tw:[&_h3]:text-ink
                                            tw:[&_h3]:text-lg tw:[&_h3]:font-normal tw:[&_h3]:leading-6 tw:[&_h3]:text-ellipsis tw:[&_h3]:whitespace-nowrap
                                            tw:[&_h3]:mt-0 tw:[&_h3]:mb-2.5 tw:[&_h3]:mx-0 tw:[&_p]:overflow-hidden tw:[&_p]:text-ink tw:[&_p]:text-lg
                                            tw:[&_p]:font-bold tw:[&_p]:leading-6 tw:[&_p]:text-ellipsis tw:[&_p]:whitespace-nowrap tw:[&_p]:m-0
                                            tw:max-md:pb-1 tw:max-md:[&_h3]:text-sm tw:max-md:[&_h3]:leading-5 tw:max-md:[&_h3]:mb-1.5
                                            tw:max-md:[&_p]:text-sm tw:max-md:[&_p]:leading-5
                                        "
                                                >
                                                    <h3>{person.displayName}</h3>
                                                    <p>
                                                        {person.partyAcronym}/{person.state}
                                                    </p>
                                                </div>
                                            </div>
                                        </header>

                                        <section
                                            className="parliamentarians__ratings tw:gap-4 tw:mt-6 tw:max-md:gap-3 tw:max-md:mt-4.5 tw:flex tw:flex-col"
                                            aria-label="Posicionamentos"
                                        >
                                            <div
                                                className="
                                        parliamentarians__rating tw:[&>strong]:min-w-0 tw:[&>strong]:overflow-hidden tw:[&>strong]:text-ellipsis
                                        tw:[&>strong]:whitespace-nowrap tw:max-md:text-xs tw:max-md:leading-[18px] tw:min-h-[var(--rating-art-height)]
                                        tw:text-ink tw:font-display tw:font-bold tw:text-base tw:leading-6 tw:[font-variation-settings:'wdth'_75] tw:uppercase
                                        tw:flex tw:items-center tw:gap-2 tw:[&>:first-child]:flex-none tw:[&>strong]:flex-1
                                    "
                                            >
                                                <span
                                                    className="parliamentarians__rating-art tw:relative tw:block tw:w-[var(--rating-art-width)] tw:h-[var(--rating-art-height)]"
                                                    aria-hidden="true"
                                                >
                                                    <Image
                                                        className="parliamentarians__proposal tw:absolute tw:top-0 tw:left-0 tw:block tw:w-[var(--proposal-width)] tw:h-[var(--rating-art-height)]"
                                                        src={unfavorableProposal}
                                                        alt=""
                                                        draggable={false}
                                                    />
                                                    <span
                                                        className="
                                                parliamentarians__thumb-badge tw:absolute tw:z-2
                                                tw:top-[calc((var(--rating-art-height)_-_var(--thumb-size))_/_2)] tw:right-0 tw:w-[var(--thumb-size)]
                                                tw:h-[var(--thumb-size)] tw:rounded-[50%] tw:[transform:rotate(-5deg)] tw:flex tw:items-center tw:justify-center
                                            "
                                                    >
                                                        <Image
                                                            className="parliamentarians__thumb tw:block tw:w-full tw:h-full"
                                                            src={thumbDown}
                                                            alt=""
                                                            draggable={false}
                                                        />
                                                    </span>
                                                </span>
                                                <strong>Desfavorável</strong>
                                                <span className="tw:min-w-0 tw:overflow-hidden tw:text-right tw:text-ellipsis tw:whitespace-nowrap">
                                                    {propositionCountLabel(
                                                        person.unfavorablePropositionsCount,
                                                    )}
                                                </span>
                                            </div>
                                            <div
                                                className="
                                        parliamentarians__rating tw:[&>strong]:min-w-0 tw:[&>strong]:overflow-hidden tw:[&>strong]:text-ellipsis
                                        tw:[&>strong]:whitespace-nowrap tw:max-md:text-xs tw:max-md:leading-[18px] tw:min-h-[var(--rating-art-height)]
                                        tw:text-ink tw:font-display tw:font-bold tw:text-base tw:leading-6 tw:[font-variation-settings:'wdth'_75] tw:uppercase
                                        tw:flex tw:items-center tw:gap-2 tw:[&>:first-child]:flex-none tw:[&>strong]:flex-1
                                    "
                                            >
                                                <span
                                                    className="parliamentarians__rating-art tw:relative tw:block tw:w-[var(--rating-art-width)] tw:h-[var(--rating-art-height)]"
                                                    aria-hidden="true"
                                                >
                                                    <Image
                                                        className="parliamentarians__proposal tw:absolute tw:top-0 tw:left-0 tw:block tw:w-[var(--proposal-width)] tw:h-[var(--rating-art-height)]"
                                                        src={favorableProposal}
                                                        alt=""
                                                        draggable={false}
                                                    />
                                                    <span
                                                        className="
                                                parliamentarians__thumb-badge tw:absolute tw:z-2
                                                tw:top-[calc((var(--rating-art-height)_-_var(--thumb-size))_/_2)] tw:right-0 tw:w-[var(--thumb-size)]
                                                tw:h-[var(--thumb-size)] tw:rounded-[50%] tw:[transform:rotate(-5deg)] tw:flex tw:items-center tw:justify-center
                                            "
                                                    >
                                                        <Image
                                                            className="parliamentarians__thumb tw:block tw:w-full tw:h-full"
                                                            src={thumbUp}
                                                            alt=""
                                                            draggable={false}
                                                        />
                                                    </span>
                                                </span>
                                                <strong>Favorável</strong>
                                                <span className="tw:min-w-0 tw:overflow-hidden tw:text-right tw:text-ellipsis tw:whitespace-nowrap">
                                                    {propositionCountLabel(person.favorablePropositionsCount)}
                                                </span>
                                            </div>
                                        </section>

                                        <dl
                                            className="
                                    parliamentarians__details tw:gap-0.5 tw:text-ink tw:text-sm tw:leading-6 tw:p-0 tw:mt-[24px] tw:mb-0 tw:mx-0
                                    tw:max-md:mt-[18px] tw:max-md:text-xs tw:max-md:leading-[18px] tw:[&_dd]:min-w-0 tw:[&_dd]:overflow-hidden
                                    tw:[&_dd]:text-ellipsis tw:[&_dd]:whitespace-nowrap tw:[&_dd]:text-right tw:[&_dd]:m-0 tw:flex tw:flex-col
                                "
                                        >
                                            <div className="tw:gap-2 tw:min-h-6 tw:max-md:min-h-4.5 tw:flex tw:justify-between tw:[&>:first-child]:min-w-0 tw:[&>:first-child]:flex-1">
                                                <dt className="tw:min-w-0 tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap tw:m-0">
                                                    Nascimento
                                                </dt>
                                                <dd>{person.birthDate}</dd>
                                            </div>
                                            <div className="tw:gap-2 tw:min-h-6 tw:max-md:min-h-4.5 tw:flex tw:justify-between tw:[&>:first-child]:min-w-0 tw:[&>:first-child]:flex-1">
                                                <dt className="tw:min-w-0 tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap tw:m-0">
                                                    Profissões
                                                </dt>
                                                <dd>{person.profession}</dd>
                                            </div>
                                            <div className="tw:gap-2 tw:min-h-6 tw:max-md:min-h-4.5 tw:flex tw:justify-between tw:[&>:first-child]:min-w-0 tw:[&>:first-child]:flex-1">
                                                <dt className="tw:min-w-0 tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap tw:m-0">
                                                    Escolaridade
                                                </dt>
                                                <dd>{person.education}</dd>
                                            </div>
                                            {/* <div><dt>Cor/Raça</dt><dd>{person.race}</dd></div> */}
                                            <div className="tw:gap-2 tw:min-h-6 tw:max-md:min-h-4.5 tw:flex tw:justify-between tw:[&>:first-child]:min-w-0 tw:[&>:first-child]:flex-1">
                                                <dt className="tw:min-w-0 tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap tw:m-0">
                                                    Religião
                                                </dt>
                                                <dd
                                                    className={cx([
                                                        {
                                                            "parliamentarians__detail--unavailable tw:text-muted":
                                                                person.religion === "Não informada",
                                                        },
                                                    ])}
                                                >
                                                    {person.religion}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <span
                                        className={String.raw`
                                    parliamentarians__hole tw:absolute tw:z-3 tw:top-[var(--hole-top)] tw:left-[50%] tw:w-[var(--hole-width)]
                                    tw:h-[var(--hole-height)] tw:border tw:border-solid tw:border-muted tw:rounded-[1000px] tw:bg-transparent
                                    tw:pointer-events-none tw:[transform:translateX(-50%)]
                                    tw:[.parliamentarians\_\_card--active_&]:shadow-[inset_-4px_4px_0_#0b0f5e]
                                `}
                                        aria-hidden="true"
                                    ></span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
