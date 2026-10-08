import { Combobox } from "@base-ui/react/combobox";
import { clientApiBase } from "../../lib/client-api";
import { useEffect, useState } from "react";

type Proposal = {
    id: number;
    house: string;
    number_label: string;
    ementa: string;
};

const proposalLabel = (proposal: Proposal) => `${proposal.number_label} - ${proposal.ementa.slice(0, 80)}`;

export default function AlertsProposalCombobox() {
    const [house, setHouse] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [selectedProposals, setSelectedProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("Digite ao menos 3 caracteres para buscar por número ou assunto.");

    useEffect(() => {
        const query = inputValue.trim();
        setLoading(false);
        if (query.length < 3) {
            setProposals([]);
            setMessage("Digite ao menos 3 caracteres para buscar por número ou assunto.");
            return;
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(async () => {
            setLoading(true);
            try {
                const url = new URL(`${clientApiBase()}/propositions/`);
                url.searchParams.set("q", query);
                url.searchParams.set("limit", "8");
                if (house) url.searchParams.set("house", house);
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) throw new Error(String(response.status));
                const data = (await response.json()) as { items: Proposal[] };
                if (controller.signal.aborted) return;
                setProposals(data.items);
                setMessage(data.items.length ? "" : "Nenhuma proposição encontrada para essa busca.");
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    setProposals([]);
                    setMessage("Não foi possível buscar agora. Você pode deixar em branco.");
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [inputValue, house]);

    return (
        <>
            <section
                className="alerts-email-modal__daily-control tw:w-145.5 tw:pt-5 tw:[&_h3]:text-white tw:[&_h3]:font-display tw:[&_h3]:text-lg tw:[&_h3]:font-bold tw:[&_h3]:[font-variation-settings:'wdth'_75] tw:[&_h3]:leading-6 tw:[&_h3]:uppercase tw:max-md:w-full tw:max-md:h-auto"
                aria-label="Casa legislativa"
            >
                <label
                    htmlFor="alerts-house"
                    className="alerts-email-modal__house-label tw:in-[.alerts-email-modal__daily-control]:block tw:in-[.alerts-email-modal__daily-control]:text-white tw:in-[.alerts-email-modal__daily-control]:font-display tw:in-[.alerts-email-modal__daily-control]:text-lg tw:in-[.alerts-email-modal__daily-control]:font-bold tw:in-[.alerts-email-modal__daily-control]:[font-variation-settings:'wdth'_75] tw:in-[.alerts-email-modal__daily-control]:leading-6 tw:in-[.alerts-email-modal__daily-control]:uppercase"
                >
                    Casa legislativa
                </label>
                <div className="alerts-email-modal__daily-select-wrap tw:relative tw:mt-2 tw:max-md:w-full">
                    <select
                        id="alerts-house"
                        name="casa"
                        className="alerts-email-modal__proposal-input tw:cursor-pointer tw:block tw:w-full tw:h-12.5 tw:border tw:border-solid tw:border-[rgba(30,37,70,.15)] tw:rounded-none tw:bg-white tw:text-ink tw:font-normal tw:text-base tw:leading-5 tw:font-sans tw:py-3 tw:px-4 tw:placeholder:text-muted tw:placeholder:opacity-100 tw:focus-visible:outline-2 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1"
                        value={house}
                        onChange={(event) => {
                            const nextHouse = event.target.value;
                            setHouse(nextHouse);
                            setProposals([]);
                            setSelectedProposals((selected) =>
                                selected.filter((proposal) => !nextHouse || proposal.house === nextHouse),
                            );
                        }}
                    >
                        <option value="">Ambas</option>
                        <option value="senado">Senado</option>
                        <option value="camara">Câmara</option>
                    </select>
                </div>
            </section>
            <section
                className="alerts-email-modal__daily-control tw:w-145.5 tw:pt-5 tw:[&_h3]:text-white tw:[&_h3]:font-display tw:[&_h3]:text-lg tw:[&_h3]:font-bold tw:[&_h3]:[font-variation-settings:'wdth'_75] tw:[&_h3]:leading-6 tw:[&_h3]:uppercase tw:max-md:w-full tw:max-md:h-auto"
                aria-label="Proposição"
            >
                <h3>Proposição</h3>
                <div className="alerts-email-modal__daily-select-wrap tw:relative tw:mt-2 tw:max-md:w-full">
                    <Combobox.Root
                        items={proposals}
                        filter={null}
                        multiple
                        value={selectedProposals}
                        inputValue={inputValue}
                        itemToStringLabel={proposalLabel}
                        isItemEqualToValue={(item, value) => item.id === value.id}
                        onInputValueChange={setInputValue}
                        onValueChange={setSelectedProposals}
                        autoHighlight
                    >
                        <Combobox.Chips className="alerts-email-modal__proposal-combobox tw:flex tw:w-full tw:flex-col tw:gap-2.5">
                            <Combobox.Input
                                className="alerts-email-modal__proposal-input tw:block tw:w-full tw:h-12.5 tw:border tw:border-solid tw:border-[rgba(30,37,70,.15)] tw:rounded-none tw:bg-white tw:text-ink tw:font-normal tw:text-base tw:leading-5 tw:font-sans tw:py-3 tw:px-4 tw:placeholder:text-muted tw:placeholder:opacity-100 tw:focus-visible:outline-2 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1"
                                aria-label="Buscar proposição por número ou assunto"
                                placeholder="Buscar por número ou assunto..."
                                autoComplete="off"
                            />
                            <Combobox.Value>
                                {(values: Proposal[]) =>
                                    values.length > 0 && (
                                        <div
                                            className="alerts-email-modal__selected-proposals tw:flex tw:gap-2"
                                            aria-label="Proposições selecionadas"
                                        >
                                            {values.map((proposal) => (
                                                <Combobox.Chip
                                                    key={proposal.id}
                                                    className="alerts-email-modal__proposal-chip tw:inline-flex tw:min-h-8.5 tw:items-center tw:gap-2.5 tw:border tw:border-solid tw:border-lime tw:bg-lime tw:text-ink tw:font-bold tw:text-sm tw:leading-5 tw:font-sans tw:py-1.5 tw:pr-1.5 tw:pl-2.5"
                                                >
                                                    <span>{proposal.number_label}</span>
                                                    <Combobox.ChipRemove
                                                        className="alerts-email-modal__proposal-remove tw:w-6 tw:h-6 tw:border-0 tw:bg-ink tw:text-white tw:font-normal tw:text-[22px] tw:leading-none tw:font-[Arial,sans-serif] tw:cursor-pointer tw:pt-0 tw:pb-0.5 tw:px-0 tw:focus-visible:outline-2 tw:focus-visible:outline-white tw:focus-visible:outline-offset-1 tw:flex tw:items-center tw:justify-center"
                                                        aria-label={`Remover ${proposal.number_label}`}
                                                    >
                                                        ×
                                                    </Combobox.ChipRemove>
                                                    <input
                                                        type="hidden"
                                                        name="proposicao"
                                                        data-alerts-proposal-id
                                                        value={proposal.id}
                                                    />
                                                </Combobox.Chip>
                                            ))}
                                        </div>
                                    )
                                }
                            </Combobox.Value>
                        </Combobox.Chips>
                        <Combobox.Portal>
                            <Combobox.Positioner
                                className="alerts-email-modal__proposal-positioner tw:z-101 tw:outline-none"
                                sideOffset={4}
                                align="start"
                            >
                                <Combobox.Popup className="alerts-email-modal__proposal-popup tw:w-(--anchor-width) tw:border tw:border-solid tw:border-[rgba(30,37,70,.15)] tw:bg-white tw:shadow-[0_10px_16px_-4px_rgba(0,0,0,.1),0_4px_6px_-4px_rgba(0,0,0,.1)] tw:text-ink">
                                    {loading && (
                                        <Combobox.Status className="alerts-email-modal__proposal-message tw:block tw:text-muted tw:font-normal tw:text-sm tw:leading-5 tw:font-sans tw:py-3 tw:px-4">
                                            Buscando...
                                        </Combobox.Status>
                                    )}
                                    {!loading && message && (
                                        <Combobox.Empty className="alerts-email-modal__proposal-message tw:block tw:text-muted tw:font-normal tw:text-sm tw:leading-5 tw:font-sans tw:py-3 tw:px-4">
                                            {message}
                                        </Combobox.Empty>
                                    )}
                                    <Combobox.List className="alerts-email-modal__proposal-list tw:max-h-60 tw:overflow-y-auto tw:p-0">
                                        {(proposal: Proposal) => (
                                            <Combobox.Item
                                                key={proposal.id}
                                                value={proposal}
                                                className="alerts-email-modal__proposal-item tw:min-h-11.5 tw:items-center tw:gap-2 tw:border-b tw:border-solid tw:border-b-[rgba(30,37,70,.15)] tw:bg-white tw:text-ink tw:font-normal tw:text-sm tw:leading-5 tw:font-sans tw:cursor-pointer tw:outline-none tw:py-2.5 tw:px-4 tw:last:[border-bottom:0] tw:data-highlighted:bg-lime tw:data-selected:bg-accent tw:data-selected:text-white tw:flex tw:justify-between tw:*:first:min-w-0 tw:*:first:flex-1"
                                            >
                                                <span>{proposalLabel(proposal)}</span>
                                                <Combobox.ItemIndicator
                                                    className="alerts-email-modal__proposal-indicator tw:[justify-self:end] tw:font-bold"
                                                    aria-hidden="true"
                                                >
                                                    ✓
                                                </Combobox.ItemIndicator>
                                            </Combobox.Item>
                                        )}
                                    </Combobox.List>
                                </Combobox.Popup>
                            </Combobox.Positioner>
                        </Combobox.Portal>
                    </Combobox.Root>
                </div>
                <p className="alerts-email-modal__daily-helper tw:w-145.5 tw:pt-1.5 tw:text-[rgba(30,37,70,.35)] tw:font-normal tw:text-sm tw:leading-5 tw:font-sans tw:max-md:w-full tw:max-md:text-[rgba(255,255,255,.72)]">
                    Opcional: escolha uma PL somente se quiser restringir os alertas a ela.
                </p>
            </section>
        </>
    );
}
