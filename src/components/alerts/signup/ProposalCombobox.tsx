import { Combobox } from "@base-ui/react/combobox";
import { clientApiBase, SEARCH_MAX_LENGTH } from "../../../lib/client-api";
import { useEffect, useState } from "react";

type Proposal = {
    id: number;
    house: string;
    number_label: string;
    ementa: string;
};

const proposalLabel = (proposal: Proposal) => `${proposal.number_label} - ${proposal.ementa.slice(0, 80)}`;

export default function ProposalCombobox() {
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
                if (house) { url.searchParams.set("house", house); }
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) { throw new Error(String(response.status)); }
                const data = (await response.json()) as { items: Proposal[] };
                if (controller.signal.aborted) { return; }
                setProposals(data.items);
                setMessage(data.items.length ? "" : "Nenhuma proposição encontrada para essa busca.");
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    setProposals([]);
                    setMessage("Não foi possível buscar agora. Você pode deixar em branco.");
                }
            } finally {
                if (!controller.signal.aborted) { setLoading(false); }
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
                className="tw:w-full tw:pt-5 tw:md:w-145.5"
                aria-label="Casa legislativa"
            >
                <label
                    htmlFor="alerts-house"
                    className="tw:block tw:font-display tw:text-lg tw:leading-6 tw:font-bold tw:text-white tw:uppercase tw:[font-variation-settings:'wdth'_75]"
                >
                    Casa legislativa
                </label>
                <div className="tw:relative tw:mt-2">
                    <select
                        id="alerts-house"
                        name="house"
                        className="tw:cursor-pointer tw:block tw:w-full tw:h-12.5 tw:border tw:border-[rgba(30,37,70,.15)] tw:bg-white tw:text-ink tw:text-base tw:leading-5 tw:font-sans tw:py-3 tw:px-4 tw:placeholder:text-muted tw:placeholder:opacity-100 tw:focus-visible:outline-2 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1"
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
                className="tw:w-full tw:pt-5 tw:md:w-145.5"
                aria-label="Proposição"
            >
                <h3 className="tw:font-display tw:text-lg tw:leading-6 tw:font-bold tw:text-white tw:uppercase tw:[font-variation-settings:'wdth'_75]">Proposição</h3>
                <div className="tw:relative tw:mt-2">
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
                        <Combobox.Chips className="tw:flex tw:w-full tw:flex-col tw:gap-2.5">
                            <Combobox.Input
                                className="tw:block tw:w-full tw:h-12.5 tw:border tw:border-[rgba(30,37,70,.15)] tw:bg-white tw:text-ink tw:text-base tw:leading-5 tw:font-sans tw:py-3 tw:px-4 tw:placeholder:text-muted tw:placeholder:opacity-100 tw:focus-visible:outline-2 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1"
                                aria-label="Buscar proposição por número ou assunto"
                                maxLength={SEARCH_MAX_LENGTH}
                                placeholder="Buscar por número ou assunto..."
                                autoComplete="off"
                            />
                            <Combobox.Value>
                                {(values: Proposal[]) =>
                                    values.length > 0 && (
                                        <div
                                            className="tw:flex tw:gap-2"
                                            aria-label="Proposições selecionadas"
                                        >
                                            {values.map((proposal) => (
                                                <Combobox.Chip
                                                    key={proposal.id}
                                                    className="tw:inline-flex tw:min-h-8.5 tw:items-center tw:gap-2.5 tw:border tw:border-lime tw:bg-lime tw:text-ink tw:font-bold tw:text-sm tw:leading-5 tw:font-sans tw:py-1.5 tw:pr-1.5 tw:pl-2.5"
                                                >
                                                    <span>{proposal.number_label}</span>
                                                    <Combobox.ChipRemove
                                                        className="tw:w-6 tw:h-6 tw:bg-ink tw:text-white tw:text-[22px] tw:leading-none tw:font-[Arial,sans-serif] tw:cursor-pointer tw:pt-0 tw:pb-0.5 tw:px-0 tw:focus-visible:outline-2 tw:focus-visible:outline-white tw:focus-visible:outline-offset-1 tw:flex tw:items-center tw:justify-center"
                                                        aria-label={`Remover ${proposal.number_label}`}
                                                    >
                                                        ×
                                                    </Combobox.ChipRemove>
                                                    <input
                                                        type="hidden"
                                                        name="propositions"
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
                                className="tw:z-101 tw:outline-none"
                                sideOffset={4}
                                align="start"
                            >
                                <Combobox.Popup className="tw:w-(--anchor-width) tw:border tw:border-[rgba(30,37,70,.15)] tw:bg-white tw:shadow-[0_10px_16px_-4px_rgba(0,0,0,.1),0_4px_6px_-4px_rgba(0,0,0,.1)] tw:text-ink">
                                    {loading && (
                                        <Combobox.Status className="tw:block tw:text-muted tw:text-sm tw:leading-5 tw:font-sans tw:py-3 tw:px-4">
                                            Buscando...
                                        </Combobox.Status>
                                    )}
                                    {!loading && message && (
                                        <Combobox.Empty className="tw:block tw:text-muted tw:text-sm tw:leading-5 tw:font-sans tw:py-3 tw:px-4">
                                            {message}
                                        </Combobox.Empty>
                                    )}
                                    <Combobox.List className="tw:max-h-60 tw:overflow-y-auto">
                                        {(proposal: Proposal) => (
                                            <Combobox.Item
                                                key={proposal.id}
                                                value={proposal}
                                                className="tw:min-h-11.5 tw:items-center tw:gap-2 tw:border-b tw:border-b-[rgba(30,37,70,.15)] tw:bg-white tw:text-ink tw:text-sm tw:leading-5 tw:font-sans tw:cursor-pointer tw:outline-none tw:py-2.5 tw:px-4 tw:last:[border-bottom:0] tw:data-highlighted:bg-lime tw:data-selected:bg-accent tw:data-selected:text-white tw:flex tw:justify-between tw:*:first:min-w-0 tw:*:first:flex-1"
                                            >
                                                <span>{proposalLabel(proposal)}</span>
                                                <Combobox.ItemIndicator
                                                    className="tw:[justify-self:end] tw:font-bold"
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
                <p className="tw:pt-1.5 tw:font-sans tw:text-sm tw:leading-5 tw:text-white/72 tw:md:w-145.5">
                    Opcional: escolha uma PL somente se quiser restringir os alertas a ela.
                </p>
            </section>
        </>
    );
}
