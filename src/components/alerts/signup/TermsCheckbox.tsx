import Checkbox from "./Checkbox";

export default function TermsCheckbox({
    checked,
    hidden,
    onChange,
}: {
    checked: boolean;
    hidden: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label
            className="tw:flex tw:cursor-pointer tw:items-center tw:gap-3 tw:pt-5 tw:font-sans tw:text-sm tw:leading-6 tw:text-muted tw:md:gap-2.5 tw:md:pt-9 tw:md:leading-5"
            hidden={hidden}
        >
            <Checkbox name="termos" checked={checked} onChange={(event) => onChange(event.target.checked)} />
            <span>
                Li e aceito os{" "}
                <a className="tw:font-bold tw:text-navy" href="/termos-de-uso">
                    Termos de Uso
                </a>{" "}
                e a{" "}
                <a className="tw:font-bold tw:text-navy" href="/politica-de-privacidade">
                    Política de Privacidade
                </a>{" "}
                do Elas no Congresso.
            </span>
        </label>
    );
}
