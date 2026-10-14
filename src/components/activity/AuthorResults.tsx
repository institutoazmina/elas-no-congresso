import type { AuthorActivity, AuthorProposal, RatingGroup } from "../../lib/author-page";
import { authorRoute } from "../../lib/author-page";
import { extractPropositionYear, formatPresentedDate } from "../../lib/canonical";
import { propositionRoute } from "../../lib/proposition-utils";
import { Photo } from "../shared/react-utils";
import { DashboardRows } from "./ActivityResults";
import thumbsUp from "../../assets/images/activity/thumbs-up.svg";
import thumbsDown from "../../assets/images/activity/thumbs-down.svg";

type Props = { proposal: AuthorProposal; author: AuthorActivity["author"] };
function Stance({ proposal }: Pick<Props, "proposal">) {
    return (
        <span className="activity-table__stance tw:flex tw:items-center tw:gap-1.5 tw:[&_img]:w-6 tw:[&_img]:h-6">
            {proposal.stance !== 0 && (
                <img src={proposal.stance > 0 ? thumbsUp.src : thumbsDown.src} alt="" />
            )}
            {proposal.stance === 0
                ? "Sem avaliação"
                : proposal.stance > 0
                  ? "Favorável"
                  : "Desfavorável"}
        </span>
    );
}
function Author({ author }: Pick<Props, "author">) {
    return (
        <a
            href={authorRoute(author.name) ?? "/atividade-legislativa"}
            className="activity-table__author tw:flex tw:items-center tw:gap-2 tw:text-inherit tw:no-underline tw:[&_>_span]:flex tw:[&_>_span]:min-w-0 tw:[&_>_span]:flex-col tw:[&_strong]:overflow-hidden tw:[&_strong]:text-ellipsis tw:[&_strong]:whitespace-nowrap tw:[&_small]:text-xs"
        >
            <Photo
                src={author.photo}
                name={author.name}
                className="tw:w-7.5 tw:h-10 tw:flex-none tw:object-cover tw:object-top"
            />
            <span>
                <strong>{author.name}</strong>
                <small>{[author.party, author.state].filter(Boolean).join("/")}</small>
            </span>
        </a>
    );
}
function Progress({ proposal }: Pick<Props, "proposal">) {
    return (
        <>
            <strong>{proposal.celerity?.label || "Indisponível"}</strong>
            <small>
                {proposal.celerity
                    ? `${proposal.celerity.movements_last_90_days} movimentações em 3 meses`
                    : "Ritmo não informado"}
            </small>
        </>
    );
}
export function AuthorRow({ proposal, author }: Props) {
    return (
        <tr>
            <td>
                <a href={propositionRoute(proposal.number) ?? "/atividade-legislativa"}>{proposal.number}</a>
                <small>{proposal.house.toLowerCase().includes("sen") ? "Senado" : "Câmara"}</small>
            </td>
            <td>
                <Author author={author} />
            </td>
            <td>
                <p title={proposal.summary}>{proposal.summary}</p>
            </td>
            <td>
                <Stance proposal={proposal} />
                {proposal.comment && <small>Com ressalvas</small>}
            </td>
            <td>{proposal.assessor || "—"}</td>
            <td>
                <Progress proposal={proposal} />
            </td>
            <td>{proposal.category || "Não informada"}</td>
            <td title="Data de apresentação (API oficial)">
                {proposal.presentedAt ? formatPresentedDate(proposal.presentedAt) : "—"}
            </td>
        </tr>
    );
}
export function AuthorCard({ proposal, author }: Props) {
    return (
        <article className="author-card tw:flex tw:border-b tw:border-[rgb(66_66_246/25%)] tw:flex-col tw:gap-2.5 tw:py-4 tw:[&_header]:flex tw:[&_header]:justify-between tw:[&_header]:gap-3 tw:[&_header_>_span]:flex tw:[&_header_>_span]:flex-col tw:[&_footer]:flex tw:[&_footer]:justify-between tw:[&_footer]:gap-3 tw:[&_footer]:text-xs tw:[&_footer_>_span]:flex tw:[&_footer_>_span]:flex-col">
            <header>
                <span>
                    <a
                        className="tw:text-accent tw:font-display tw:text-lg tw:font-bold"
                        href={propositionRoute(proposal.number) ?? "/atividade-legislativa"}
                    >
                        {proposal.number}
                    </a>
                    <small>{proposal.house.toLowerCase().includes("sen") ? "Senado" : "Câmara"}</small>
                </span>
                <Stance proposal={proposal} />
            </header>
            <small>{proposal.category || "Categoria não informada"}</small>
            <Author author={author} />
            <p className="tw:text-sm">{proposal.summary}</p>
            <footer>
                <span>
                    <strong>{proposal.assessor || "Sem avaliação"}</strong>
                    <small>{proposal.comment ? "Com ressalvas" : "Sem ressalvas"}</small>
                </span>
                <span>
                    <Progress proposal={proposal} />
                </span>
            </footer>
        </article>
    );
}
export function AuthorGroups({ groups }: { groups: RatingGroup[] }) {
    const shown = groups.slice(0, 3);
    const peak = Math.max(1, ...shown.flatMap((group) => [group.favorable, group.unfavorable]));
    return (
        <DashboardRows
            rows={shown.map((group) => ({
                ...group,
                key: group.label,
                photo: null,
                meta: null,
                color: null,
                favorable_percent: null,
                favorable_width: (group.favorable / peak) * 100,
                unfavorable_width: (group.unfavorable / peak) * 100,
            }))}
        />
    );
}
export function sortAuthorProposals(
    proposals: AuthorProposal[],
    sort: string,
    direction: string,
    authorName: string,
) {
    const text = (item: AuthorProposal) =>
        sort === "number"
            ? item.number
            : sort === "author"
              ? authorName
              : sort === "summary"
                ? item.summary
                : sort === "evaluator"
                  ? item.assessor || ""
                  : sort === "category"
                    ? item.category || ""
                    : "";
    const numeric = (item: AuthorProposal) =>
        sort === "assessment"
            ? item.stance
            : sort === "progress"
              ? (item.celerity?.movements_last_90_days ?? 0)
              : extractPropositionYear(item.presentedAt, item.number) * 1_000_000 + item.id;
    const multiplier = direction === "ascending" ? 1 : -1;
    return [...proposals].sort(
        (a, b) =>
            (["assessment", "progress", "updated"].includes(sort)
                ? numeric(a) - numeric(b)
                : text(a).localeCompare(text(b), "pt-BR", { numeric: true })) * multiplier,
    );
}
