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
            {proposal.favoravel !== 0 && (
                <img src={proposal.favoravel > 0 ? thumbsUp.src : thumbsDown.src} alt="" />
            )}
            {proposal.favoravel === 0
                ? "Sem avaliação"
                : proposal.favoravel > 0
                  ? "Favorável"
                  : "Desfavorável"}
        </span>
    );
}
function Author({ author }: Pick<Props, "author">) {
    return (
        <a
            href={authorRoute(author.nome) ?? "/atividade-legislativa"}
            className="activity-table__author tw:flex tw:items-center tw:gap-2 tw:text-inherit tw:no-underline tw:[&_>_span]:flex tw:[&_>_span]:min-w-0 tw:[&_>_span]:flex-col tw:[&_strong]:overflow-hidden tw:[&_strong]:text-ellipsis tw:[&_strong]:whitespace-nowrap tw:[&_small]:text-xs"
        >
            <Photo
                src={author.foto}
                name={author.nome}
                className="tw:w-7.5 tw:h-10 tw:flex-none tw:object-cover tw:object-top"
            />
            <span>
                <strong>{author.nome}</strong>
                <small>{[author.partido, author.estado].filter(Boolean).join("/")}</small>
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
                <a href={propositionRoute(proposal.numero) ?? "/atividade-legislativa"}>{proposal.numero}</a>
                <small>{proposal.casa.toLowerCase().includes("sen") ? "Senado" : "Câmara"}</small>
            </td>
            <td>
                <Author author={author} />
            </td>
            <td>
                <p title={proposal.resumo}>{proposal.resumo}</p>
            </td>
            <td>
                <Stance proposal={proposal} />
                {proposal.comentario && <small>Com ressalvas</small>}
            </td>
            <td>{proposal.avaliador || "—"}</td>
            <td>
                <Progress proposal={proposal} />
            </td>
            <td>{proposal.categoria || "Não informada"}</td>
            <td title="Data de apresentação (API oficial)">
                {proposal.apresentadaEm ? formatPresentedDate(proposal.apresentadaEm) : "—"}
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
                        href={propositionRoute(proposal.numero) ?? "/atividade-legislativa"}
                    >
                        {proposal.numero}
                    </a>
                    <small>{proposal.casa.toLowerCase().includes("sen") ? "Senado" : "Câmara"}</small>
                </span>
                <Stance proposal={proposal} />
            </header>
            <small>{proposal.categoria || "Categoria não informada"}</small>
            <Author author={author} />
            <p className="tw:text-sm">{proposal.resumo}</p>
            <footer>
                <span>
                    <strong>{proposal.avaliador || "Sem avaliação"}</strong>
                    <small>{proposal.comentario ? "Com ressalvas" : "Sem ressalvas"}</small>
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
            ? item.numero
            : sort === "author"
              ? authorName
              : sort === "summary"
                ? item.resumo
                : sort === "evaluator"
                  ? item.avaliador || ""
                  : sort === "category"
                    ? item.categoria || ""
                    : "";
    const numeric = (item: AuthorProposal) =>
        sort === "assessment"
            ? item.favoravel
            : sort === "progress"
              ? (item.celerity?.movements_last_90_days ?? 0)
              : extractPropositionYear(item.apresentadaEm, item.numero) * 1_000_000 + item.i;
    const multiplier = direction === "ascending" ? 1 : -1;
    return [...proposals].sort(
        (a, b) =>
            (["assessment", "progress", "updated"].includes(sort)
                ? numeric(a) - numeric(b)
                : text(a).localeCompare(text(b), "pt-BR", { numeric: true })) * multiplier,
    );
}
