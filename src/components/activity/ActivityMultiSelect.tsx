import { Combobox } from "@base-ui/react/combobox";
import { useEffect, useId, useRef, useState } from "react";
import {
    MULTI_FILTER_CHANGE_EVENT,
    MULTI_FILTER_SYNC_EVENT,
    readActivityMultiOptions,
    readActivityMultiValues,
    type ActivityFilterOption,
    type ActivityMultiFilterName,
} from "../../lib/activity-multiselect";

type Props = { name: ActivityMultiFilterName; label: string; placeholder: string };

export default function ActivityMultiSelect({ name, label, placeholder }: Props) {
    const popupId = useId();
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
        <div ref={hostRef} className="activity-multiselect tw:w-full tw:min-w-0">
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
                    aria-controls={popupId}
                    type="button"
                    className="activity-multiselect__trigger tw:in-[.activity-explorer]:flex tw:in-[.activity-explorer]:w-full tw:in-[.activity-explorer]:min-w-0 tw:in-[.activity-explorer]:h-9 tw:in-[.activity-explorer]:items-center tw:in-[.activity-explorer]:gap-2 tw:in-[.activity-explorer]:border-2 tw:in-[.activity-explorer]:border-solid tw:in-[.activity-explorer]:border-[rgb(66_66_246/25%)] tw:in-[.activity-explorer]:rounded-none tw:in-[.activity-explorer]:bg-white tw:in-[.activity-explorer]:text-periwinkle tw:in-[.activity-explorer]:font-bold tw:in-[.activity-explorer]:text-base tw:in-[.activity-explorer]:leading-6 tw:in-[.activity-explorer]:font-sans tw:in-[.activity-explorer]:text-left tw:in-[.activity-explorer]:cursor-pointer tw:in-[.activity-explorer]:py-1 tw:in-[.activity-explorer]:px-2.5 tw:hover:border-accent tw:data-popup-open:border-accent tw:disabled:cursor-not-allowed tw:disabled:opacity-55.00000000000001 tw:[&_svg]:flex-none"
                    aria-label={`${label}: ${selected.length ? selected.map((item) => item.label).join(", ") : placeholder}`}
                    title={selected.map((item) => item.label).join(", ") || placeholder}
                >
                    <span className="activity-multiselect__value tw:min-w-0 tw:flex-1 tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap">{selected[0]?.label ?? placeholder}</span>
                    {selected.length > 1 && <span className="activity-multiselect__count tw:flex-none tw:bg-lime tw:text-ink tw:text-xs tw:leading-4.5 tw:py-px tw:px-1.5">+{selected.length - 1}</span>}
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                </Combobox.Trigger>
                <Combobox.Portal keepMounted>
                    <Combobox.Positioner className="activity-multiselect__positioner tw:z-130 tw:outline-none" align="start" sideOffset={6} collisionPadding={16}>
                        <Combobox.Popup
                            id={popupId}
                            className="activity-multiselect__popup tw:flex tw:w-[min(360px,calc(100vw-32px))] tw:max-h-(--available-height) tw:flex-col tw:border tw:border-solid tw:border-accent tw:bg-white tw:text-ink tw:shadow-[0_8px_24px_rgb(11_15_94/12%)] tw:font-normal tw:text-sm tw:leading-5 tw:font-sans tw:[&_button:focus-visible]:outline-4 tw:[&_button:focus-visible]:outline-lime tw:[&_button:focus-visible]:outline-offset-1"
                            aria-label={label}
                            onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}
                        >
                            <div className="activity-multiselect__heading tw:flex tw:flex-none tw:items-center tw:justify-between tw:gap-3 tw:pt-3.5 tw:pb-2.5 tw:px-3.5 tw:[&_>_span]:text-[#676b8e] tw:[&_>_span]:text-xs tw:[&_>_span]:whitespace-nowrap">
                                <strong>{label}</strong>
                                <span aria-live="polite">{selected.length} selecionado{selected.length === 1 ? "" : "s"}</span>
                            </div>
                            <Combobox.Input className="activity-multiselect__search tw:w-[calc(100%-28px)] tw:min-h-10 tw:flex-none tw:border tw:border-solid tw:border-[#b4b4fb] tw:rounded-none tw:bg-white tw:text-ink tw:[font:inherit] tw:py-2 tw:px-2.5 tw:mt-0 tw:mb-2.5 tw:mx-3.5 tw:focus-visible:outline-4 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-1" placeholder="Buscar opções…" aria-label={`Buscar em ${label}`} autoComplete="off" />
                            {selected.length > 0 && (
                                <div className="activity-multiselect__selected tw:flex tw:max-h-22 tw:flex-none tw:gap-1.5 tw:overflow-y-auto tw:pt-0 tw:pb-2.5 tw:px-3.5" aria-label="Opções selecionadas">
                                    {selected.map((item) => (
                                        <button key={item.value} type="button" className="activity-multiselect__chip tw:inline-flex tw:max-w-full tw:items-center tw:gap-2 tw:border-0 tw:rounded-none tw:bg-[#ededff] tw:text-ink tw:font-bold tw:text-xs tw:leading-4.5 tw:font-sans tw:text-left tw:cursor-pointer tw:py-1 tw:px-2 tw:[&_>_span:first-child]:overflow-hidden tw:[&_>_span:first-child]:text-ellipsis tw:[&_>_span:first-child]:whitespace-nowrap tw:[&_>_span:last-child]:text-lg" aria-label={`Remover ${item.label}`} onClick={() => change(values.filter((value) => value !== item.value))}>
                                            <span>{item.label}</span><span aria-hidden="true">×</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <Combobox.Empty className="activity-multiselect__empty tw:text-[#676b8e] tw:py-3 tw:px-3.5">Nenhuma opção encontrada.</Combobox.Empty>
                            <Combobox.List className="activity-multiselect__list tw:min-h-0 tw:max-h-62 tw:overflow-y-auto tw:overscroll-contain tw:py-1 tw:px-1.5">
                                {(item: ActivityFilterOption) => (
                                    <Combobox.Item key={item.value} value={item} className="activity-multiselect__option tw:flex tw:min-h-10 tw:items-center tw:gap-2.5 tw:cursor-pointer tw:outline-none tw:py-1.5 tw:px-2 tw:data-highlighted:bg-[#ededff] tw:data-selected:text-ink tw:data-selected:font-bold">
                                        <span className="activity-multiselect__check tw:w-4.5 tw:h-4.5 tw:flex-none tw:border tw:border-solid tw:border-[#8c8ce8] tw:text-white tw:text-[14px] tw:[.activity-multiselect\_\_option[data-selected]_&]:border-accent tw:[.activity-multiselect\_\_option[data-selected]_&]:bg-accent tw:flex tw:items-center tw:justify-center" aria-hidden="true"><Combobox.ItemIndicator>✓</Combobox.ItemIndicator></span>
                                        <span>{item.label}</span>
                                    </Combobox.Item>
                                )}
                            </Combobox.List>
                            <div className="activity-multiselect__footer tw:flex tw:flex-none tw:items-center tw:justify-between tw:gap-3 tw:mt-1 tw:border-t tw:border-solid tw:border-t-[#ededff] tw:py-2.5 tw:px-3.5 tw:[&_button]:min-h-9 tw:[&_button]:rounded-none tw:[&_button]:font-bold tw:[&_button]:text-[14px] tw:[&_button]:leading-4.5 tw:[&_button]:font-sans tw:[&_button]:cursor-pointer">
                                <button type="button" className="activity-multiselect__clear tw:border-0 tw:bg-transparent tw:text-accent tw:underline tw:underline-offset-4 tw:py-1 tw:px-0 tw:disabled:cursor-default tw:disabled:opacity-45" disabled={!selected.length} onClick={() => change([])}>Limpar seleção</button>
                                <button type="button" className="activity-multiselect__done tw:border-2 tw:border-solid tw:border-accent tw:bg-accent tw:text-white tw:py-1.5 tw:px-3" onClick={() => { setOpen(false); setSearch(""); }}>Concluir</button>
                            </div>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
        </div>
    );
}

