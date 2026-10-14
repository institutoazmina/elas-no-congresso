import { Image, cx } from "../shared/react-utils";
import type { ActivityProposition, EnactedProject } from "../../lib/activity-api";
import { propositionRoute } from "../../lib/proposition-utils";
import documentImage from "../../assets/images/hero/proposition-9.png";
import thumbsUp from "../../assets/images/thumbs-up.svg";
import thumbsDown from "../../assets/images/thumbs-down.svg";
import bookIcon from "../../assets/images/enacted-projects/book.svg";

export type Variant = "fast" | "slow" | "enacted";
interface Props {
    project: ActivityProposition | EnactedProject;
    variant: Variant;
    featured: boolean;
}
export default function ProposalCard({ project, variant, featured }: Props) {
    const favorable =
        variant === "slow" ||
        (variant === "enacted" && "assessment_label" in project && project.assessment_label === "favorável");
    const authors = project.authors.slice(0, variant === "fast" ? 1 : 3);
    const category =
        project.category_label?.trim() || project.category?.replaceAll("_", " ") || "Sem categoria";
    const months = Math.max(1, Math.floor(project.celerity.days_without_movement / 30));
    const movements = project.celerity.movements_last_90_days;
    const enactment = "enactment" in project ? project.enactment : null;
    const enactedDate =
        enactment &&
        new Intl.DateTimeFormat("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        }).format(new Date(`${enactment.enacted_at}T00:00:00Z`));

    return (
        <a
            className={cx([
                "proposal-card tw:group tw:flex tw:w-96 tw:flex-none tw:flex-col tw:self-start tw:border tw:border-solid tw:border-muted tw:bg-white tw:text-ink tw:no-underline tw:max-md:w-56.5 tw:data-[featured=true]:border-ink tw:data-[featured=true]:shadow-[-4px_4px_0_#0b0f5e] tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:outline-offset-4",
                {
                    "tw:h-95.5 tw:max-md:h-57": variant === "fast",
                    "tw:h-121 tw:max-md:h-72.5": variant === "slow",
                },
            ])}
            href={propositionRoute(project.number_label, project.house) || "/atividade-legislativa"}
            data-proposal-card
            data-featured={String(featured)}
            aria-label={`Ver proposição ${project.number_label}`}
            aria-hidden={featured ? undefined : "true"}
            tabIndex={featured ? 0 : -1}
        >
            <header className="tw:flex tw:h-17.5 tw:flex-none tw:items-center tw:justify-between tw:gap-3 tw:border-b tw:border-muted tw:px-4 tw:py-2 tw:max-md:h-10.5 tw:max-md:px-2.5 tw:max-md:py-1.5">
                <strong className="tw:font-display tw:text-xl tw:font-bold tw:leading-6 tw:[font-variation-settings:'wdth'_75] tw:max-md:text-base tw:max-md:leading-5">
                    {project.number_label}
                </strong>
                <span className="tw:flex tw:flex-none tw:items-center">
                    <Image
                        src={documentImage}
                        alt=""
                        width={36}
                        height={52}
                        className="tw:w-9 tw:h-13 tw:-mr-2 tw:rotate-[-5deg] tw:object-fill tw:max-md:w-5.5 tw:max-md:h-7.5"
                    />
                    <Image
                        src={favorable ? thumbsUp : thumbsDown}
                        alt=""
                        width={32}
                        height={32}
                        className="tw:block tw:size-8 tw:rounded-full tw:max-md:size-5"
                    />
                    <b className="tw:ml-2 tw:font-display tw:text-base tw:leading-6 tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:max-md:ml-1.5 tw:max-md:text-xs tw:max-md:leading-4">
                        {favorable ? "Favorável" : "Desfavorável"}
                    </b>
                </span>
            </header>
            <div
                className={cx([
                    "tw:flex tw:min-h-0 tw:flex-col tw:gap-4 tw:overflow-hidden tw:px-4 tw:py-6 tw:max-md:gap-2.5 tw:max-md:px-2.5 tw:max-md:py-4",
                    { "tw:flex-1": variant !== "enacted" },
                ])}
            >
                <div
                    className={cx([
                        "tw:flex tw:flex-none tw:flex-col tw:gap-2.5 tw:max-md:gap-1.5",
                        { "tw:h-31.5 tw:max-md:h-19.5": variant === "slow" },
                    ])}
                >
                    {authors.map((author, index) => (
                        <p
                            key={`${author.id}-${index}`}
                            className="tw:flex tw:min-w-0 tw:justify-between tw:text-lg tw:leading-6 tw:max-md:text-xs tw:max-md:leading-4"
                        >
                            <span className="tw:min-w-0">{author.name}</span>
                            <strong className="tw:min-w-0 tw:font-bold">
                                {[author.party, author.state].filter(Boolean).join("/")}
                            </strong>
                        </p>
                    ))}
                    {!authors.length && (
                        <p className="tw:text-lg tw:leading-6 tw:max-md:text-xs tw:max-md:leading-4">
                            Autoria indisponível
                        </p>
                    )}
                    {variant !== "fast" && project.authors.length > authors.length && (
                        <p className="tw:text-accent tw:text-lg tw:leading-6 tw:max-md:text-xs tw:max-md:leading-4">
                            +{project.authors.length - authors.length} parlamentares
                        </p>
                    )}
                </div>
                <span className="tw:w-max tw:max-w-full tw:flex-none tw:bg-accent tw:px-2 tw:py-1 tw:font-display tw:text-base tw:font-bold tw:leading-6 tw:uppercase tw:text-white tw:[font-variation-settings:'wdth'_75] tw:max-md:px-1.5 tw:max-md:pt-1 tw:max-md:pb-0.5 tw:max-md:text-xs tw:max-md:leading-4">
                    {category}
                </span>
                <p
                    className={cx([
                        "tw:line-clamp-5 tw:text-base tw:leading-6 tw:max-md:text-[10px] tw:max-md:leading-4",
                        { "tw:text-[#62628f]": variant !== "slow" },
                    ])}
                >
                    {project.ementa}
                </p>
            </div>
            {variant === "enacted" && enactment ? (
                <footer className="tw:flex tw:w-full tw:shrink-0 tw:items-center tw:justify-between tw:border-t tw:border-muted tw:p-4 tw:text-accent tw:group-data-[featured=true]:bg-accent tw:group-data-[featured=true]:text-white tw:max-md:p-2.5">
                    <div className="tw:flex tw:min-w-0 tw:flex-col tw:gap-2 tw:max-md:gap-1">
                        <p className="tw:flex tw:items-center tw:gap-2 tw:text-lg tw:leading-6 tw:max-md:text-xs tw:max-md:leading-3.5">
                            <Image
                                src={bookIcon}
                                alt=""
                                width={16}
                                height={20}
                                className="tw:w-4 tw:h-5 tw:group-data-[featured=true]:brightness-0 tw:group-data-[featured=true]:invert tw:max-md:w-2.5 tw:max-md:h-3"
                            />
                            <strong>{enactment.law_label}</strong>
                        </p>
                        <small className="tw:text-xs tw:leading-4 tw:opacity-66 tw:max-md:text-[8px] tw:max-md:leading-2.5">
                            Aprovada em {enactedDate}
                        </small>
                    </div>
                    <span
                        aria-hidden="true"
                        className="tw:text-3xl tw:opacity-0 tw:group-data-[featured=true]:opacity-100"
                    >
                        ›
                    </span>
                </footer>
            ) : (
                <footer className="tw:flex tw:h-14 tw:flex-none tw:items-center tw:border-t tw:border-muted tw:px-4 tw:py-2 tw:text-lg tw:leading-6 tw:whitespace-nowrap tw:max-md:h-8.5 tw:max-md:px-2.5 tw:max-md:text-xs tw:max-md:leading-4">
                    <span>
                        {variant === "fast" ? (
                            <>
                                Teve{" "}
                                <strong className="tw:text-[#ff5865]">
                                    {movements} {movements === 1 ? "movimentação" : "movimentações"}
                                </strong>{" "}
                                em <b>3 meses</b>
                            </>
                        ) : (
                            <>
                                Está há{" "}
                                <strong>
                                    {months} {months === 1 ? "mês" : "meses"}
                                </strong>{" "}
                                sem movimentação
                            </>
                        )}
                    </span>
                </footer>
            )}
        </a>
    );
}
