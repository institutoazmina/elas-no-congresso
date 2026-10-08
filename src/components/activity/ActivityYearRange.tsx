import { Popover } from "@base-ui/react/popover";
import { Select } from "@base-ui/react/select";
import { useEffect, useRef, useState } from "react";
import {
    YEAR_RANGE_CHANGE_EVENT,
    YEAR_RANGE_SYNC_EVENT,
    readActivityYearOptions,
    readActivityYearRange,
    type ActivityYearOption,
    type ActivityYearRange,
} from "../../lib/activity-year-range";

function Chevron() {
    return <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
}

function YearSelect({ label, defaultLabel, value, options, onChange }: {
    label: string;
    defaultLabel: string;
    value: string;
    options: ActivityYearOption[];
    onChange: (value: string) => void;
}) {
    const items = [{ value: "", label: defaultLabel }, ...options];
    return (
        <Select.Root items={items} value={value} onValueChange={(next) => onChange(next ?? "")}>
            <div className="activity-year-range__bound tw:min-w-0">
                <Select.Label className="activity-year-range__label tw:mb-1.5 tw:text-[13px]">{label}</Select.Label>
                <Select.Trigger className="activity-year-range__select tw:flex tw:w-full tw:h-9 tw:items-center tw:justify-between tw:gap-2 tw:border-[2px] tw:border-solid tw:border-[rgb(66_66_246_/_25%)] tw:rounded-none tw:bg-white tw:text-periwinkle tw:font-bold tw:font-sans tw:cursor-pointer tw:text-sm tw:py-1 tw:px-2.5 tw:hover:border-accent tw:[&[data-popup-open]]:border-accent tw:focus-visible:outline-3 tw:focus-visible:outline-lime tw:focus-visible:outline-offset-0.5" type="button">
                    <Select.Value /><Select.Icon><Chevron /></Select.Icon>
                </Select.Trigger>
            </div>
            <Select.Portal>
                <Select.Positioner className="activity-year-range__options-positioner tw:z-130" sideOffset={4} alignItemWithTrigger={false}>
                    <Select.Popup className="activity-year-range__options tw:min-w-[var(--anchor-width)] tw:max-h-[var(--available-height)] tw:border tw:border-solid tw:border-accent tw:bg-white tw:text-ink tw:shadow-[0_8px_24px_rgb(11_15_94_/_12%)]" onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}>
                        <Select.ScrollUpArrow className="activity-year-range__scroll-arrow tw:h-5 tw:bg-white tw:text-accent tw:flex tw:items-center tw:justify-center">▴</Select.ScrollUpArrow>
                        <Select.List className="activity-year-range__list tw:max-h-[min(248px,_var(--available-height))] tw:overflow-y-auto tw:p-1">
                            {items.map((item) => (
                                <Select.Item className="activity-year-range__option tw:flex tw:min-h-8 tw:items-center tw:justify-between tw:gap-3 tw:font-normal tw:text-sm tw:leading-5 tw:font-sans tw:cursor-pointer tw:py-1 tw:px-2 tw:[&[data-highlighted]]:bg-[#ededff] tw:[&[data-highlighted]]:text-accent tw:[&[data-highlighted]]:outline-none tw:[&[data-selected]]:font-bold" key={item.value} value={item.value}>
                                    <Select.ItemText>{item.label}</Select.ItemText><Select.ItemIndicator>✓</Select.ItemIndicator>
                                </Select.Item>
                            ))}
                        </Select.List>
                        <Select.ScrollDownArrow className="activity-year-range__scroll-arrow tw:h-5 tw:bg-white tw:text-accent tw:flex tw:items-center tw:justify-center">▾</Select.ScrollDownArrow>
                    </Select.Popup>
                </Select.Positioner>
            </Select.Portal>
        </Select.Root>
    );
}

