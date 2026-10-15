import { Image } from "../shared/react-utils";
import paginationPrevious from "../../assets/images/news/pagination-previous.svg";
import paginationNext from "../../assets/images/news/pagination-next.svg";

function PaginationButton({
    icon,
    label,
    disabled,
    onClick,
}: {
    icon: typeof paginationNext;
    label: string;
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className="tw:group tw:flex tw:h-10 tw:w-14 tw:cursor-pointer tw:items-center tw:justify-center tw:border-2 tw:border-accent tw:bg-white tw:transition-colors tw:duration-150 tw:enabled:hover:bg-accent tw:focus-visible:bg-accent tw:focus-visible:outline-2 tw:focus-visible:outline-offset-1 tw:focus-visible:outline-ink tw:disabled:cursor-default tw:disabled:opacity-40"
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
        >
            <Image
                className="tw:size-4 tw:group-enabled:group-hover:brightness-0 tw:group-enabled:group-hover:invert tw:group-focus-visible:brightness-0 tw:group-focus-visible:invert"
                src={icon}
                alt=""
            />
        </button>
    );
}

// Paper strip under the list, with the halftone shadow on its top edge.
export default function ReportsPagination({
    page,
    totalPages,
    loading,
    onNavigate,
}: {
    page: number;
    totalPages: number;
    loading: boolean;
    onNavigate: (page: number) => void;
}) {
    return (
        <div className="tw:relative tw:mt-15 tw:bg-white tw:bg-[url('/src/assets/images/background/bg-pattern-rough-paper.png')] tw:bg-size-[400px] tw:bg-top tw:pt-12 tw:pb-19.5">
            <div
                className="tw:pointer-events-none tw:absolute tw:inset-x-0 tw:top-0 tw:h-3 tw:rotate-180 tw:bg-[url('/src/assets/images/hero/halftone-shadow.png')] tw:bg-size-[720px_12px] tw:bg-repeat-x tw:mix-blend-multiply tw:md:h-6 tw:md:bg-size-[1440px_24px]"
                aria-hidden="true"
            ></div>
            <nav className="tw:flex tw:justify-center tw:gap-1" aria-label="Paginação das reportagens">
                <PaginationButton
                    icon={paginationPrevious}
                    label="Página anterior"
                    disabled={loading || page <= 1}
                    onClick={() => onNavigate(page - 1)}
                />
                <PaginationButton
                    icon={paginationNext}
                    label="Próxima página"
                    disabled={loading || page >= totalPages}
                    onClick={() => onNavigate(page + 1)}
                />
                <span className="tw:sr-only" aria-live="polite">
                    {loading ? "Carregando reportagens." : `Página ${page} de ${totalPages}`}
                </span>
            </nav>
        </div>
    );
}
