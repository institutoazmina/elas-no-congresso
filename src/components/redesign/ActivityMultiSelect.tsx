import { Combobox } from "@base-ui/react/combobox";
import { useEffect, useRef, useState } from "react";
import {
    MULTI_FILTER_CHANGE_EVENT,
    MULTI_FILTER_SYNC_EVENT,
    readActivityMultiOptions,
    readActivityMultiValues,
    type ActivityFilterOption,
    type ActivityMultiFilterName,
} from "../../lib/activity-multiselect";
import "./ActivityMultiSelect.css";

type Props = { name: ActivityMultiFilterName; label: string; placeholder: string };

export default function ActivityMultiSelect({ name, label, placeholder }: Props) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [options, setOptions] = useState<ActivityFilterOption[]>([]);
    const [values, setValues] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const selected = values.map((value) => options.find((option) => option.value === value) ?? { value, label: value });

    useEffect(() => {
        const root = hostRef.current?.closest<HTMLElement>("[data-activity-root]");
        if (!root) return;
        const sync = (event?: Event) => {
            setOptions(readActivityMultiOptions(root, name));
            setValues(readActivityMultiValues(root, name));
            if ((event as CustomEvent<{ close: boolean }> | undefined)?.detail?.close) {
                setOpen(false);
                setSearch("");
            }
        };
        sync();
        root.addEventListener(MULTI_FILTER_SYNC_EVENT, sync);
        return () => root.removeEventListener(MULTI_FILTER_SYNC_EVENT, sync);
    }, [name]);

    const change = (next: string[]) => {
        const root = hostRef.current?.closest<HTMLElement>("[data-activity-root]");
        if (!root) return;
        setValues(next);
        root.dispatchEvent(new CustomEvent(MULTI_FILTER_CHANGE_EVENT, { detail: { name, values: next } }));
    };

    return (
        <div ref={hostRef} className="activity-multiselect">
            <Combobox.Root
                multiple
                items={options}
                value={selected}
                onValueChange={(items) => change(items.map((item) => item.value))}
                isItemEqualToValue={(item, value) => item.value === value.value}
                inputValue={search}
                onInputValueChange={(next, details) => {
                    if (details.isItemPress) details.cancel();
                    else setSearch(next);
                }}
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) setSearch("");
                }}
                disabled={!options.length}
            >
                <Combobox.Trigger
                    type="button"
                    className="activity-multiselect__trigger"
                    aria-label={`${label}: ${selected.length ? selected.map((item) => item.label).join(", ") : placeholder}`}
                    title={selected.map((item) => item.label).join(", ") || placeholder}
                >
                    <span className="activity-multiselect__value">{selected[0]?.label ?? placeholder}</span>
                    {selected.length > 1 && <span className="activity-multiselect__count">+{selected.length - 1}</span>}
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                </Combobox.Trigger>
                <Combobox.Portal>
                    <Combobox.Positioner className="activity-multiselect__positioner" align="start" sideOffset={6} collisionPadding={16}>
                        <Combobox.Popup
                            className="activity-multiselect__popup"
                            aria-label={label}
                            onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}
                        >
                            <div className="activity-multiselect__heading">
                                <strong>{label}</strong>
                                <span aria-live="polite">{selected.length} selecionado{selected.length === 1 ? "" : "s"}</span>
                            </div>
                            <Combobox.Input className="activity-multiselect__search" placeholder="Buscar opções…" aria-label={`Buscar em ${label}`} autoComplete="off" />
                            {selected.length > 0 && (
                                <div className="activity-multiselect__selected" aria-label="Opções selecionadas">
                                    {selected.map((item) => (
                                        <button key={item.value} type="button" className="activity-multiselect__chip" aria-label={`Remover ${item.label}`} onClick={() => change(values.filter((value) => value !== item.value))}>
                                            <span>{item.label}</span><span aria-hidden="true">×</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <Combobox.Empty className="activity-multiselect__empty">Nenhuma opção encontrada.</Combobox.Empty>
                            <Combobox.List className="activity-multiselect__list">
                                {(item: ActivityFilterOption) => (
                                    <Combobox.Item key={item.value} value={item} className="activity-multiselect__option">
                                        <span className="activity-multiselect__check" aria-hidden="true"><Combobox.ItemIndicator>✓</Combobox.ItemIndicator></span>
                                        <span>{item.label}</span>
                                    </Combobox.Item>
                                )}
                            </Combobox.List>
                            <div className="activity-multiselect__footer">
                                <button type="button" className="activity-multiselect__clear" disabled={!selected.length} onClick={() => change([])}>Limpar seleção</button>
                                <button type="button" className="activity-multiselect__done" onClick={() => { setOpen(false); setSearch(""); }}>Concluir</button>
                            </div>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
        </div>
    );
}
