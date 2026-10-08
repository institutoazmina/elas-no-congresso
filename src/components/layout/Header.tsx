import azmLogo from "../../assets/images/charts/azm.svg";
import HighlighterMarks from "../shared/HighlighterMarks";

const links = [
    { href: "/atividade-legislativa", label: "Atividade legislativa" },
    { href: "/alertas", label: "Alertas" },
    { href: "/ia-feminista", label: "IA feminista" },
    { href: "/reportagens", label: "Reportagens" },
    { href: "/sobre", label: "Sobre" },
];

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { css } from "../shared/react-utils";
import { useMediaQuery } from "../../hooks/useMediaQuery";
export default function Header({ currentPath }: { currentPath: string }) {
    const headerRef = useRef<HTMLElement>(null);
    const navRef = useRef<HTMLElement>(null);
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [surface, setSurface] = useState("");
    const [highlight, setHighlight] = useState<CSSProperties>();
    const mobile = useMediaQuery("(max-width: 767px)");
    useEffect(() => {
        let previous = Math.max(window.scrollY, 0),
            frame = 0;
        const update = () => {
            frame = 0;
            const y = Math.max(window.scrollY, 0),
                delta = y - previous;
            setScrolled(y > 8);
            if (y <= 8 || open) setHidden(false);
            else if (Math.abs(delta) >= 8) setHidden(delta > 0);
            if (Math.abs(delta) >= 8 || y <= 8) previous = y;
            const hero = document.querySelector<HTMLElement>("[data-page-hero]");
            const header = headerRef.current;
            if (hero && header && hero.getBoundingClientRect().bottom > header.offsetHeight) {
                const styles = getComputedStyle(hero);
                setSurface(
                    `${styles.backgroundColor} ${styles.backgroundImage} ${styles.backgroundPosition} / ${styles.backgroundSize} ${styles.backgroundRepeat}`,
                );
            } else setSurface("");
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        update();
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, [open]);
    useEffect(() => {
        const nav = navRef.current;
        if (!nav) return;
        let cancelled = false;
        const update = () => {
            if (cancelled) return;
            const compact = matchMedia("(max-width: 820px)").matches;
            const target = compact
                ? ["/sobre", "/ia-feminista", "/reportagens"].includes(currentPath)
                    ? null
                    : nav.querySelector<HTMLElement>(".site-header__brand")
                : Array.from(nav.querySelectorAll<HTMLElement>("[data-highlighter-target]")).find(
                      (item) =>
                          item.dataset.highlighterRoutes === currentPath && item.getClientRects().length,
                  );
            if (!target) {
                setHighlight(undefined);
                return;
            }
            const bounds = target.getBoundingClientRect(),
                origin = nav.getBoundingClientRect();
            const brand = target.classList.contains("site-header__brand");
            const scale = mobile && brand ? bounds.width / 128 : 1;
            const width = brand ? (mobile ? 149 * scale : 217) : bounds.width + 32;
            const left =
                mobile && brand
                    ? bounds.left - origin.left - 10 * scale
                    : bounds.left - origin.left + (bounds.width - width) / 2;
            setHighlight(
                css(
                    `--highlighter-left:${left}px;--highlighter-top:${bounds.top - origin.top + bounds.height / 2 - (mobile && brand ? scale : 0)}px;--highlighter-width:${width}px;--highlighter-height:${mobile && brand ? 30 * scale : 52}px`,
                ),
            );
        };
        const observer = new ResizeObserver(update);
        observer.observe(nav);
        nav.querySelectorAll("[data-highlighter-target]").forEach((node) => observer.observe(node));
        document.fonts.ready.then(update);
        update();
        return () => {
            cancelled = true;
            observer.disconnect();
        };
    }, [currentPath, mobile, open]);
    return (
        <header
            ref={headerRef}
            style={surface ? css(`--header-hero-surface: ${surface}`) : undefined}
            className={`${scrolled ? (mobile ? "site-header--scrolled" : "site-header--desktop-scrolled") : ""} ${hidden && !open ? (mobile ? "site-header--hidden" : "site-header--desktop-hidden") : ""} ${surface ? "site-header--over-hero" : ""} site-header site-shared-background tw:text-ink tw:min-h-13 tw:min-[821px]:min-h-26 tw:sticky tw:top-0 tw:z-100
    tw:w-full tw:[transition:transform_180ms_ease,_background-color_180ms_ease] tw:[transform:translateY(0)]
    tw:[will-change:transform] tw:max-md:sticky tw:max-md:z-100 tw:max-md:top-0 tw:max-md:w-full tw:max-md:bg-white
    tw:max-md:bg-[url('/src/assets/images/background/bg-pattern-rough-paper.png')] tw:max-md:bg-top tw:max-md:bg-repeat
    tw:max-md:bg-size-[400px_400px] tw:max-md:[transition:transform_180ms_ease,_background-color_180ms_ease]
    tw:max-md:[transform:translateY(0)] tw:max-md:[will-change:transform]
    tw:md:[transition:transform_180ms_ease,_background-color_180ms_ease]
    tw:md:[&.site-header--desktop-scrolled_.highlighter-marks]:hidden
    tw:max-md:[.site-header&.site-header--hidden]:[transform:translateY(-100%)]
    tw:md:[.site-header&.site-header--desktop-hidden]:[transform:translateY(-100%)]
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--scrolling-up:not(.site-header--desktop-hidden):not(.site-header--over-hero)]:bg-white
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--scrolling-up:not(.site-header--desktop-hidden):not(.site-header--over-hero)]:bg-none
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--scrolling-up:not(.site-header--desktop-hidden):not(.site-header--over-hero)]:[-webkit-backdrop-filter:none]
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--scrolling-up:not(.site-header--desktop-hidden):not(.site-header--over-hero)]:[backdrop-filter:none]
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--scrolling-up:not(.site-header--desktop-hidden):not(.site-header--over-hero)]:shadow-none
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--desktop-hidden:not(.site-header--over-hero)]:bg-white
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--desktop-hidden:not(.site-header--over-hero)]:bg-none
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--desktop-hidden:not(.site-header--over-hero)]:[-webkit-backdrop-filter:none]
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--desktop-hidden:not(.site-header--over-hero)]:[backdrop-filter:none]
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--desktop-hidden:not(.site-header--over-hero)]:shadow-none
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--over-hero]:bg-[var(--header-hero-surface,_#fff)]
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--over-hero]:bg-[url('/src/assets/images/background/bg-pattern-rough-paper.png')]
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--over-hero]:bg-top
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--over-hero]:bg-repeat
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--over-hero]:bg-size-[400px_400px]
    tw:md:[.site-header&.site-header--desktop-scrolled.site-header--over-hero]:[background-blend-mode:multiply]
    tw:md:[.site-alerts-header-background_>_.site-header&.site-header--desktop-scrolled]:fixed
    tw:md:[.site-alerts-header-background_>_.site-header&.site-header--desktop-scrolled]:inset-[0_0_auto]
    tw:[body:has(&)]:m-0 tw:[.author-route-page_&]:box-border
 tw:bg-white tw:bg-[url('/src/assets/images/background/bg-pattern-rough-paper.png')] tw:bg-top tw:bg-repeat tw:bg-size-[400px_400px]`}
        >
            <nav
                ref={navRef}
                className="
            site-header__content container-fluid wrap tw:!max-w-screen tw:items-center tw:flex tw:gap-4 tw:justify-between
            tw:min-h-13 tw:relative tw:py-0 tw:px-4 tw:my-0 tw:mx-auto tw:max-md:min-h-13 tw:max-md:py-0 tw:max-md:px-4
            tw:min-[821px]:gap-5.5 tw:min-[821px]:min-h-26 tw:min-[821px]:py-0 tw:min-[821px]:px-6 tw:min-[1051px]:gap-8
            tw:min-[1051px]:py-0 tw:min-[1051px]:px-12 tw:[&_>_:not(.highlighter-marks)]:relative
            tw:[&_>_:not(.highlighter-marks)]:z-1 tw:[.site-header_&]:w-full tw:[.author-route-page_.site-header_&]:w-full
            tw:[.site-header_&]:max-w-327.5 tw:[.author-route-page_.site-header_&]:max-w-327.5
        "
                aria-label="Navegação principal"
            >
                <a
                    href="/"
                    onClick={() => setOpen(false)}
                    className="
                site-header__brand logo-header tw:hover:bg-[#4745e8] tw:min-[821px]:h-[26px] tw:min-[821px]:w-57.5 tw:bg-ink
                tw:bg-none tw:flex-none tw:h-3.5 tw:w-32
                tw:[-webkit-mask:url('/src/assets/images/logo-header.svg')_center_/_contain_no-repeat]
                tw:[mask:url('/src/assets/images/logo-header.svg')_center_/_contain_no-repeat]
                tw:[transition:background-color_0.4s_ease]
            "
                    data-highlighter-target
                    data-highlighter-routes="/"
                    aria-label="Elas no Congresso"
                ></a>

                <div
                    className="
            site-header__desktop-links tw:items-center tw:hidden tw:gap-10 tw:ml-auto tw:[&_a]:text-inherit
            tw:[&_a]:font-display tw:[&_a]:text-lg tw:[&_a]:font-bold tw:[&_a]:[font-variation-settings:'wdth'_75]
            tw:[&_a]:tracking-normal tw:[&_a]:leading-6 tw:[&_a]:no-underline tw:[&_a]:uppercase tw:[&_a]:whitespace-nowrap
            tw:[&_a]:[transition:color_0.4s_ease] tw:min-[821px]:gap-5.5 tw:min-[821px]:flex tw:min-[821px]:[&_a]:text-base
            tw:min-[1051px]:gap-10 tw:min-[1051px]:[&_a]:text-lg
        "
                >
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="ff1 tw:hover:text-[#6075ce] tw:[.site-header_&]:font-display tw:[.author-route-page_.site-header_&]:font-display"
                            data-highlighter-target
                            data-highlighter-routes={link.href}
                            aria-current={currentPath === link.href ? "page" : undefined}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <a
                    className="
                site-header__azm tw:hover:bg-[#4745e8] tw:hidden tw:min-[821px]:block tw:bg-ink tw:flex-none tw:h-[36px] tw:w-16
                tw:[-webkit-mask:var(--site-header-azm-logo)_center_/_contain_no-repeat]
                tw:[mask:var(--site-header-azm-logo)_center_/_contain_no-repeat] tw:[transition:background-color_0.4s_ease]
            "
                    href="https://azmina.com.br/"
                    aria-label="Revista AzMina"
                    style={css(`--site-header-azm-logo: url("${azmLogo.src}")`)}
                ></a>

                <HighlighterMarks style={highlight} />

                <details
                    open={open}
                    onToggle={(event) => setOpen(event.currentTarget.open)}
                    className="
            site-header__mobile-menu tw:block tw:relative tw:max-md:static tw:min-[821px]:hidden
            tw:[&_summary::-webkit-details-marker]:hidden tw:max-md:[:global(html:has(&[open]))]:overflow-hidden
            tw:max-md:[:global(body:has(&[open]))]:overflow-hidden tw:max-md:[.site-header:has(&[open])]:fixed
            tw:max-md:[.site-header:has(&[open])]:inset-[0_0_auto]
            tw:max-md:[.site-header:has(&[open])]:[transform:translateY(0)]
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--scrolling-up:not(.site-header--hidden):not(.site-header--over-hero):not(:has(&[open]))]:border-0
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--scrolling-up:not(.site-header--hidden):not(.site-header--over-hero):not(:has(&[open]))]:bg-white
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--scrolling-up:not(.site-header--hidden):not(.site-header--over-hero):not(:has(&[open]))]:bg-none
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--scrolling-up:not(.site-header--hidden):not(.site-header--over-hero):not(:has(&[open]))]:[-webkit-backdrop-filter:none]
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--scrolling-up:not(.site-header--hidden):not(.site-header--over-hero):not(:has(&[open]))]:[backdrop-filter:none]
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--scrolling-up:not(.site-header--hidden):not(.site-header--over-hero):not(:has(&[open]))]:shadow-none
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--hidden:not(.site-header--over-hero):not(:has(&[open]))]:border-0
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--hidden:not(.site-header--over-hero):not(:has(&[open]))]:bg-white
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--hidden:not(.site-header--over-hero):not(:has(&[open]))]:bg-none
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--hidden:not(.site-header--over-hero):not(:has(&[open]))]:[-webkit-backdrop-filter:none]
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--hidden:not(.site-header--over-hero):not(:has(&[open]))]:[backdrop-filter:none]
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--hidden:not(.site-header--over-hero):not(:has(&[open]))]:shadow-none
            tw:max-md:[.site-header--scrolled:not(:has(&[open]))_.highlighter-marks]:hidden
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--over-hero:not(:has(&[open]))]:bg-[var(--header-hero-surface,_#fff)]
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--over-hero:not(:has(&[open]))]:bg-[url('/src/assets/images/background/bg-pattern-rough-paper.png')]
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--over-hero:not(:has(&[open]))]:bg-top
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--over-hero:not(:has(&[open]))]:bg-repeat
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--over-hero:not(:has(&[open]))]:bg-size-[400px_400px]
            tw:max-md:[.site-header.site-shared-background.site-header--scrolled.site-header--over-hero:not(:has(&[open]))]:[background-blend-mode:multiply]
            tw:max-md:[&[open]_summary_span:nth-child(1)]:top-[14px]
            tw:max-md:[&[open]_summary_span:nth-child(1)]:[transform:rotate(45deg)]
            tw:max-md:[&[open]_summary_span:nth-child(2)]:opacity-0 tw:max-md:[&[open]_summary_span:nth-child(3)]:top-[14px]
            tw:max-md:[&[open]_summary_span:nth-child(3)]:[transform:rotate(-45deg)]
            tw:max-md:[body.alerts-email-modal-open_&_summary]:w-7 tw:max-md:[body.alerts-email-modal-open_&_summary]:h-5.5
            tw:max-md:[body.alerts-email-modal-open_&_summary_span]:left-1
            tw:max-md:[body.alerts-email-modal-open_&_summary_span]:w-5
            tw:max-md:[body.alerts-email-modal-open_&_summary_span:nth-child(1)]:top-1
            tw:max-md:[body.alerts-email-modal-open_&_summary_span:nth-child(2)]:top-2.5
            tw:max-md:[body.alerts-email-modal-open_&_summary_span:nth-child(3)]:top-4
            tw:max-md:[body.alerts-email-modal-open_&[open]_summary_span:nth-child(1)]:top-2.5
            tw:max-md:[body.alerts-email-modal-open_&[open]_summary_span:nth-child(3)]:top-2.5
        "
                >
                    <summary
                        className="tw:cursor-pointer tw:gap-[6px] tw:h-5.5 tw:list-none tw:w-7 tw:p-0 tw:max-md:relative tw:max-md:block tw:max-md:w-7 tw:max-md:h-7 tw:flex tw:flex-col"
                        aria-label="Abrir menu"
                    >
                        <span
                            className="
                    tw:bg-current tw:block tw:h-0.5 tw:w-7 tw:max-md:absolute tw:max-md:left-0
                    tw:max-md:[transition:top_180ms_ease,_opacity_180ms_ease,_transform_180ms_ease] tw:max-md:top-1
                "
                        ></span>
                        <span
                            className="
                    tw:bg-current tw:block tw:h-0.5 tw:w-7 tw:max-md:absolute tw:max-md:left-0
                    tw:max-md:[transition:top_180ms_ease,_opacity_180ms_ease,_transform_180ms_ease] tw:max-md:top-[14px]
                "
                        ></span>
                        <span
                            className="
                    tw:bg-current tw:block tw:h-0.5 tw:w-7 tw:max-md:absolute tw:max-md:left-0
                    tw:max-md:[transition:top_180ms_ease,_opacity_180ms_ease,_transform_180ms_ease] tw:max-md:top-5.5
                "
                        ></span>
                    </summary>
                    <div
                        className="
                site-header__mobile-panel tw:[&_a]:text-inherit tw:[&_a]:font-display tw:[&_a]:text-lg tw:[&_a]:font-bold
                tw:[&_a]:[font-variation-settings:'wdth'_75] tw:[&_a]:tracking-normal tw:[&_a]:leading-6 tw:[&_a]:no-underline
                tw:[&_a]:uppercase tw:[&_a]:whitespace-nowrap tw:[&_a]:relative tw:[&_a]:z-12 tw:bg-white tw:border-t-[4px]
                tw:border-solid tw:border-t-lime tw:shadow-[0_12px_20px_rgba(11,_15,_94,_0.16)] tw:gap-5 tw:absolute tw:right-0
                tw:top-[calc(100%_+_8px)] tw:w-[min(320px,_calc(100vw_-_32px))] tw:z-10 tw:p-6 tw:max-md:[&_a]:flex
                tw:max-md:[&_a]:w-full tw:max-md:[&_a]:items-center tw:max-md:[&_a]:border-b tw:max-md:[&_a]:border-solid
                tw:max-md:[&_a]:border-b-[rgba(255,_255,_255,_0.3)] tw:max-md:[&_a]:text-white tw:max-md:[&_a]:text-left
                tw:max-md:[&_a]:py-4 tw:max-md:[&_a]:px-6 tw:max-md:fixed tw:max-md:inset-[52px_0_0] tw:max-md:z-99
                tw:max-md:w-full tw:max-md:min-h-[calc(100dvh_-_52px)] tw:max-md:[align-content:start] tw:max-md:gap-0
                tw:max-md:overflow-y-auto tw:max-md:border-0 tw:max-md:bg-ink tw:max-md:shadow-none tw:max-md:p-0 tw:flex
                tw:flex-col tw:max-md:flex tw:max-md:flex-col
            "
                    >
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="ff1 tw:[.site-header_&]:font-display tw:[.author-route-page_.site-header_&]:font-display"
                                data-highlighter-target
                                data-highlighter-routes={link.href}
                                aria-current={currentPath === link.href ? "page" : undefined}
                            >
                                <span>{link.label}</span>
                            </a>
                        ))}
                    </div>
                </details>
            </nav>
        </header>
    );
}
