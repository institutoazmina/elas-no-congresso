import NewsCard from "../shared/NewsCard";
import { fetchNewsPage } from "../../lib/wp";
import { useNews } from "../../hooks/useNews";

export const RECENT_REPORT_COUNT = 3;

export default function RecentReports() {
    const page = useNews("recent", (signal) =>
        fetchNewsPage({ perPage: RECENT_REPORT_COUNT, orderByDate: true, signal }),
    );

    if (page && page.posts.length === 0) {
        return (
            <p className="tw:mx-6 tw:mt-12 tw:text-base tw:leading-6" role="status">
                Não foi possível carregar as reportagens mais recentes.
            </p>
        );
    }
    return (
        <div
            className="tw:mt-12 tw:snap-x tw:snap-mandatory tw:overflow-x-auto tw:pb-4"
            tabIndex={0}
            aria-label="Lista de reportagens mais recentes"
            aria-busy={!page}
        >
            <div className="tw:mx-auto tw:flex tw:w-max tw:gap-12 tw:px-6 tw:*:w-96 tw:*:flex-none tw:md:px-12">
                {page?.posts.map((post) => <NewsCard key={post.link} post={post} dark imageLoading="eager" />)}
            </div>
        </div>
    );
}
