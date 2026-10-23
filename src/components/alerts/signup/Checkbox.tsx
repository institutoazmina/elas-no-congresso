import type { InputHTMLAttributes } from "react";

// Square checkbox: lime fill and a check mark drawn by ::after.
export default function Checkbox({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={`tw:relative tw:size-4 tw:flex-none tw:cursor-pointer tw:appearance-none tw:border tw:border-muted tw:bg-white tw:checked:border-2 tw:checked:border-ink tw:checked:bg-lime tw:checked:after:absolute tw:checked:after:top-0.5 tw:checked:after:left-0.5 tw:checked:after:h-1.5 tw:checked:after:w-2 tw:checked:after:-rotate-45 tw:checked:after:border-b-2 tw:checked:after:border-l-2 tw:checked:after:border-ink tw:checked:after:content-[''] ${className}`}
        />
    );
}
