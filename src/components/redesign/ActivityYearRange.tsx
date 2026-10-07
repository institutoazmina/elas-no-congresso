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
import "./ActivityYearRange.css";

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
            <div className="activity-year-range__bound">
                <Select.Label className="activity-year-range__label">{label}</Select.Label>
                <Select.Trigger className="activity-year-range__select" type="button">
                    <Select.Value /><Select.Icon><Chevron /></Select.Icon>
                </Select.Trigger>
            </div>
            <Select.Portal>
                <Select.Positioner className="activity-year-range__options-positioner" sideOffset={4} alignItemWithTrigger={false}>
                    <Select.Popup className="activity-year-range__options" onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}>
                        <Select.ScrollUpArrow className="activity-year-range__scroll-arrow">▴</Select.ScrollUpArrow>
                        <Select.List className="activity-year-range__list">
                            {items.map((item) => (
                                <Select.Item className="activity-year-range__option" key={item.value} value={item.value}>
                                    <Select.ItemText>{item.label}</Select.ItemText><Select.ItemIndicator>✓</Select.ItemIndicator>
                                </Select.Item>
                            ))}
                        </Select.List>
                        <Select.ScrollDownArrow className="activity-year-range__scroll-arrow">▾</Select.ScrollDownArrow>
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
        <div ref={hostRef} className="activity-year-range">
            <Popover.Root open={open} onOpenChange={changeOpen} modal="trap-focus">
                <Popover.Trigger type="button" className="activity-year-range__trigger" aria-label={`Ano de apresentação: ${label}`} disabled={!options.length}>
                    <span>{label}</span><Chevron />
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Positioner className="activity-year-range__positioner" sideOffset={8} align="start" collisionPadding={16}>
                        <Popover.Popup className="activity-year-range__popup" onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}>
                            <div className="activity-year-range__heading">
                                <Popover.Title>Período de apresentação</Popover.Title>
                                <Popover.Close type="button" aria-label="Fechar período">×</Popover.Close>
                            </div>
                            <div className="activity-year-range__bounds">
                                <YearSelect label="De" defaultLabel="Desde o início" value={draft.start} options={options} onChange={(start) => setDraft({ ...draft, start })} />
                                <YearSelect label="Até" defaultLabel="Até o ano mais recente" value={draft.end} options={options} onChange={(end) => setDraft({ ...draft, end })} />
                            </div>
                            <Popover.Description className="activity-year-range__hint">Deixe um ano em branco para um período aberto.</Popover.Description>
                            {invalid && <p className="activity-year-range__error" role="alert">O ano inicial deve ser igual ou anterior ao final.</p>}
                            <div className="activity-year-range__actions">
                                <button type="button" className="activity-year-range__clear" onClick={() => apply({ start: "", end: "" })}>Todos os anos</button>
                                <button type="button" className="activity-year-range__apply" disabled={invalid} onClick={() => apply(draft)}>Aplicar período</button>
                            </div>
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}
