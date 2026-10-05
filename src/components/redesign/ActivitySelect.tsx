import { Select } from "@base-ui/react/select";
import { useEffect, useRef, useState } from "react";
import { activitySelectInput, SELECT_CHANGE_EVENT, SELECT_SYNC_EVENT } from "../../lib/activity-select";
import "./ActivitySelect.css";

type Props = {
    name: string;
    label: string;
    options: { value: string; label: string }[];
    defaultValue?: string;
    compact?: boolean;
    disabled?: boolean;
};

export default function ActivitySelect({ name, label, options, defaultValue = "", compact = false, disabled = false }: Props) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState(defaultValue);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const root = hostRef.current?.closest<HTMLElement>("[data-activity-root]");
        if (!root) return;
        const sync = (event?: Event) => {
            setValue(activitySelectInput(root, name)?.value ?? defaultValue);
            if ((event as CustomEvent<{ close: boolean }> | undefined)?.detail?.close) setOpen(false);
        };
        sync();
        root.addEventListener(SELECT_SYNC_EVENT, sync);
        return () => root.removeEventListener(SELECT_SYNC_EVENT, sync);
    }, [name, defaultValue]);

    return (
        <div ref={hostRef} className={`activity-select${compact ? " activity-select--compact" : ""}`}>
            <Select.Root
                items={options} value={value} disabled={disabled} open={open} onOpenChange={setOpen}
                onValueChange={(next) => {
                    if (next === null) return;
                    setValue(next);
                    hostRef.current?.closest("[data-activity-root]")?.dispatchEvent(
                        new CustomEvent(SELECT_CHANGE_EVENT, { detail: { name, value: next } }),
                    );
                }}
            >
                <Select.Trigger type="button" className="activity-select__trigger" aria-label={`${label}: ${options.find((option) => option.value === value)?.label ?? ""}`}>
                    <Select.Value className="activity-select__value" />
                    <Select.Icon><svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" /></svg></Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Positioner className="activity-select__positioner" align="start" sideOffset={6} collisionPadding={16} alignItemWithTrigger={false}>
                        <Select.Popup className="activity-select__popup" onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}>
                            <Select.ScrollUpArrow className="activity-select__scroll">▴</Select.ScrollUpArrow>
                            <Select.List className="activity-select__list">
                                {options.map((option) => (
                                    <Select.Item key={option.value} value={option.value} className="activity-select__option">
                                        <span className="activity-select__check" aria-hidden="true"><Select.ItemIndicator>✓</Select.ItemIndicator></span>
                                        <Select.ItemText>{option.label}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.List>
                            <Select.ScrollDownArrow className="activity-select__scroll">▾</Select.ScrollDownArrow>
                        </Select.Popup>
                    </Select.Positioner>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}
