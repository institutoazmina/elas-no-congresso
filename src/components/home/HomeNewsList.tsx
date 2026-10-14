import { Image } from "../shared/react-utils";
import chevronRight from "../../assets/images/home-news/chevron-right.svg";
import { fetchNewsPage, resolveNewsImage, type WpPost } from "../../lib/wp";
import { useNews } from "../../hooks/useNews";

const HOME_TAG_ID = 1988;
const HOME_REPORT_COUNT = 3;

function formatDate(date: string) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${date}Z`));
}

const cardClass = "tw:flex tw:w-[min(384px,calc(100vw-72px))] tw:shrink-0 tw:flex-col tw:gap-4 tw:lg:w-96";
const figureClass = "tw:m-0 tw:w-full tw:border-2 tw:border-[#4242F6]";

function ReportCard({ report }: { report: WpPost }) {
    const image = report._embedded?.["wp:featuredmedia"]?.[0];
    // WordPress's large thumbnail, not the full upload: there is no build-time resize anymore.
    const imageUrl = resolveNewsImage(image);
    const date = report.modified || report.date;
    const label = `Ler: ${report.title.rendered.replace(/<[^>]*>/g, "").trim()}`;

    return (
        <article className={cardClass}>
            <a href={report.link} className="home-news-image-link tw:block tw:w-full tw:cursor-pointer" target="_blank" rel="noopener noreferrer" aria-label={label}>
                <figure className={figureClass}>
                    {imageUrl && <img className="tw:block tw:aspect-[384/216] tw:w-full tw:object-cover" src={imageUrl} width={768} height={432} alt={image?.alt_text ?? ""} loading="lazy" decoding="async" />}
                </figure>
            </a>
            <h3 className="tw:m-0 tw:text-2xl tw:font-bold tw:leading-8 tw:uppercase tw:font-display tw:[font-variation-settings:'wdth'_75]">
                <a
                    href={report.link}
                    className="
                        home-news-title-link tw:text-inherit tw:no-underline tw:hover:text-inherit tw:hover:no-underline
                        tw:focus-visible:outline-2 tw:focus-visible:outline-white tw:focus-visible:outline-offset-1
                    "
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    dangerouslySetInnerHTML={{ __html: report.title.rendered }}
                />
            </h3>
            <div className="tw:mt-auto tw:flex tw:h-[70px] tw:flex-col tw:items-start tw:gap-4">
                <a
                    className="
                        tw:flex tw:h-[38px] tw:items-center tw:gap-2 tw:bg-[#4242F6] tw:pb-1.5 tw:pl-[14px] tw:pr-3 tw:pt-2 tw:text-lg
                        tw:font-bold tw:leading-6 tw:uppercase tw:font-display tw:[font-variation-settings:'wdth'_75]
                    "
                    href={report.link}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>Ler reportagem</span>
                    <span className="tw:flex tw:h-6 tw:w-3 tw:items-center tw:justify-end" aria-hidden="true">
                        <Image className="tw:h-[6px] tw:w-3 tw:rotate-[-90deg]" src={chevronRight} alt="" />
                    </span>
                </a>
                <time dateTime={date} className="tw:text-sm tw:font-normal tw:leading-4">Atualizada em {formatDate(date)}</time>
            </div>
        </article>
    );
}

export default function HomeNewsList() {
    const page = useNews("home", (signal) =>
        fetchNewsPage({ tagId: HOME_TAG_ID, perPage: HOME_REPORT_COUNT, signal }),
    );

    if (page && page.posts.length === 0) {
        return <p className="tw:m-0 tw:text-center tw:text-base tw:leading-6" role="status">Não foi possível carregar as reportagens.</p>;
    }
    return (
        <div className="tw:flex tw:w-max tw:justify-start tw:gap-4 tw:pb-2 tw:lg:w-full tw:lg:justify-center-safe tw:lg:gap-12 tw:lg:pb-0" aria-busy={!page}>
            {page
                ? page.posts.map((report) => <ReportCard key={report.link} report={report} />)
                : Array.from({ length: HOME_REPORT_COUNT }, (_, index) => (
                      // Same footprint as a card, so the section doesn't jump when reports arrive.
                      <div key={index} className={cardClass} aria-hidden="true">
                          <div className={`${figureClass} tw:aspect-[384/216] tw:opacity-30`} />
                          <div className="tw:h-[134px]" />
                      </div>
                  ))}
        </div>
    );
}
