import { Combobox } from "@base-ui/react/combobox";
import { PUBLIC_API_BASE_URL } from "astro:env/client";
import { useEffect, useState } from "react";

type Proposal = {
    id: number;
    house: string;
    number_label: string;
    ementa: string;
};

const proposalLabel = (proposal: Proposal) => `${proposal.number_label} - ${proposal.ementa.slice(0, 80)}`;

const getApiBase = () => {
    const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
    return isLocal ? `${window.location.origin}/api/v1` : PUBLIC_API_BASE_URL;
};

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
                const url = new URL(`${getApiBase()}/propositions/`);
                url.searchParams.set("q", query);
                url.searchParams.set("limit", "8");
                if (house) url.searchParams.set("house", house);
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) throw new Error(String(response.status));
                const data = await response.json() as { items: Proposal[] };
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
            <section className="alerts-email-modal__daily-control" aria-label="Casa legislativa">
                <label htmlFor="alerts-house" className="alerts-email-modal__house-label">Casa legislativa</label>
                <div className="alerts-email-modal__daily-select-wrap">
                    <select
                        id="alerts-house"
                        name="casa"
                        className="alerts-email-modal__proposal-input"
                        value={house}
                        onChange={(event) => {
                            const nextHouse = event.target.value;
                            setHouse(nextHouse);
                            setProposals([]);
                            setSelectedProposals((selected) => selected.filter((proposal) => !nextHouse || proposal.house === nextHouse));
                        }}
                    >
                        <option value="">Ambas</option>
                        <option value="senado">Senado</option>
                        <option value="camara">Câmara</option>
                    </select>
                </div>
            </section>
            <section className="alerts-email-modal__daily-control" aria-label="Proposição">
                <h3>Proposição</h3>
                <div className="alerts-email-modal__daily-select-wrap">
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
                        <Combobox.Chips className="alerts-email-modal__proposal-combobox">
                            <Combobox.Input
                                className="alerts-email-modal__proposal-input"
                                aria-label="Buscar proposição por número ou assunto"
                                placeholder="Buscar por número ou assunto..."
                                autoComplete="off"
                            />
                            <Combobox.Value>
                                {(values: Proposal[]) => values.length > 0 && (
                                    <div className="alerts-email-modal__selected-proposals" aria-label="Proposições selecionadas">
                                        {values.map((proposal) => (
                                            <Combobox.Chip key={proposal.id} className="alerts-email-modal__proposal-chip">
                                                <span>{proposal.number_label}</span>
                                                <Combobox.ChipRemove
                                                    className="alerts-email-modal__proposal-remove"
                                                    aria-label={`Remover ${proposal.number_label}`}
                                                >
                                                    ×
                                                </Combobox.ChipRemove>
                                                <input type="hidden" data-alerts-proposal-id value={proposal.id} />
                                            </Combobox.Chip>
                                        ))}
                                    </div>
                                )}
                            </Combobox.Value>
                        </Combobox.Chips>
                        <Combobox.Portal>
                            <Combobox.Positioner className="alerts-email-modal__proposal-positioner" sideOffset={4} align="start">
                                <Combobox.Popup className="alerts-email-modal__proposal-popup">
                                    {loading && <Combobox.Status className="alerts-email-modal__proposal-message">Buscando...</Combobox.Status>}
                                    {!loading && message && <Combobox.Empty className="alerts-email-modal__proposal-message">{message}</Combobox.Empty>}
                                    <Combobox.List className="alerts-email-modal__proposal-list">
                                        {(proposal: Proposal) => (
                                            <Combobox.Item key={proposal.id} value={proposal} className="alerts-email-modal__proposal-item">
                                                <span>{proposalLabel(proposal)}</span>
                                                <Combobox.ItemIndicator className="alerts-email-modal__proposal-indicator" aria-hidden="true">✓</Combobox.ItemIndicator>
                                            </Combobox.Item>
                                        )}
                                    </Combobox.List>
                                </Combobox.Popup>
                            </Combobox.Positioner>
                        </Combobox.Portal>
                    </Combobox.Root>
                </div>
                <p className="alerts-email-modal__daily-helper">Opcional: escolha uma PL somente se quiser restringir os alertas a ela.</p>
            </section>
        </>
    );
}
