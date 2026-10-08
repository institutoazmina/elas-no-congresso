import PersistentPortal from "../shared/PersistentPortal";
import { Select } from "@base-ui/react/select";
import { useId, useState } from "react";

type Props = {
    name: string;
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    compact?: boolean;
    disabled?: boolean;
};

export default function ActivitySelect({
    label,
    options,
    value,
    onChange,
    compact = false,
    disabled = false,
}: Props) {
    const listId = useId();
    const [open, setOpen] = useState(false);

    return (
        <div
            className={`activity-select tw:w-full tw:min-w-0 ${compact ? "activity-select--compact tw:w-36.5! tw:flex-none" : ""}`}
        >
            <Select.Root
                items={options}
                value={value}
                disabled={disabled}
                open={open}
                onOpenChange={setOpen}
                onValueChange={(next) => {
                    if (next === null) return;
                    onChange(next);
                }}
            >
                <Select.Trigger
                    aria-controls={listId}
                    type="button"
                    className="activity-select__trigger tw:in-[.activity-explorer]:flex tw:in-[.activity-explorer]:box-border tw:in-[.activity-explorer]:w-full tw:in-[.activity-explorer]:min-w-0 tw:in-[.activity-explorer]:h-9 tw:in-[.activity-explorer]:items-center tw:in-[.activity-explorer]:gap-2 tw:in-[.activity-explorer]:border-2 tw:in-[.activity-explorer]:border-solid tw:in-[.activity-explorer]:border-[rgb(66_66_246/25%)] tw:in-[.activity-explorer]:rounded-none tw:in-[.activity-explorer]:bg-white tw:in-[.activity-explorer]:text-periwinkle tw:in-[.activity-explorer]:font-bold tw:in-[.activity-explorer]:text-base tw:in-[.activity-explorer]:leading-6 tw:in-[.activity-explorer]:font-sans tw:in-[.activity-explorer]:text-left tw:in-[.activity-explorer]:cursor-pointer tw:in-[.activity-explorer]:py-1 tw:in-[.activity-explorer]:px-2.5 tw:hover:border-accent tw:data-popup-open:border-accent tw:disabled:cursor-not-allowed tw:disabled:opacity-55.00000000000001 tw:[&_svg]:block tw:[&_svg]:flex-none tw:[.activity-explorer_.activity-select--compact_&]:h-5.5 tw:[.activity-explorer_.activity-select--compact_&]:border-0 tw:[.activity-explorer_.activity-select--compact_&]:bg-transparent tw:[.activity-explorer_.activity-select--compact_&]:text-accent tw:[.activity-explorer_.activity-select--compact_&]:text-xs tw:[.activity-explorer_.activity-select--compact_&]:font-normal tw:[.activity-explorer_.activity-select--compact_&]:leading-4 tw:[.activity-explorer_.activity-select--compact_&]:gap-1 tw:[.activity-explorer_.activity-select--compact_&]:py-0 tw:[.activity-explorer_.activity-select--compact_&]:px-1 tw:[.activity-select--compact_&_svg]:w-2.5 tw:[.activity-select--compact_&_svg]:h-2.5 tw:max-md:[.activity-explorer_.activity-select--compact_&]:text-[12px]"
                    aria-label={`${label}: ${options.find((option) => option.value === value)?.label ?? ""}`}
                >
                    <Select.Value className="activity-select__value tw:min-w-0 tw:flex-1 tw:overflow-hidden tw:text-ellipsis tw:whitespace-nowrap" />
                    <Select.Icon>
                        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                            <path d="m3 6 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </Select.Icon>
                </Select.Trigger>

                <PersistentPortal>
                    <Select.Positioner
                        className="activity-select__positioner tw:z-130 tw:outline-none"
                        align="start"
                        sideOffset={6}
                        collisionPadding={16}
                        alignItemWithTrigger={false}
                    >
                        <Select.Popup
                            className="activity-select__popup tw:min-w-(--anchor-width) tw:max-w-[calc(100vw-32px)] tw:max-h-(--available-height) tw:border tw:border-solid tw:border-accent tw:bg-white tw:text-ink tw:shadow-[0_8px_24px_rgb(11_15_94/12%)] tw:font-normal tw:text-sm tw:leading-5 tw:font-sans"
                            onKeyDown={(event) => {
                                if (event.key === "Escape") event.stopPropagation();
                            }}
                        >
                            <Select.ScrollUpArrow className="activity-select__scroll tw:h-5 tw:bg-white tw:text-accent tw:flex tw:items-center tw:justify-center">
                                ▴
                            </Select.ScrollUpArrow>
                            <Select.List
                                id={listId}
                                aria-label={label}
                                className="activity-select__list tw:max-h-[min(320px,var(--available-height))] tw:overflow-y-auto tw:overscroll-contain tw:py-1 tw:px-1.5"
                            >
                                {options.map((option) => (
                                    <Select.Item
                                        key={option.value}
                                        value={option.value}
                                        className="activity-select__option tw:flex tw:min-h-10 tw:items-center tw:gap-2.5 tw:cursor-pointer tw:outline-none tw:py-1.5 tw:px-2 tw:data-highlighted:bg-[#ededff] tw:data-selected:text-ink tw:data-selected:font-bold"
                                    >
                                        <span
                                            className="activity-select__check tw:w-4.5 tw:flex-none tw:text-accent tw:flex tw:items-center tw:justify-center"
                                            aria-hidden="true"
                                        >
                                            <Select.ItemIndicator>✓</Select.ItemIndicator>
                                        </span>
                                        <Select.ItemText>{option.label}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.List>
                            <Select.ScrollDownArrow className="activity-select__scroll tw:h-5 tw:bg-white tw:text-accent tw:flex tw:items-center tw:justify-center">
                                ▾
                            </Select.ScrollDownArrow>
                        </Select.Popup>
                    </Select.Positioner>
                </PersistentPortal>
            </Select.Root>
        </div>
    );
}
