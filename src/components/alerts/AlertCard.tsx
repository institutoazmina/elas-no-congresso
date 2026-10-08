import { cx } from "../shared/react-utils";
export default function AlertCard({
    alert,
    featured = false,
}: {
    alert: {
        category: string;
        date: string;
        dateIso: string;
        title: string;
        description: string;
        href: string;
    };
    featured?: boolean;
}) {
    return (
        <article
            className={cx([
                "alert-card tw:hover:before:opacity-100 tw:isolate tw:bg-white tw:border-2 tw:border-solid tw:border-navy tw:text-navy tw:h-57.5 tw:overflow-hidden tw:relative tw:w-204 tw:pt-4.5 tw:pb-0 tw:px-6 tw:[&_h2]:font-bold tw:[&_h2]:text-xl tw:[&_h2]:leading-6 tw:[&_h2]:font-display tw:[&_h2]:[font-variation-settings:'wdth'_75] tw:[&_h2]:uppercase tw:[&_h2]:mt-4 tw:[&_h2]:mb-2 tw:[&_h2]:mx-0 tw:[&_p]:text-muted tw:[&_p]:font-normal tw:[&_p]:text-base tw:[&_p]:leading-6 tw:[&_p]:font-sans tw:[&_p]:h-12 tw:[&_p]:overflow-hidden tw:[&_p]:m-0 tw:[&_a]:text-accent tw:[&_a]:font-bold tw:[&_a]:text-lg tw:[&_a]:leading-6 tw:[&_a]:font-display tw:[&_a]:[font-variation-settings:'wdth'_75] tw:[&_a]:left-6.5 tw:[&_a]:absolute tw:[&_a]:underline tw:[&_a]:underline-offset-1 tw:[&_a]:uppercase tw:[&_a]:top-42 tw:[&_a]:[transition:color_160ms_ease-out] tw:motion-reduce:[&_a]:[transition:none] tw:max-[941px]:w-full tw:max-md:h-auto tw:max-md:min-h-0 tw:max-md:pt-4.5 tw:max-md:pb-6 tw:max-md:px-5.5 tw:before:absolute tw:before:top-0 tw:before:bottom-0 tw:before:left-0 tw:before:w-(--alert-hover-width,4px) tw:before:bg-lime tw:before:content-[''] tw:before:opacity-0 tw:before:pointer-events-none tw:before:[transition:opacity_150ms_ease] tw:[&:focus-within::before]:opacity-100 tw:[&:focus-visible::before]:opacity-100 tw:[&_time]:font-bold tw:[&_time]:text-xl tw:[&_time]:leading-6 tw:[&_time]:font-display tw:[&_time]:[font-variation-settings:'wdth'_75] tw:[&_time]:uppercase tw:[&_time]:mt-1 tw:[&_time]:mb-0 tw:[&_time]:mx-0 tw:[&_a:hover]:text-ink tw:[&_a:focus-visible]:outline-2 tw:[&_a:focus-visible]:outline-accent tw:[&_a:focus-visible]:outline-offset-4 tw:max-md:[&_h2]:mt-4 tw:max-md:[&_h2]:wrap-anywhere tw:max-md:[&_p]:h-auto tw:max-md:[&_p]:overflow-visible tw:max-md:[&_p]:wrap-anywhere tw:max-md:[&_time]:text-lg tw:max-md:[&_a]:static tw:max-md:[&_a]:inline-block tw:max-md:[&_a]:mt-4 tw:max-md:[&_a]:wrap-anywhere",
                { "alert-card--featured": featured },
            ])}
        >
            <div className="alert-card__meta tw:items-start tw:flex tw:h-8 tw:justify-between">
                <span
                    className="alert-card__tag tw:items-center tw:bg-accent tw:text-white tw:inline-flex tw:font-bold tw:text-xl tw:leading-6 tw:font-display tw:[font-variation-settings:'wdth'_75] tw:h-8 tw:uppercase tw:pt-1.5 tw:pb-1 tw:px-2"
                    data-alert-category
                >
                    {alert.category}
                </span>
                <time dateTime={alert.dateIso} data-alert-date>
                    {alert.date}
                </time>
            </div>
            <h2 data-alert-title>{alert.title}</h2>
            <p data-alert-description>{alert.description}</p>
            <a href={alert.href} data-alert-link>
                Ver página da proposta
            </a>
        </article>
    );
}