export default function ActivityYearRange() {
    const hostRef = useRef<HTMLDivElement>(null);
    const [options, setOptions] = useState<ActivityYearOption[]>([]);
    const [selection, setSelection] = useState<ActivityYearRange>({ start: "", end: "" });
    const [draft, setDraft] = useState<ActivityYearRange>({ start: "", end: "" });
    const [open, setOpen] = useState(false);
    const invalid = Boolean(draft.start && draft.end && Number(draft.start) > Number(draft.end));

    useEffect(() => {
        const root = hostRef.current?.closest<HTMLElement>("[data-activity-root]");
        if (!root) return;
        const sync = (event?: Event) => {
            const range = readActivityYearRange(root);
            setOptions(readActivityYearOptions(root));
            setSelection(range);
            const close = (event as CustomEvent<{ close: boolean }> | undefined)?.detail?.close;
            if (!event || close) setDraft(range);
            if (close) setOpen(false);
        };
        sync();
        root.addEventListener(YEAR_RANGE_SYNC_EVENT, sync);
        return () => root.removeEventListener(YEAR_RANGE_SYNC_EVENT, sync);
    }, []);

    const changeOpen = (next: boolean) => {
        if (next) setDraft(selection);
        setOpen(next);
    };
    const apply = (range: ActivityYearRange) => {
        const root = hostRef.current?.closest<HTMLElement>("[data-activity-root]");
        setOpen(false);
        root?.dispatchEvent(new CustomEvent<ActivityYearRange>(YEAR_RANGE_CHANGE_EVENT, { detail: range }));
    };
    const label = selection.start && selection.end
        ? selection.start === selection.end ? selection.start : `${selection.start}–${selection.end}`
        : selection.start ? `Desde ${selection.start}` : selection.end ? `Até ${selection.end}` : "Todos";

    return (
        <div ref={hostRef} className="activity-year-range tw:min-w-0 tw:w-full">
            <Popover.Root open={open} onOpenChange={changeOpen} modal="trap-focus">
                <Popover.Trigger type="button" className="activity-year-range__trigger tw:flex tw:w-full tw:h-9 tw:items-center tw:justify-between tw:gap-2 tw:border-[2px] tw:border-solid tw:border-[rgb(66_66_246_/_25%)] tw:rounded-none tw:bg-white tw:text-periwinkle tw:font-bold tw:text-base tw:leading-6 tw:font-sans tw:cursor-pointer tw:py-1 tw:px-2.5 tw:[.activity-explorer_&]:text-periwinkle tw:[.activity-explorer_&]:font-sans tw:[.activity-explorer_&]:text-base tw:[.activity-explorer_&]:font-bold tw:[.activity-explorer_&]:tracking-normal tw:[.activity-explorer_&]:leading-6 tw:[&_>_span]:overflow-hidden tw:[&_>_span]:text-ellipsis tw:[&_>_span]:whitespace-nowrap tw:[&_>_svg]:flex-none tw:hover:border-accent tw:[&[data-popup-open]]:border-accent tw:disabled:cursor-wait tw:disabled:opacity-55.00000000000001" aria-label={`Ano de apresentação: ${label}`} disabled={!options.length}>
                    <span>{label}</span><Chevron />
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Positioner className="activity-year-range__positioner tw:z-120" sideOffset={8} align="start" collisionPadding={16}>
                        <Popover.Popup className="activity-year-range__popup tw:w-[min(328px,_calc(100vw_-_32px))] tw:border tw:border-solid tw:border-accent tw:bg-white tw:text-ink tw:font-normal tw:text-sm tw:leading-5 tw:font-sans tw:shadow-[0_8px_24px_rgb(11_15_94_/_12%)] tw:p-4 tw:[&_button:focus-visible]:outline-3 tw:[&_button:focus-visible]:outline-lime tw:[&_button:focus-visible]:outline-offset-0.5" onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}>
                            <div className="activity-year-range__heading tw:flex tw:items-center tw:justify-between tw:gap-2 tw:mb-4 tw:[&_h2]:font-bold tw:[&_h2]:text-[15px] tw:[&_h2]:leading-5 tw:[&_h2]:font-sans tw:[&_h2]:m-0 tw:[&_button]:w-7 tw:[&_button]:h-7 tw:[&_button]:border-0 tw:[&_button]:[background:none] tw:[&_button]:text-accent tw:[&_button]:[font:24px/1_sans-serif] tw:[&_button]:cursor-pointer tw:[&_button]:flex tw:[&_button]:items-center tw:[&_button]:justify-center">
                                <Popover.Title>Período de apresentação</Popover.Title>
                                <Popover.Close type="button" aria-label="Fechar período">×</Popover.Close>
                            </div>
                            <div className="activity-year-range__bounds tw:gap-3 tw:flex tw:[&>*]:flex-1 tw:[&>*]:min-w-0 tw:justify-between">
                                <YearSelect label="De" defaultLabel="Desde o início" value={draft.start} options={options} onChange={(start) => setDraft({ ...draft, start })} />
                                <YearSelect label="Até" defaultLabel="Mais recente" value={draft.end} options={options} onChange={(end) => setDraft({ ...draft, end })} />
                            </div>
                            <Popover.Description className="activity-year-range__hint tw:text-[#676b8e] tw:text-xs tw:leading-[18px] tw:mt-3 tw:mb-4 tw:mx-0">Deixe um ano em branco para um período aberto.</Popover.Description>
                            {invalid && <p className="activity-year-range__error tw:text-[#b1263e] tw:text-xs tw:-mt-1 tw:mb-3 tw:mx-0" role="alert">O ano inicial deve ser igual ou anterior ao final.</p>}
                            <div className="activity-year-range__actions tw:flex tw:items-center tw:justify-between tw:gap-3 tw:[&_button]:min-h-9 tw:[&_button]:rounded-none tw:[&_button]:font-bold tw:[&_button]:text-[13px] tw:[&_button]:leading-[18px] tw:[&_button]:font-sans tw:[&_button]:cursor-pointer">
                                <button type="button" className="activity-year-range__clear tw:border-0 tw:[background:none] tw:text-accent tw:underline tw:underline-offset-[3px] tw:py-1 tw:px-0" onClick={() => apply({ start: "", end: "" })}>Todos os anos</button>
                                <button type="button" className="activity-year-range__apply tw:border-[2px] tw:border-solid tw:border-accent tw:bg-accent tw:text-white tw:py-1.5 tw:px-3 tw:disabled:cursor-not-allowed tw:disabled:opacity-50" disabled={invalid} onClick={() => apply(draft)}>Aplicar período</button>
                            </div>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}
