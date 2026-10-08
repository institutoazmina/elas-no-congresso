import { Image, cx } from "./react-utils";
import { resolveReportagemImage, type WpPost } from "../../lib/wp";
import chevronRight from "../../assets/images/home-reportagens/chevron-right.svg";

interface Props {
    post: WpPost;
    dark?: boolean;
    imageLoading?: "eager" | "lazy";
}
export default function ReportagemCard({ post, dark = false, imageLoading = "lazy" }: Props) {
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    const image = resolveReportagemImage(media);
    const plainTitle = post.title.rendered.replace(/<[^>]*>/g, "").trim();
    const imageAlt = media?.alt_text?.trim() || plainTitle;
    const updatedAt = post.modified
        ? new Intl.DateTimeFormat("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "America/Sao_Paulo",
          }).format(new Date(post.modified))
        : undefined;

    return (
        <article
            className={cx([
                "reportagem-card tw:[&_h3]:font-display tw:[&_h3]:font-bold tw:[&_h3]:[font-variation-settings:'wdth'_75] tw:[&_h3]:uppercase tw:[&_h3]:text-ink tw:[&_h3]:text-2xl tw:[&_h3]:leading-8 tw:[&_h3]:min-h-16 tw:[&_h3]:m-0 tw:flex tw:flex-[0_0_384px] tw:flex-col tw:gap-4 tw:[scroll-snap-align:start]",
                { "reportagem-card--dark tw:[&_h3]:text-white tw:[&_h3]:min-h-24": dark },
            ])}
        >
            <a
                href={post.link}
                className="reportagem-card__image tw:block tw:h-54 tw:w-full tw:shrink-0 tw:overflow-hidden tw:border-2 tw:border-accent tw:cursor-pointer"
                data-reportagem-link
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ler: ${plainTitle}`}
            >
                {image && (
                    <Image
                        className="tw:block tw:size-full tw:object-cover"
                        src={image}
                        alt={imageAlt}
                        width="384"
                        height="216"
                        loading={imageLoading}
                        decoding="async"
                        data-reportagem-image
                    />
                )}
            </a>
            <h3>
                <a
                    href={post.link}
                    className="
                reportagem-card__title-link tw:text-inherit tw:no-underline tw:hover:text-inherit tw:hover:no-underline
                tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:outline-offset-1
            "
                    data-reportagem-link
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ler: ${plainTitle}`}
                >
                    <span data-reportagem-title dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </a>
            </h3>
            <div className="reportagem-card__details tw:items-start tw:flex tw:flex-col tw:gap-4 tw:justify-center tw:overflow-hidden">
                <a
                    href={post.link}
                    className="
                reportagem-card__link tw:font-display tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:uppercase
                tw:items-center tw:self-start tw:bg-accent tw:text-white tw:flex tw:text-lg tw:gap-2 tw:h-9.5 tw:justify-center
                tw:leading-6 tw:no-underline tw:pt-2 tw:pb-1.5 tw:pr-3 tw:pl-3.5 tw:[&_>_span:last-child]:items-center
                tw:[&_>_span:last-child]:flex tw:[&_>_span:last-child]:h-6 tw:[&_>_span:last-child]:justify-end
                tw:[&_>_span:last-child]:w-3 tw:[&_img]:block tw:[&_img]:h-1.5 tw:[&_img]:[transform:rotate(-90deg)]
                tw:[&_img]:w-3
            "
                    data-reportagem-link
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span>Ler reportagem</span>
                    <span aria-hidden="true">
                        <Image src={chevronRight} alt="" />
                    </span>
                </a>
                <time
                    className="reportagem-card__date tw:text-navy tw:text-sm tw:font-normal tw:tracking-normal tw:leading-4 tw:m-0 tw:[.reportagem-card--dark_&]:text-white"
                    dateTime={post.modified}
                    data-reportagem-date
                    hidden={!updatedAt}
                >
                    {updatedAt && <>Atualizada em {updatedAt}</>}
                </time>
            </div>
        </article>
    );
}
