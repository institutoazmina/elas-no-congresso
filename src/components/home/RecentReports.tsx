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
            <p className="news-feedback tw:text-white tw:text-base tw:leading-6 tw:relative tw:z-2 tw:mt-12 tw:mb-0 tw:mx-6" role="status">
                Não foi possível carregar as reportagens mais recentes.
            </p>
        );
    }
    return (
        <div
            className="news-recent__scroll tw:max-[901px]:pl-6 tw:max-[901px]:pr-6 tw:flex tw:gap-12 tw:justify-center tw:overflow-x-auto tw:[scroll-snap-type:x_mandatory] tw:w-full tw:pt-0 tw:pb-4 tw:px-12 tw:mt-12 tw:mb-0 tw:mx-auto tw:max-[561px]:block tw:max-[561px]:overflow-x-auto tw:max-[561px]:overflow-y-hidden tw:max-[561px]:relative tw:max-[561px]:[scroll-snap-type:none] tw:max-[561px]:[scrollbar-width:thin] tw:max-[561px]:w-full tw:max-[561px]:z-2 tw:max-[561px]:pt-0 tw:max-[561px]:pb-4 tw:max-[561px]:px-0 tw:max-[561px]:mt-14.5 tw:max-[561px]:mb-0 tw:max-[561px]:mx-0"
            tabIndex={0}
            aria-label="Lista de reportagens mais recentes"
            aria-busy={!page}
        >
            <div className="news-recent__track tw:flex tw:flex-none tw:gap-12 tw:max-[561px]:gap-12 tw:max-[561px]:w-max tw:max-[561px]:py-0 tw:max-[561px]:px-6">
                {page?.posts.map((post) => <NewsCard key={post.link} post={post} dark imageLoading="eager" />)}
            </div>
        </div>
    );
}
