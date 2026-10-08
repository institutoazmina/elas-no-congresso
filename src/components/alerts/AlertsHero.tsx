import { Image, css } from "../shared/react-utils";
import attention from "../../assets/images/activity/attention.svg";
import halftoneShadow from "../../assets/images/hero/halftone-shadow.png";
import ilustracoesSixteen from "../../assets/images/aviao-papel.png";
import chevron from "../../assets/images/home-reportagens/chevron-right.svg";

export default function AlertsHero({ onOpen }: { onOpen: () => void }) {
    return (
        <section
            className="alerts-hero site-shared-background tw:text-ink tw:h-125 tw:overflow-hidden tw:relative tw:[&_h1]:mix-blend-multiply tw:[&_h1]:text-ink tw:[&_h1]:font-display tw:[&_h1]:text-7xl tw:[&_h1]:font-bold tw:[&_h1]:[font-variation-settings:'wdth'_75] tw:[&_h1]:tracking-normal tw:[&_h1]:leading-18 tw:[&_h1]:uppercase tw:[&_h1]:m-0 tw:[&_p]:mix-blend-multiply tw:[&_p]:text-ink tw:[&_p]:font-sans tw:[&_p]:text-lg tw:[&_p]:font-bold tw:[&_p]:tracking-normal tw:[&_p]:leading-6 tw:[&_p]:w-160 tw:[&_p]:m-0 tw:max-[1101px]:[&_h1]:text-[58px] tw:max-[1101px]:[&_h1]:leading-15 tw:max-md:h-auto tw:max-md:min-h-0 tw:max-md:pb-6 tw:max-md:[&_h1]:text-[clamp(42px,11vw,58px)] tw:max-md:[&_h1]:leading-[0.98] tw:max-md:[&_h1]:text-left tw:max-md:[&_h1]:w-max tw:max-md:[&_h1]:p-0 tw:max-md:[&_p]:text-lg tw:max-md:[&_p]:leading-6 tw:max-md:[&_p]:max-w-86.5 tw:max-md:[&_p]:text-left tw:max-md:[&_p]:w-full tw:max-md:[&_p]:p-0 tw:max-md:[&_p]:m-0 tw:bg-white tw:bg-[url('/src/assets/images/background/bg-pattern-rough-paper.png')] tw:bg-top tw:bg-repeat tw:bg-size-[400px_400px]"
            data-page-hero
            aria-labelledby="alerts-hero-title"
            style={css(`--alerts-hero-halftone-shadow: url(${halftoneShadow.src})`)}
        >
            <div className="alerts-hero__top-row tw:items-center tw:flex tw:h-119 tw:justify-between tw:relative tw:z-2 tw:p-12 tw:max-md:items-start tw:max-md:h-auto tw:max-md:py-12 tw:max-md:px-4 ">
                <div className="alerts-hero__content tw:items-start tw:flex tw:flex-[1_0_0] tw:flex-col tw:gap-6 tw:justify-center tw:max-w-240 tw:min-w-0 tw:max-md:items-start tw:max-md:gap-4 tw:max-md:max-w-86.5 tw:max-md:w-full ">
                    <Image
                        className="alerts-hero__attention tw:block tw:flex-none tw:h-2 tw:w-24 tw:max-md:h-1 "
                        src={attention}
                        loading="eager"
                        alt=""
                    />
                    <h1 className="" id="alerts-hero-title">
                        Alertas
                    </h1>
                    <p className="">Acompanhe as movimentações do Legislativo no Radar do Congresso</p>
                    <button
                        className="alerts-hero__button tw:cursor-pointer tw:hover:bg-ink tw:focus-visible:bg-ink tw:focus-visible:outline-2 tw:focus-visible:outline-ink tw:focus-visible:outline-offset-2 tw:transition-colors tw:duration-150 tw:motion-reduce:transition-none tw:items-center tw:bg-accent tw:border-0 tw:text-white tw:flex tw:flex-none tw:gap-2 tw:h-14 tw:justify-center tw:w-70.5 tw:pt-4.5 tw:pb-3.5 tw:px-6 tw:[&_span]:font-display tw:[&_span]:text-xl tw:[&_span]:font-bold tw:[&_span]:[font-variation-settings:'wdth'_75] tw:[&_span]:leading-6 tw:[&_span]:uppercase tw:[&_span]:whitespace-nowrap tw:max-md:self-start tw:max-md:h-11.5 tw:max-md:max-w-full tw:max-md:w-max tw:max-md:py-0 tw:max-md:px-3 tw:max-md:[&_span]:text-base "
                        type="button"
                        onClick={onOpen}
                    >
                        <span className="">Receber alertas por e-mail</span>
                        <span className="alerts-hero__button-icon tw:items-center tw:flex tw:h-6 tw:justify-center tw:w-3 tw:[&_img]:block tw:[&_img]:h-2.5 tw:[&_img]:transform-[rotate(-90deg)] tw:[&_img]:w-3.5 ">
                            <Image className="" src={chevron} loading="eager" alt="" />
                        </span>
                    </button>
                </div>

                <div
                    className="alerts-hero__illustration tw:flex-none tw:h-122 tw:overflow-hidden tw:relative tw:top-5 tw:w-126.5 tw:my-0 tw:mx-9.5 tw:max-[1101px]:transform-[scale(0.86)] tw:max-[1101px]:origin-[right_center] tw:max-md:hidden "
                    aria-hidden="true"
                >
                    <span className="alerts-hero__illustration-image tw:h-144.5 tw:left-[calc(50%-16px)] tw:absolute tw:top-[calc(50%-40px)] tw:transform-[translate(-50%,-50%)] tw:w-88 tw:[&_img]:h-[104.39%] tw:[&_img]:left-[-16.01%] tw:[&_img]:max-w-none tw:[&_img]:absolute tw:[&_img]:top-[-1.63%] tw:[&_img]:w-[136.91%] ">
                        <Image className="" src={ilustracoesSixteen} loading="eager" alt="" />
                    </span>
                </div>
            </div>
            <div
                className="alerts-hero__shadow tw:bg-(image:--alerts-hero-halftone-shadow) tw:bg-bottom-left tw:bg-repeat-x tw:bg-size-[1440px_24px] tw:bottom-0 tw:block tw:h-6 tw:left-0 tw:mix-blend-multiply tw:pointer-events-none tw:absolute tw:w-full tw:z-3 "
                aria-hidden="true"
            ></div>
        </section>
    );
}
