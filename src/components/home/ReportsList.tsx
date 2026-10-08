import { useEffect, useState } from "react";
import { Image, css } from "../shared/react-utils";
import ReportagemCard from "../shared/ReportagemCard";
import { WP_REPORTAGENS_ENDPOINT, type WpPost } from "../../lib/wp";
import paginationPrevious from "../../assets/images/reportagens/pagination-previous.svg";
import paginationNext from "../../assets/images/reportagens/pagination-next.svg";
import halftoneShadow from "../../assets/images/hero/halftone-shadow.png";
export default function ReportsList({
    initialPosts,
    totalPages,
}: {
    initialPosts: WpPost[];
    totalPages: number;
}) {
    const [posts, setPosts] = useState(initialPosts);
    const [allPostsTotalPages, setTotalPages] = useState(totalPages);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        const read = () => {
            const value = Number(new URLSearchParams(location.search).get("pagina"));
            setPage(Number.isInteger(value) && value > 0 ? Math.min(value, Math.max(1, totalPages)) : 1);
        };
        read();
        window.addEventListener("popstate", read);
        return () => window.removeEventListener("popstate", read);
    }, [totalPages]);
    function navigate(next: number) {
        setPage(next);
        const url = new URL(location.href);
        if (next === 1) url.searchParams.delete("pagina");
        else url.searchParams.set("pagina", String(next));
        history.pushState({}, "", url);
    }
    useEffect(() => {
        const controller = new AbortController();
        setError(false);
        if (page === 1) {
            setPosts(initialPosts);
            setLoading(false);
            return () => controller.abort();
        }
        setLoading(true);
        const query = new URLSearchParams({
            _embed: "wp:featuredmedia",
            per_page: "9",
            offset: String(3 + (page - 1) * 9),
            orderby: "date",
            order: "desc",
        });
        fetch(`${WP_REPORTAGENS_ENDPOINT}?${query}`, { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error(String(response.status));
                const data = (await response.json()) as WpPost[];
                if (controller.signal.aborted) return;
                setPosts(data);
                setTotalPages(
                    Math.ceil(Math.max(Number(response.headers.get("x-wp-total") ?? 0) - 3, 0) / 9),
                );
            })
            .catch(() => {
                if (!controller.signal.aborted) setError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => controller.abort();
    }, [page, retry, initialPosts]);
    return (
        <section
            className="reportagens-all tw:[&_h2]:items-start tw:[&_h2]:flex tw:[&_h2]:font-display tw:[&_h2]:text-[32px] tw:[&_h2]:font-bold tw:[&_h2]:[font-variation-settings:'wdth'_75] tw:[&_h2]:leading-[42px] tw:[&_h2]:max-w-full tw:[&_h2]:uppercase tw:[&_h2]:w-205 tw:[&_h2]:mt-0 tw:[&_h2]:mb-12 tw:[&_h2]:mx-0 tw:max-[901px]:[&_h2]:mb-10 tw:[--reportagens-all-inline-padding:48px] tw:p-[72px_var(--reportagens-all-inline-padding)_0] tw:max-[901px]:[--reportagens-all-inline-padding:24px] tw:max-[901px]:p-[64px_var(--reportagens-all-inline-padding)_0] tw:max-[561px]:[--reportagens-all-inline-padding:24px] tw:max-[561px]:pt-18 tw:max-[561px]:pb-[86px] tw:max-[561px]:pr-[24px] tw:max-[561px]:pl-6"
            aria-labelledby="todas-reportagens-title"
            data-reportagens-pagination
            aria-busy={loading}
            data-pagination-endpoint={WP_REPORTAGENS_ENDPOINT}
            data-pagination-total-pages={allPostsTotalPages}
        >
            <div className="reportagens-all__content tw:max-w-336 tw:w-full tw:my-0 tw:mx-auto">
                <h2
                    className="tw:max-[561px]:leading-8 tw:max-[561px]:mb-12 tw:max-[561px]:min-h-10.5 tw:max-[561px]:[text-box-edge:cap_alphabetic] tw:max-[561px]:[text-box-trim:trim-both] tw:max-[561px]:w-full"
                    id="todas-reportagens-title"
                >
                    <span className="tw:flex-[0_0_292px] tw:text-center tw:max-[561px]:basis-73 tw:max-[561px]:text-left tw:max-[561px]:leading-8">
                        Todas as reportagens
                    </span>
                </h2>
                {error && (
                    <p role="alert">
                        Não foi possível carregar esta página.{" "}
                        <button type="button" onClick={() => setRetry((value) => value + 1)}>
                            Tentar novamente
                        </button>
                    </p>
                )}
                {posts.length > 0 ? (
                    <div
                        className={String.raw`reportagens-all__grid tw:mx-auto tw:flex tw:max-w-336 tw:flex-wrap tw:justify-between tw:gap-24 tw:[&>*]:min-w-0 tw:[&>*]:flex-none tw:[&>*]:w-[calc((100%_-_192px)/3)] tw:max-[901px]:gap-x-6 tw:max-[901px]:gap-y-16 tw:max-[901px]:[&>*]:w-[calc((100%_-_24px)/2)] tw:max-[901px]:[&_.reportagem-card]:w-full tw:max-[901px]:[&_.reportagem-card\_\_image]:w-full tw:max-[561px]:w-full tw:max-[561px]:max-w-none tw:max-[561px]:flex-col tw:max-[561px]:gap-24 tw:max-[561px]:[&>*]:w-full tw:max-[561px]:[&_.reportagem-card]:flex-none tw:max-[561px]:[&_.reportagem-card\_\_image]:aspect-[384/216] tw:max-[561px]:[&_.reportagem-card\_\_image]:h-auto tw:max-[561px]:[&_.reportagem-card_h3]:min-h-0`}
                    >
                        {posts.map((post) => (
                            <div
                                key={post.link}
                                className="tw:max-[561px]:w-full"
                                data-reportagem-pagination-card
                            >
                                <ReportagemCard post={post} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p
                        className="reportagens-feedback reportagens-feedback--light tw:text-base tw:leading-6 tw:relative tw:z-2 tw:text-navy tw:my-12 tw:mx-0"
                        role="status"
                    >
                        N&atilde;o foi poss&iacute;vel carregar as reportagens.
                    </p>
                )}
            </div>
            {allPostsTotalPages > 1 && (
                <div
                    className="reportagens-pagination-region tw:h-[196px] tw:ml-[calc(var(--reportagens-all-inline-padding)_*_-1)] tw:mt-7.5 tw:overflow-hidden tw:relative tw:w-[calc(100%_+_(var(--reportagens-all-inline-padding)_*_2))] tw:max-[561px]:-ml-6 tw:max-[561px]:mt-[70px] tw:max-[561px]:w-[calc(100%_+_48px)] tw:before:bg-[image:var(--reportagens-hero-halftone-shadow)] tw:before:bg-top-left tw:before:bg-repeat-x tw:before:bg-size-[1440px_24px] tw:before:content-[''] tw:before:h-6 tw:before:left-0 tw:before:mix-blend-multiply tw:before:pointer-events-none tw:before:absolute tw:before:right-0 tw:before:top-7.5 tw:before:[transform:rotate(180deg)] tw:before:z-1 tw:max-[561px]:before:bg-[image:var(--reportagens-hero-halftone-shadow)] tw:max-[561px]:before:bg-top-left tw:max-[561px]:before:bg-repeat-x tw:max-[561px]:before:bg-size-[720px_12px] tw:max-[561px]:before:content-[''] tw:max-[561px]:before:h-3 tw:max-[561px]:before:left-0 tw:max-[561px]:before:mix-blend-multiply tw:max-[561px]:before:pointer-events-none tw:max-[561px]:before:absolute tw:max-[561px]:before:right-0 tw:max-[561px]:before:z-1 tw:max-[561px]:before:top-7.5 tw:max-[561px]:before:[transform:rotate(180deg)] tw:max-[561px]:after:bg-[image:var(--reportagens-hero-halftone-shadow)] tw:max-[561px]:after:bg-top-left tw:max-[561px]:after:bg-repeat-x tw:max-[561px]:after:bg-size-[720px_12px] tw:max-[561px]:after:content-[''] tw:max-[561px]:after:h-3 tw:max-[561px]:after:left-0 tw:max-[561px]:after:mix-blend-multiply tw:max-[561px]:after:pointer-events-none tw:max-[561px]:after:absolute tw:max-[561px]:after:right-0 tw:max-[561px]:after:z-1 tw:max-[561px]:after:bottom-[30px]"
                    style={css(`--reportagens-hero-halftone-shadow: url(${halftoneShadow.src})`)}
                >
                    <div
                        className="reportagens-pagination-region__texture site-shared-background tw:max-[561px]:bottom-[30px] tw:max-[561px]:top-7.5 tw:[background-position:center_-30px] tw:bottom-0 tw:left-0 tw:pointer-events-none tw:absolute tw:right-0 tw:top-7.5 tw:z-0 tw:bg-white tw:bg-[url('/src/assets/images/background/bg-pattern-rough-paper.png')] tw:bg-top tw:bg-repeat tw:bg-size-[400px_400px]"
                        aria-hidden="true"
                    ></div>
                    <nav
                        className="reportagens-pagination tw:items-start tw:flex tw:gap-1 tw:justify-center tw:left-0 tw:absolute tw:right-0 tw:top-19.5 tw:z-2 tw:m-0"
                        aria-label="Pagina&#231;&#227;o das reportagens"
                    >
                        <button
                            className="reportagens-pagination__button tw:items-center tw:bg-white tw:border-[2px] tw:border-solid tw:border-accent tw:text-accent tw:cursor-pointer tw:flex tw:h-10 tw:justify-center tw:[transition:background-color_150ms_ease,_color_150ms_ease] tw:w-14 tw:py-2 tw:px-4 tw:[&>span]:items-center tw:[&>span]:flex tw:[&>span]:h-6 tw:[&>span]:justify-center tw:[&>span]:w-6 tw:[&_img]:block tw:[&_img]:h-4 tw:[&_img]:w-4 tw:focus-visible:bg-accent tw:focus-visible:outline-2 tw:focus-visible:outline-ink tw:focus-visible:outline-offset-1 tw:disabled:cursor-default tw:disabled:opacity-40 tw:[&:hover:not(:disabled)]:bg-accent tw:[&:hover:not(:disabled)]:outline-none tw:[&:hover:not(:disabled)_img]:[filter:brightness(0)_invert(1)] tw:[&:focus-visible_img]:[filter:brightness(0)_invert(1)]"
                            type="button"
                            onClick={() => navigate(page - 1)}
                            data-pagination-previous
                            aria-label="P&#225;gina anterior"
                            disabled={loading || page <= 1}
                        >
                            <span>
                                <Image src={paginationPrevious} alt="" />
                            </span>
                        </button>
                        <button
                            className="reportagens-pagination__button tw:items-center tw:bg-white tw:border-[2px] tw:border-solid tw:border-accent tw:text-accent tw:cursor-pointer tw:flex tw:h-10 tw:justify-center tw:[transition:background-color_150ms_ease,_color_150ms_ease] tw:w-14 tw:py-2 tw:px-4 tw:[&>span]:items-center tw:[&>span]:flex tw:[&>span]:h-6 tw:[&>span]:justify-center tw:[&>span]:w-6 tw:[&_img]:block tw:[&_img]:h-4 tw:[&_img]:w-4 tw:focus-visible:bg-accent tw:focus-visible:outline-2 tw:focus-visible:outline-ink tw:focus-visible:outline-offset-1 tw:disabled:cursor-default tw:disabled:opacity-40 tw:[&:hover:not(:disabled)]:bg-accent tw:[&:hover:not(:disabled)]:outline-none tw:[&:hover:not(:disabled)_img]:[filter:brightness(0)_invert(1)] tw:[&:focus-visible_img]:[filter:brightness(0)_invert(1)]"
                            type="button"
                            disabled={loading || page >= allPostsTotalPages}
                            onClick={() => navigate(page + 1)}
                            data-pagination-next
                            aria-label="Pr&oacute;xima p&aacute;gina"
                        >
                            <span>
                                <Image src={paginationNext} alt="" />
                            </span>
                        </button>
                        <span
                            className="reportagens-pagination__status tw:h-[1px] tw:overflow-hidden tw:absolute tw:w-[1px] tw:[clip:rect(0_0_0_0)] tw:m-[-1px]"
                            aria-live="polite"
                            data-pagination-status
                        >
                            {loading ? "Carregando reportagens." : `Página ${page} de ${allPostsTotalPages}`}
                        </span>
                    </nav>
                </div>
            )}
        </section>
    );
}
