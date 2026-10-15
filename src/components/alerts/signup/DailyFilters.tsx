import ProposalCombobox from "./ProposalCombobox";

// House and proposition filters for daily alerts.
export default function DailyFilters({ hidden }: { hidden: boolean }) {
    return (
        <section
            className="tw:relative tw:z-2 tw:mt-4 tw:w-full tw:border tw:border-[rgba(30,37,70,.12)] tw:bg-ink tw:px-4 tw:py-5.5 tw:text-white tw:md:w-156 tw:md:p-5.5"
            hidden={hidden}
            aria-label="Filtros para alertas diários"
        >
            <p className="tw:flex tw:min-h-11.5 tw:w-full tw:items-center tw:bg-[#2b65d9] tw:px-4.5 tw:py-4 tw:font-sans tw:text-xs tw:leading-4">
                Você pode filtrar os alertas diários por casa e por proposição. Se não escolher uma proposição,
                receberá alertas dos temas selecionados na casa escolhida.
            </p>
            <ProposalCombobox />
        </section>
    );
}
