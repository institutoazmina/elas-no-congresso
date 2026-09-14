import { Combobox } from "@base-ui/react/combobox";
import { PUBLIC_API_BASE_URL } from "astro:env/client";
import { useEffect, useState } from "react";

type Proposal = {
    id: number;
    number_label: string;
    ementa: string;
};

const proposalLabel = (proposal: Proposal) => `${proposal.number_label} - ${proposal.ementa.slice(0, 80)}`;

const getApiBase = () => {
    const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
    return isLocal ? `${window.location.origin}/api/v1` : PUBLIC_API_BASE_URL;
};

export default function AlertsProposalCombobox() {
    const [inputValue, setInputValue] = useState("");
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [selectedProposals, setSelectedProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("Digite ao menos 3 caracteres para buscar por número ou assunto.");

    useEffect(() => {
        const query = inputValue.trim();
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
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) throw new Error(String(response.status));
                const data = await response.json() as { items: Proposal[] };
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
    }, [inputValue]);

    return (
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
    );
}
