import Checkbox from "./Checkbox";

export default function TopicOption({
    value,
    label,
    checked,
    onChange,
}: {
    value: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="tw:flex tw:min-h-8 tw:min-w-0 tw:flex-none tw:cursor-pointer tw:items-center tw:gap-2.5 tw:font-sans tw:text-base tw:leading-6 tw:text-ink tw:md:min-h-0 tw:md:w-[calc(50%-12px)] tw:md:text-muted">
            <Checkbox
                className="tw:peer tw:size-4.5 tw:border-ink tw:md:border-muted"
                name="tema"
                value={value}
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span className="tw:peer-checked:bg-lime tw:peer-checked:px-1.5 tw:peer-checked:py-1 tw:peer-checked:text-ink tw:md:peer-checked:font-semibold">
                {label}
            </span>
        </label>
    );
}
