import { Select } from "@base-ui/react/select";
import { useEffect, useId, useState } from "react";
import type { AlertsSortOrder } from "../../lib/alerts/query-state";

const options: Array<{ value: AlertsSortOrder; label: string }> = [
    { value: "newest", label: "Mais recentes" },
    { value: "oldest", label: "Mais antigas" },
];

const readSort = (): AlertsSortOrder => new URL(window.location.href).searchParams.get("sort") === "oldest" ? "oldest" : "newest";

export default function AlertsSortSelect() {
    const listId = useId();
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
        <div className="alerts-sort tw:contents">
            <Select.Root value={value} onValueChange={updateValue}>
                <Select.Trigger className="alerts-sort__trigger tw:items-center tw:bg-white tw:border-2 tw:border-solid tw:border-[#1b2548] tw:rounded-none tw:text-[#1b2548] tw:cursor-pointer tw:flex tw:font-bold tw:text-lg tw:leading-6 tw:font-display tw:[font-variation-settings:'wdth'_75] tw:gap-2 tw:h-14 tw:justify-center tw:uppercase tw:[transition:background-color_160ms_ease-out,color_160ms_ease-out] tw:w-44 tw:py-3.5 tw:px-4 tw:hover:bg-lime tw:data-popup-open:bg-lime tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:outline-offset-4 tw:motion-reduce:[transition:none]" aria-label="Ordenar alertas" aria-controls={listId}>
                    <Select.Value className="alerts-sort__value tw:flex-1 tw:whitespace-nowrap">
                        {options.find((option) => option.value === value)?.label}
                    </Select.Value>
                    <Select.Icon className="alerts-sort__icon tw:flex-none tw:[&_svg]:fill-none tw:[&_svg]:h-3.5 tw:[&_svg]:stroke-[currentColor] tw:[&_svg]:[stroke-linecap:square] tw:[&_svg]:stroke-[2px] tw:[&_svg]:[transition:transform_160ms_ease] tw:[&_svg]:w-3.5 tw:[.alerts-sort\_\_trigger[data-popup-open]_&_svg]:transform-[rotate(180deg)] tw:motion-reduce:[&_svg]:[transition:none] tw:flex tw:items-center tw:justify-center">
                        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m2 5 6 6 6-6" /></svg>
                    </Select.Icon>
                </Select.Trigger>
                <Select.Positioner className="alerts-sort__positioner tw:z-100 tw:outline-none" sideOffset={4} alignItemWithTrigger={false}>
                        <Select.Popup className="alerts-sort__popup tw:bg-white tw:border-2 tw:border-solid tw:border-accent tw:shadow-[-4px_4px_0_#0b0f5e] tw:text-accent tw:min-w-(--anchor-width) tw:origin-(--transform-origin) tw:[transition:opacity_120ms_ease,transform_120ms_ease] tw:data-starting-style:opacity-0 tw:data-starting-style:transform-[translateY(-4px)] tw:data-ending-style:opacity-0 tw:data-ending-style:transform-[translateY(-4px)] tw:motion-reduce:[transition:none]">
                            <Select.List id={listId} aria-label="Ordenar alertas" className="alerts-sort__list tw:p-0">
                                {options.map((option) => (
                                    <Select.Item key={option.value} value={option.value} className="alerts-sort__item tw:items-center tw:bg-white tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/35%)] tw:text-accent tw:cursor-pointer tw:font-bold tw:text-lg tw:leading-6 tw:font-display tw:[font-variation-settings:'wdth'_75] tw:gap-2 tw:min-h-14 tw:outline-none tw:uppercase tw:[user-select:none] tw:py-2.5 tw:px-3.5 tw:last:[border-bottom:0] tw:data-highlighted:bg-[#eeeeff] tw:data-selected:bg-accent tw:data-selected:text-white tw:flex tw:justify-between tw:*:first:min-w-0 tw:*:first:flex-1">
                                        <Select.ItemText>{option.label}</Select.ItemText>
                                        <Select.ItemIndicator className="alerts-sort__indicator tw:font-bold tw:text-base tw:leading-5 tw:font-sans tw:[justify-self:end]" aria-hidden="true">✓</Select.ItemIndicator>
                                    </Select.Item>
                                ))}
                            </Select.List>
                        </Select.Popup>
                </Select.Positioner>
            </Select.Root>
        </div>
    );
}

