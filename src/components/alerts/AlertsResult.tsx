import { useEffect, useState } from "react";
type Copy = { heading: string; body: string };
export default function AlertsResult({ ok, invalido }: { ok: Copy; invalido: Copy }) {
    const [copy, setCopy] = useState<Copy>({ heading: "Verificando…", body: "" });
    useEffect(() => {
        setCopy(new URLSearchParams(location.search).get("status") === "invalido" ? invalido : ok);
    }, [ok, invalido]);
    return (
        <main className="alerts-result tw:w-156 tw:max-w-[calc(100%-48px)] tw:text-navy tw:pt-24 tw:pb-30 tw:px-0 tw:my-0 tw:mx-auto tw:[&_h1]:text-navy tw:[&_h1]:font-display tw:[&_h1]:text-[34px] tw:[&_h1]:font-extrabold tw:[&_h1]:[font-variation-settings:'wdth'_75] tw:[&_h1]:leading-11.5 tw:[&_h1]:m-0 tw:[&_p]:text-muted tw:[&_p]:font-normal tw:[&_p]:text-lg tw:[&_p]:leading-7 tw:[&_p]:font-sans tw:[&_p]:mt-4 tw:[&_p]:mb-0 tw:[&_p]:mx-0 tw:max-[681px]:max-w-[calc(100%-32px)] tw:max-[681px]:pt-14 tw:max-[681px]:pb-20 tw:max-[681px]:px-0 tw:max-[681px]:[&_h1]:text-[26px] tw:max-[681px]:[&_h1]:leading-8.5">
            <h1 data-alerts-result-heading>{copy.heading}</h1>
            <p data-alerts-result-body>{copy.body}</p>
            <a
                className="alerts-result__link tw:inline-block tw:mt-8 tw:bg-accent tw:text-white tw:font-display tw:text-lg tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:no-underline tw:uppercase tw:pt-4.5 tw:pb-3.5 tw:px-6"
                href="/alertas"
            >
                Voltar para os alertas
            </a>
        </main>
    );
}
