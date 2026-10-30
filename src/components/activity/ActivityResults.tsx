import type { ActivityDashboardRow, ActivityProposition } from "../../lib/activity-api";
import { authorRoute } from "../../lib/author-page";
import { propositionRoute } from "../../lib/proposition-utils";
import { formatPresentedDate } from "../../lib/canonical";
import { Photo, css } from "../shared/react-utils";
import thumbsUp from "../../assets/images/activity/thumbs-up.svg";
import thumbsDown from "../../assets/images/activity/thumbs-down.svg";

const number = new Intl.NumberFormat("pt-BR");
function Stance({ item }: { item: ActivityProposition }) {
    const stance = item.is_favorable === null ? "neutral" : item.is_favorable ? "favorable" : "unfavorable";
    return (
        <span
            className={`activity-stance activity-stance--${stance} tw:flex tw:items-center tw:gap-1 tw:text-sm tw:leading-4 tw:[&_img]:w-6 tw:[&_img]:h-6`}
        >
            {item.is_favorable !== null && (
                <img src={item.is_favorable ? thumbsUp.src : thumbsDown.src} alt="" />
            )}
            <strong>
                {item.is_favorable === null
                    ? "Sem avaliação"
                    : item.is_favorable
                      ? "Favorável"
                      : "Desfavorável"}
            </strong>
        </span>
    );
}
function Author({ item }: { item: ActivityProposition }) {
    const author = item.authors[0];
    return (
        <div className="
                activity-author tw:[&_>_a]:flex tw:[&_>_a]:w-full tw:[&_>_a]:items-center tw:[&_>_a]:gap-2
                tw:[&_>_a]:text-inherit tw:[&_>_a]:text-left tw:[&_>_a]:no-underline tw:[&_>_a]:cursor-pointer
                tw:[&_>_a:hover_strong]:text-accent tw:[&_>_a:hover_strong]:underline tw:[&_img]:w-7.5
                tw:[&_img]:h-10 tw:[&_img]:flex-none tw:[&_img]:border tw:[&_img]:border-solid
                tw:[&_img]:border-muted tw:[&_img]:rounded-none tw:[&_img]:object-cover
                tw:[&_img]:object-[top_center] tw:[&_>_a_>_span]:flex tw:[&_>_a_>_span]:min-w-0
                tw:[&_>_a_>_span]:flex-col tw:[&_strong]:block tw:[&_strong]:[overflow-wrap:anywhere]
                tw:[&_strong]:text-sm tw:[&_strong]:leading-[18px] tw:[&_small]:text-[rgb(11_15_94_/_65%)]
                tw:[&_small]:text-xs tw:[&_small]:leading-4 tw:max-md:[.activity-card_>_&]:my-2
                tw:max-md:[.activity-card_>_&]:mx-0 tw:max-md:[.activity-card_>_&_>_a]:w-auto
                tw:max-md:[.activity-card_>_&_img]:w-7.5 tw:max-md:[.activity-card_>_&_img]:h-10
            ">
            {author ? (
                <>
                    <a
                        href={authorRoute(author.name) || "/atividade-legislativa"}
                        aria-label={`Ver página de autoria de ${author.name}`}
                    >
                        <Photo src={author.photo_url} name={author.name} className="
                activity-author__fallback tw:w-7.5 tw:h-10 tw:flex-none tw:border tw:border-solid
                tw:border-muted tw:rounded-none tw:object-cover tw:object-[top_center] tw:bg-[#f1f1ff]
                tw:text-accent tw:text-[12px] tw:font-bold tw:flex tw:items-center tw:justify-center
            " />
                        <span>
                            <strong>{author.name}</strong>
                            <small>{[author.party, author.state].filter(Boolean).join("/")}</small>
                        </span>
                    </a>
                    {item.authors.length > 1 && (
                        <small className="tw:text-xs">
                            + {item.authors.length - 1} {item.authors.length === 2 ? "autoria" : "autorias"}
                        </small>
                    )}
                </>
            ) : (
                "Autoria não informada"
            )}
        </div>
    );
}
function Progress({ item }: { item: ActivityProposition }) {
    return (
        <>
            <strong>{item.celerity.label}</strong>
            <small>{item.celerity.movements_last_90_days} movimentações em 3 meses</small>
        </>
    );
}
export function PropositionRow({ item }: { item: ActivityProposition }) {
    return (
        <tr>
            <td>
                <a href={propositionRoute(item.number_label, item.house) ?? "/atividade-legislativa"}>
                    {item.number_label}
                </a>
                <small>{item.current_house === "senado" && item.house === "camara" ? "Câmara → Senado" : item.house.toLowerCase().startsWith("sen") ? "Senado" : "Câmara"}</small>
            </td>
            <td>
                <Author item={item} />
            </td>
            <td>
                <p title={item.ementa}>{item.ementa}</p>
            </td>
            <td>
                <Stance item={item} />
            </td>
            <td>
                {item.assessment_organization || "—"}
                {item.assessment_comments && (
                    <a
                        className="tw:block tw:mt-1 tw:text-accent tw:text-xs"
                        href={propositionRoute(item.number_label, item.house) ?? "/atividade-legislativa"}
                    >
                        Ler comentários
                    </a>
                )}
            </td>
            <td>
                <Progress item={item} />
            </td>
            <td
                title={
                    item.category
                        ? `Categoria oficial: ${item.category_label || item.category}`
                        : "Sem categoria no dataset oficial para esta proposição"
                }
            >
                {item.category_label || item.category || "Não informada"}
            </td>
            <td title="Data de apresentação (API oficial)">
                {item.presented_at ? formatPresentedDate(item.presented_at) : "—"}
            </td>
        </tr>
    );
}
export function PropositionCard({ item }: { item: ActivityProposition }) {
    return (
        <article className="
                activity-card tw:max-md:flex tw:max-md:border-b tw:max-md:border-solid
                tw:max-md:border-b-[rgb(66_66_246_/_25%)] tw:max-md:bg-white tw:max-md:flex-col tw:max-md:py-2
                tw:max-md:px-0 tw:max-md:[&_>_header]:flex tw:max-md:[&_>_header]:min-h-14
                tw:max-md:[&_>_header]:items-start tw:max-md:[&_>_header]:justify-between
                tw:max-md:[&_>_header]:gap-2 tw:max-md:[&_>_header]:py-2 tw:max-md:[&_>_header]:px-0
                tw:max-md:[&_>_header_>_div]:flex tw:max-md:[&_>_header_>_div]:flex-col
                tw:max-md:[&_>_header_a]:text-accent tw:max-md:[&_>_header_a]:font-display
                tw:max-md:[&_>_header_a]:text-lg tw:max-md:[&_>_header_a]:font-bold
                tw:max-md:[&_>_header_a]:[font-variation-settings:'wdth'_75]
                tw:max-md:[&_>_header_a]:leading-6 tw:max-md:[&_>_header_a]:no-underline
                tw:max-md:[&_>_header_a]:uppercase tw:max-md:[&_>_header_small]:text-xs
                tw:max-md:[&_>_header_small]:leading-4 tw:max-md:[&_>_footer]:flex
                tw:max-md:[&_>_footer]:min-h-12 tw:max-md:[&_>_footer]:items-start
                tw:max-md:[&_>_footer]:justify-between tw:max-md:[&_>_footer]:gap-3
                tw:max-md:[&_>_footer]:py-2 tw:max-md:[&_>_footer]:px-0 tw:max-md:[&_>_footer_span]:flex
                tw:max-md:[&_>_footer_span]:flex-col tw:max-md:[&_>_footer_span]:text-xs
                tw:max-md:[&_>_footer_span]:leading-4 tw:max-md:[&_>_footer_span_+_span]:items-end
                tw:max-md:[&_>_footer_span_+_span]:text-right
            ">
            <header>
                <div>
                    <a href={propositionRoute(item.number_label, item.house) ?? "/atividade-legislativa"}>
                        {item.number_label}
                    </a>
                    <small>{item.current_house === "senado" && item.house === "camara" ? "Câmara → Senado" : item.house.toLowerCase().startsWith("sen") ? "Senado" : "Câmara"}</small>
                </div>
                <Stance item={item} />
            </header>
            <span className="
                activity-card__tag tw:max-md:self-start tw:max-md:border tw:max-md:border-solid
                tw:max-md:border-[rgb(66_66_246_/_40%)] tw:max-md:text-[rgb(11_15_94_/_65%)]
                tw:max-md:font-display tw:max-md:text-[12px] tw:max-md:font-bold
                tw:max-md:[font-variation-settings:'wdth'_75] tw:max-md:leading-4 tw:max-md:uppercase
                tw:max-md:py-[1px] tw:max-md:px-1 tw:max-md:mt-0 tw:max-md:mb-2 tw:max-md:mx-0
            ">
                {item.category_label || item.category || "Categoria não informada"}
            </span>
            <Author item={item} />
            <p className="
                activity-card__summary tw:max-md:text-[rgb(11_15_94_/_72%)] tw:max-md:text-sm
                tw:max-md:leading-4 tw:max-md:line-clamp-5 tw:max-md:mt-2 tw:max-md:mb-3 tw:max-md:mx-0
            ">{item.ementa}</p>
            <footer>
                <span>
                    <strong>{item.assessment_organization || "Sem avaliação"}</strong>
                    <small>
                        {item.assessment_comments ? "Há parecer complementar" : "Sem parecer complementar"}
                    </small>
                </span>
                <span>
                    <Progress item={item} />
                </span>
            </footer>
        </article>
    );
}
export function DashboardRows({ rows, author = false }: { rows: ActivityDashboardRow[]; author?: boolean }) {
    if (!rows.length) return <p>Sem dados para os filtros selecionados.</p>;
    return (
        <>
            {rows.map((row) => {
                const identity = (
                    <>
                        <Photo src={row.photo} name={row.label} className="
                activity-dashboard-card__author-fallback tw:w-6 tw:h-8 tw:flex-none tw:border tw:border-solid
                tw:border-muted tw:object-cover tw:object-[top_center] tw:bg-[#f1f1ff] tw:text-accent
                tw:text-[10px] tw:font-bold tw:leading-[1] tw:flex tw:items-center tw:justify-center
            " />
                        <span>
                            <span>{row.label}</span>
                            <small>{row.meta || "Autoria institucional"}</small>
                        </span>
                    </>
                );
                return (
                    <div key={row.key} className="
                activity-dashboard-card__row tw:grid tw:grid-cols-[minmax(0,1fr)_38px_80px] tw:min-h-8
                tw:flex-none tw:items-center tw:gap-1.5 tw:text-sm tw:leading-4
            ">
                        <div className="activity-dashboard-card__key tw:min-w-0 tw:[overflow-wrap:anywhere]">
                            {author ? (
                                row.key.startsWith("person:num:") ? (
                                    <a
                                        className="
                activity-dashboard-card__author tw:items-center tw:gap-1.5 tw:[a&]:w-full tw:[a&]:text-inherit
                tw:[a&]:text-left tw:[a&]:no-underline tw:[a&]:cursor-pointer
                tw:[a&:hover_span_>_span]:text-accent tw:[a&:hover_span_>_span]:underline tw:[&_img]:block
                tw:[&_img]:w-6 tw:[&_img]:h-8 tw:[&_img]:flex-none tw:[&_img]:border tw:[&_img]:border-solid
                tw:[&_img]:border-muted tw:[&_img]:object-cover tw:[&_img]:object-[top_center]
                tw:[&_span]:flex tw:[&_span]:min-w-0 tw:[&_span]:flex-col tw:[&_span_>_span]:block
                tw:[&_span_>_span]:[overflow-wrap:anywhere] tw:[&_span_>_span]:leading-4
                tw:[&_small]:text-[rgb(11_15_94_/_65%)] tw:[&_small]:text-[12px] tw:[&_small]:leading-3
                tw:flex
            "
                                        href={authorRoute(row.label) ?? "/atividade-legislativa"}
                                    >
                                        {identity}
                                    </a>
                                ) : (
                                    <div className="
                activity-dashboard-card__author tw:items-center tw:gap-1.5 tw:[a&]:w-full tw:[a&]:text-inherit
                tw:[a&]:text-left tw:[a&]:no-underline tw:[a&]:cursor-pointer
                tw:[a&:hover_span_>_span]:text-accent tw:[a&:hover_span_>_span]:underline tw:[&_img]:block
                tw:[&_img]:w-6 tw:[&_img]:h-8 tw:[&_img]:flex-none tw:[&_img]:border tw:[&_img]:border-solid
                tw:[&_img]:border-muted tw:[&_img]:object-cover tw:[&_img]:object-[top_center]
                tw:[&_span]:flex tw:[&_span]:min-w-0 tw:[&_span]:flex-col tw:[&_span_>_span]:block
                tw:[&_span_>_span]:[overflow-wrap:anywhere] tw:[&_span_>_span]:leading-4
                tw:[&_small]:text-[rgb(11_15_94_/_65%)] tw:[&_small]:text-[12px] tw:[&_small]:leading-3
                tw:flex
            ">{identity}</div>
                                )
                            ) : (
                                row.label
                            )}
                        </div>
                        <div className="
                activity-dashboard-card__values tw:flex tw:items-end tw:flex-col tw:text-[rgb(11_15_94_/_75%)]
                tw:text-xs tw:leading-3 tw:[font-variant-numeric:tabular-nums]
            ">
                            <span>{number.format(row.favorable)}</span>
                            <span>{number.format(row.unfavorable)}</span>
                        </div>
                        <div className="
                activity-dashboard-card__bars tw:relative tw:flex tw:w-20 tw:h-5 tw:justify-center tw:flex-col
                tw:gap-1 tw:before:absolute tw:before:z-2 tw:before:[inset-block:0]
                tw:before:[inset-inline-start:0] tw:before:w-0
                tw:before:[border-inline-start:1px_solid_#0b0f5e] tw:before:content-['']
                tw:before:pointer-events-none tw:[&_span]:block tw:[&_span]:w-[var(--bar-width,_0%)]
                tw:[&_span]:min-w-0 tw:[&_span]:max-w-20 tw:[&_span]:h-1.5
                tw:[&_span:first-child]:bg-[#c1e639] tw:[&_span:last-child]:bg-[#ff5865]
            ">
                            <span style={css(`--bar-width: ${row.favorable_width}%`)} />
                            <span style={css(`--bar-width: ${row.unfavorable_width}%`)} />
                        </div>
                    </div>
                );
            })}
        </>
    );
}
