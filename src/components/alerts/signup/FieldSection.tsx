import type { ReactNode } from "react";

// A fieldset with the form's uppercase legend and an optional hint below it.
export default function FieldSection({
    legend,
    hint,
    hidden,
    className = "",
    children,
}: {
    legend: string;
    hint?: ReactNode;
    hidden?: boolean;
    className?: string;
    children: ReactNode;
}) {
    return (
        <fieldset className={`tw:w-full tw:min-w-0 ${className}`} hidden={hidden}>
            <legend className="tw:font-display tw:text-xl tw:leading-6 tw:font-bold tw:text-navy tw:uppercase tw:[font-variation-settings:'wdth'_75]">
                {legend}
            </legend>
            {hint && <p className="tw:pt-1.5 tw:font-sans tw:text-base tw:leading-6 tw:text-ink tw:md:text-muted">{hint}</p>}
            {children}
        </fieldset>
    );
}
