import { Select } from "@base-ui/react/select";
import { useEffect, useState } from "react";
import type { AlertsSortOrder } from "../../../lib/alerts/query-state";
import "./AlertsSort.css";

const options: Array<{ value: AlertsSortOrder; label: string }> = [
    { value: "newest", label: "Mais recentes" },
    { value: "oldest", label: "Mais antigas" },
];

const readSort = (): AlertsSortOrder => new URL(window.location.href).searchParams.get("sort") === "oldest" ? "oldest" : "newest";

export default function AlertsSortSelect() {
    const [value, setValue] = useState<AlertsSortOrder>("newest");

    useEffect(() => {
        const syncFromUrl = () => setValue(readSort());
        syncFromUrl();
        window.addEventListener("popstate", syncFromUrl);
        return () => window.removeEventListener("popstate", syncFromUrl);
    }, []);

    const updateValue = (nextValue: AlertsSortOrder | null) => {
        if (!nextValue) return;
        setValue(nextValue);
        window.dispatchEvent(new CustomEvent<AlertsSortOrder>("alerts-sort-change", { detail: nextValue }));
    };

    return (
        <div className="alerts-sort">
            <Select.Root value={value} onValueChange={updateValue}>
                <Select.Trigger className="alerts-sort__trigger" aria-label="Ordenar alertas">
                    <Select.Value className="alerts-sort__value">
                        {options.find((option) => option.value === value)?.label}
                    </Select.Value>
                    <Select.Icon className="alerts-sort__icon">
                        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m2 5 6 6 6-6" /></svg>
                    </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Positioner className="alerts-sort__positioner" sideOffset={4} alignItemWithTrigger={false}>
                        <Select.Popup className="alerts-sort__popup">
                            <Select.List className="alerts-sort__list">
                                {options.map((option) => (
                                    <Select.Item key={option.value} value={option.value} className="alerts-sort__item">
                                        <Select.ItemText>{option.label}</Select.ItemText>
                                        <Select.ItemIndicator className="alerts-sort__indicator" aria-hidden="true">✓</Select.ItemIndicator>
                                    </Select.Item>
                                ))}
                            </Select.List>
                        </Select.Popup>
                    </Select.Positioner>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}
