export default function EmailField({
    value,
    required,
    hidden,
    onChange,
}: {
    value: string;
    required: boolean;
    hidden: boolean;
    onChange: (value: string, valid: boolean) => void;
}) {
    return (
        <div className="tw:mt-9 tw:flex tw:w-full tw:flex-col tw:gap-1.5 tw:md:gap-2" hidden={hidden}>
            <label
                className="tw:min-h-7 tw:font-display tw:text-xl tw:leading-6 tw:font-bold tw:text-navy tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:md:min-h-0"
                htmlFor="alerts-email"
            >
                E-mail
            </label>
            <input
                className="tw:h-12.5 tw:w-full tw:border tw:border-muted tw:px-4.5 tw:py-3.5 tw:font-sans tw:text-lg tw:leading-6 tw:text-navy tw:placeholder:text-muted tw:placeholder:opacity-70 tw:not-placeholder-shown:border-2 tw:not-placeholder-shown:border-ink tw:md:not-placeholder-shown:font-bold tw:md:focus:border-2 tw:md:focus:border-ink tw:md:focus:font-bold"
                id="alerts-email"
                name="email"
                type="email"
                required={required}
                value={value}
                onChange={(event) => onChange(event.target.value, event.target.validity.valid)}
                placeholder="seu@email.com"
                autoComplete="email"
            />
        </div>
    );
}
