import { Image } from "./react-utils";
import { resolveNewsImage, type WpPost } from "../../lib/wp";
import chevronRight from "../../assets/images/home-news/chevron-right.svg";

interface Props {
    post: WpPost;
    dark?: boolean;
    imageLoading?: "eager" | "lazy";
}
export default function NewsCard({ post, dark = false, imageLoading = "lazy" }: Props) {
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    const image = resolveNewsImage(media);
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
        <article className="tw:flex tw:min-w-0 tw:snap-start tw:flex-col tw:gap-4">
            <a
                href={post.link}
                className="tw:block tw:aspect-384/216 tw:w-full tw:overflow-hidden tw:border-2 tw:border-accent"
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
                    />
                )}
            </a>
            <h3
                className={`tw:font-display tw:text-2xl tw:leading-8 tw:font-bold tw:uppercase tw:[font-variation-settings:'wdth'_75] ${dark ? "tw:text-white tw:md:min-h-24" : "tw:text-ink tw:md:min-h-16"}`}
            >
                <a
                    href={post.link}
                    className="tw:focus-visible:outline-2 tw:focus-visible:outline-offset-1 tw:focus-visible:outline-accent"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ler: ${plainTitle}`}
                >
                    <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                </a>
            </h3>
            <div className="tw:flex tw:flex-col tw:items-start tw:gap-4">
                <a
                    href={post.link}
                    className="tw:flex tw:h-9.5 tw:items-center tw:gap-2 tw:bg-accent tw:pt-2 tw:pr-3 tw:pb-1.5 tw:pl-3.5 tw:font-display tw:text-lg tw:leading-6 tw:font-bold tw:text-white tw:uppercase tw:[font-variation-settings:'wdth'_75]"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Ler reportagem
                    <Image className="tw:h-1.5 tw:w-3 tw:-rotate-90" src={chevronRight} alt="" />
                </a>
                {updatedAt && (
                    <time className={`tw:text-sm tw:leading-4 ${dark ? "tw:text-white" : "tw:text-navy"}`} dateTime={post.modified}>
                        Atualizada em {updatedAt}
                    </time>
                )}
            </div>
        </article>
    );
}
