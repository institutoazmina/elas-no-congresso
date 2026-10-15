import type { ReactNode } from "react";

// Selectable card with a square radio: lime fill and a check mark drawn by ::after.
export default function FrequencyOption({
    title,
    value,
    checked,
    disabled,
    onSelect,
    className = "",
    children,
}: {
    title: string;
    value: string;
    checked: boolean;
    disabled: boolean;
    onSelect: () => void;
    className?: string;
    children: ReactNode;
}) {
    return (
        <label
            className={`tw:flex tw:cursor-pointer tw:flex-col tw:border tw:border-muted tw:bg-white tw:p-5 tw:font-sans tw:text-sm tw:leading-4 tw:text-muted tw:has-checked:border-2 tw:has-checked:border-ink tw:md:w-[calc(50%-8px)] tw:md:p-5.5 tw:md:has-checked:p-5 ${className}`}
        >
            <span className="tw:flex tw:items-center tw:justify-between tw:font-display tw:text-lg tw:leading-6 tw:font-bold tw:text-navy tw:uppercase tw:[font-variation-settings:'wdth'_75]">
                <strong>{title}</strong>
                <input
                    className="tw:relative tw:size-5.5 tw:flex-none tw:cursor-pointer tw:appearance-none tw:border tw:border-muted tw:bg-white tw:checked:border-2 tw:checked:border-ink tw:checked:bg-lime tw:checked:after:absolute tw:checked:after:top-1 tw:checked:after:left-1 tw:checked:after:h-2 tw:checked:after:w-2.5 tw:checked:after:-rotate-45 tw:checked:after:border-b-2 tw:checked:after:border-l-2 tw:checked:after:border-ink tw:checked:after:content-['']"
                    type="radio"
                    name="frequencia"
                    value={value}
                    checked={checked}
                    disabled={disabled}
                    onChange={onSelect}
                />
            </span>
            <span className="tw:pt-3 tw:max-md:max-w-65.5">{children}</span>
        </label>
    );
}
