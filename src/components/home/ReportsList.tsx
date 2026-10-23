import { useEffect, useState } from "react";
import NewsCard from "../shared/NewsCard";
import { fetchNewsPage, type WpPost } from "../../lib/wp";
import { RECENT_REPORT_COUNT } from "./RecentReports";
import ReportsPagination from "./ReportsPagination";
const POSTS_PER_PAGE = 9;

export default function ReportsList() {
    const [posts, setPosts] = useState<WpPost[]>([]);
    // Unknown until the first response arrives.
    const [allPostsTotalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        const read = () => {
            const value = Number(new URLSearchParams(location.search).get("pagina"));
            setPage(Number.isInteger(value) && value > 0 ? value : 1);
        };
        read();
        window.addEventListener("popstate", read);
        return () => window.removeEventListener("popstate", read);
    }, []);
    function navigate(next: number) {
        setPage(next);
        const url = new URL(location.href);
        if (next === 1) {
            url.searchParams.delete("pagina");
        } else {
            url.searchParams.set("pagina", String(next));
        }
        history.pushState({}, "", url);
    }
    useEffect(() => {
        const controller = new AbortController();
        setError(false);
        setLoading(true);
        // The first posts are shown by RecentReports, above this list.
        fetchNewsPage({
            perPage: POSTS_PER_PAGE,
            offset: RECENT_REPORT_COUNT + (page - 1) * POSTS_PER_PAGE,
            orderByDate: true,
            signal: controller.signal,
        }).then((result) => {
            if (controller.signal.aborted) { return; }
            setLoading(false);
            if (result.unavailable) {
                setError(true);
                return;
            }
            setPosts(result.posts);
            setTotalPages(Math.ceil(Math.max(result.total - RECENT_REPORT_COUNT, 0) / POSTS_PER_PAGE));
        });
        return () => controller.abort();
    }, [page, retry]);
    return (
        <section
            className="tw:pt-16 tw:pb-21.5 tw:md:pt-18 tw:md:pb-0"
            aria-labelledby="all-news-title"
            aria-busy={loading}
        >
            <div className="tw:px-6 tw:md:px-12">
                <div className="tw:mx-auto tw:max-w-336">
                    <h2
                        id="all-news-title"
                        className="tw:mb-10 tw:font-display tw:text-[32px] tw:leading-8 tw:font-bold tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:md:mb-12 tw:md:leading-10.5"
                    >
                        Todas as reportagens
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
                        <div className="tw:grid tw:gap-24 tw:sm:grid-cols-2 tw:sm:gap-x-6 tw:sm:gap-y-16 tw:lg:grid-cols-3 tw:lg:gap-24">
                            {posts.map((post) => (
                                <NewsCard key={post.link} post={post} />
                            ))}
                        </div>
                    ) : loading ? (
                        // Keeps the section height while the first page arrives.
                        <div className="tw:min-h-96" aria-hidden="true" />
                    ) : (
                        !error && (
                            <p className="tw:my-12 tw:text-base tw:leading-6 tw:text-navy" role="status">
                                Não foi possível carregar as reportagens.
                            </p>
                        )
                    )}
                </div>
            </div>
            {allPostsTotalPages > 1 && (
                <ReportsPagination
                    page={page}
                    totalPages={allPostsTotalPages}
                    loading={loading}
                    onNavigate={navigate}
                />
            )}
        </section>
    );
}
