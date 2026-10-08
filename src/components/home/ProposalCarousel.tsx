import { Image, css, cx } from "../shared/react-utils";
import { useCarousel } from "../../hooks/useCarousel";
import ProposalCard, { type Variant } from "./ProposalCard";
import type { ActivityProposition, EnactedProject } from "../../lib/activity-api";
import background from "../../assets/images/parliamentarians/bg-pattern.svg";
import mobileBackground from "../../assets/images/enacted-projects/carousel-pattern.png";
import shadow from "../../assets/images/hero/halftone-shadow.png";
import arrowBack from "../../assets/images/parliamentarians/arrow-back.svg";
import arrowForward from "../../assets/images/parliamentarians/arrow-forward.svg";

interface Props {
    projects: (ActivityProposition | EnactedProject)[];
    variant: Variant;
}
export default function ProposalCarousel({ projects, variant }: Props) {
    const { trackRef, index: active, move, style } = useCarousel(projects.length);
    const cards = [...projects, ...projects, ...projects];

    return (
        <div
            className={cx([
                "proposal-carousel tw:relative tw:w-full tw:overflow-hidden tw:bg-(image:--carousel-background) tw:bg-top-left tw:bg-repeat tw:bg-size-[400px_400px] tw:before:absolute tw:before:inset-x-0 tw:before:top-0 tw:before:z-1 tw:before:h-6 tw:before:bg-(image:--carousel-shadow) tw:before:bg-bottom-left tw:before:bg-repeat-x tw:before:bg-size-[1440px_24px] tw:before:content-[''] tw:before:pointer-events-none tw:before:mix-blend-multiply tw:before:scale-y-[-1] tw:after:absolute tw:after:inset-x-0 tw:after:bottom-0 tw:after:z-1 tw:after:h-6 tw:after:bg-(image:--carousel-shadow) tw:after:bg-bottom-left tw:after:bg-repeat-x tw:after:bg-size-[1440px_24px] tw:after:content-[''] tw:after:pointer-events-none tw:after:mix-blend-multiply tw:max-md:before:h-3 tw:max-md:after:h-3",
                {
                    "tw:h-135.5 tw:mt-8.5 tw:max-md:h-97 tw:max-md:mt-2.5": variant === "fast",
                    "tw:h-161 tw:mt-8.5 tw:max-md:h-112.5 tw:max-md:mt-2.5": variant === "slow",
                    "tw:h-167.5 tw:my-6 tw:max-md:h-116 tw:max-md:bg-(image:--carousel-mobile-background)":
                        variant === "enacted",
                },
            ])}
            style={css(
                `--carousel-background:url(${background.src});--carousel-mobile-background:url(${mobileBackground.src});--carousel-shadow:url(${shadow.src})`,
            )}
            data-proposal-carousel
            data-group-size={projects.length}
        >
            <div className="tw:absolute tw:z-3 tw:top-12 tw:left-[calc(50%_-_58px)] tw:flex tw:gap-1">
                {[
                    { direction: "previous", label: "Proposição anterior", image: arrowBack },
                    { direction: "next", label: "Próxima proposição", image: arrowForward },
                ].map(({ direction, label, image }) => (
                    <button
                        key={direction}
                        type="button"
                        onClick={() => move(direction === "previous" ? -1 : 1)}
                        data-carousel-direction={direction}
                        aria-label={label}
                        disabled={projects.length < 2}
                        className="tw:flex tw:w-14 tw:h-10 tw:items-center tw:justify-center tw:border-2 tw:border-accent tw:bg-white tw:p-2 tw:text-accent tw:cursor-pointer tw:hover:bg-[#eeeeff] tw:focus-visible:outline-2 tw:focus-visible:outline-ink tw:focus-visible:outline-offset-1 tw:disabled:opacity-50 tw:disabled:cursor-default"
                    >
                        <Image src={image} alt="" width={24} height={24} />
                    </button>
                ))}
            </div>
            <div className="tw:absolute tw:z-2 tw:top-28 tw:left-0 tw:w-full tw:overflow-x-clip tw:overflow-y-visible">
                <div
                    ref={trackRef}
                    style={style}
                    data-carousel-track
                    className="tw:relative tw:left-1/2 tw:flex tw:w-max tw:items-start tw:gap-12 tw:transition-transform tw:duration-200 tw:ease-in-out tw:motion-reduce:transition-none tw:max-md:gap-6.5 tw:[--carousel-card-width:384px] tw:[--carousel-gap:48px] tw:max-md:[--carousel-card-width:226px] tw:max-md:[--carousel-gap:26px]"
                >
                    {cards.map((project, index) => Math.abs(index - active) > 3 ? (
                        <div key={index} className="tw:w-[var(--carousel-card-width)] tw:flex-none" aria-hidden="true" />
                    ) : (
                        <ProposalCard
                            key={index}
                            project={project}
                            variant={variant}
                            featured={index === active}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
