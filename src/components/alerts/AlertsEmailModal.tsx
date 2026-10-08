import { Image } from "../shared/react-utils";
import chevron from "../../assets/images/home-reportagens/chevron-right.svg";
import type { CategoryOption } from "../../service/api/alerts";
import AlertsEmailDialog from "./AlertsEmailDialog";
import AlertsProposalCombobox from "./AlertsProposalCombobox";

import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { buildAst } from "../../lib/alerts/ast";
import { clientApiBase } from "../../lib/client-api";
export default function AlertsEmailModal({
    categories,
    open,
    onOpenChange,
}: {
    categories: CategoryOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [frequency, setFrequency] = useState("");
    const [weeklyLoaded, setWeeklyLoaded] = useState(false);
    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(false);
    const [topics, setTopics] = useState<string[]>([]);
    const [terms, setTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [status, setStatus] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const requestRef = useRef<AbortController | null>(null);
    useEffect(() => () => requestRef.current?.abort(), []);
    const canSubmit =
        frequency === "diario" && !!email && validEmail && topics.length > 0 && terms && !submitting;
    async function submit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canSubmit || requestRef.current) return;
        const data = new FormData(event.currentTarget);
        const controller = new AbortController();
        requestRef.current = controller;
        setSubmitting(true);
        setStatus("Enviando…");
        try {
            const response = await fetch(`${clientApiBase()}/subscriptions/`, {
                method: "POST",
                signal: controller.signal,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    accepted_terms: terms,
                    alerts: [
                        {
                            frequency: "daily",
                            ast: buildAst({
                                categorias: topics,
                                casa: String(data.get("casa") ?? ""),
                                proposicoes: data.getAll("proposicao").map(Number),
                            }),
                        },
                    ],
                }),
            });
            if (controller.signal.aborted) return;
            if (response.status === 429) {
                setStatus("Muitas tentativas deste dispositivo. Tente de novo daqui a pouco.");
                return;
            }
            if (!response.ok) throw new Error(String(response.status));
            setSuccess(true);
            setStatus(
                `Quase lá! Enviamos um e-mail para ${email}. Confira sua caixa de entrada e clique no link de confirmação para ativar sua assinatura. Se não encontrar, verifique também a pasta de spam.`,
            );
        } catch {
            if (!controller.signal.aborted)
                setStatus("Não conseguimos concluir a inscrição. Tente novamente em alguns minutos.");
        } finally {
            requestRef.current = null;
            if (!controller.signal.aborted) setSubmitting(false);
        }
    }
    return (
        <AlertsEmailDialog
            open={open}
            onOpenChange={onOpenChange}
            expanded={!!frequency}
            className={`${frequency === "semanal" ? "alerts-email-modal--weekly-open" : frequency === "diario" ? "alerts-email-modal--daily-open" : ""} ${success ? "alerts-email-modal--success" : ""}`}
        >
            <div className="alerts-email-modal__content tw:flex tw:w-full tw:flex-col tw:items-start tw:gap-6 tw:pt-20 tw:pb-10 tw:px-6 tw:min-[821px]:bg-white tw:min-[821px]:bg-none tw:min-[821px]:opacity-100 tw:min-[821px]:gap-0 tw:max-md:gap-0 tw:max-md:py-0 tw:max-md:px-4 tw:in-[.alerts-email-modal--success]:pb-30">
                <header className="alerts-email-modal__intro tw:w-156 tw:max-w-full tw:[&_p]:text-muted tw:[&_p]:font-sans tw:[&_p]:text-base tw:[&_p]:font-normal tw:[&_p]:leading-6 tw:[&_p]:pt-4 tw:min-[821px]:flex tw:min-[821px]:mx-auto tw:min-[821px]:flex-col tw:min-[821px]:gap-4 tw:min-[821px]:[&_p]:w-156 tw:min-[821px]:[&_p]:max-w-full tw:min-[821px]:[&_p]:pt-0 tw:min-[821px]:[&_p]:m-0 tw:max-md:w-full tw:max-md:pb-9 tw:max-md:[&_p]:text-ink tw:max-md:[&_p]:w-full tw:max-md:[&_p]:pt-4 tw:in-[.alerts-email-modal--success]:hidden tw:min-[821px]:items-center tw:min-[821px]:text-center tw:min-[821px]:[&_p]:mx-auto tw:min-[821px]:[&_p]:text-muted tw:min-[821px]:[&_p]:text-center">
                    <h2 id="alerts-email-modal-title">
                        Receba alertas do que acontece no Congresso Nacional!
                    </h2>
                    <p id="alerts-email-modal-description">
                        <span>
                            Quer saber quando uma nova proposta sobre gênero é apresentada,
                            <br className="tw:max-md:hidden" />
                            ou quando algo de muita importância avança? A gente te avisa!
                        </span>
                        <br className="tw:max-md:hidden" />
                        <span className="alerts-email-modal__intro-choice tw:max-md:block tw:max-md:pt-6">
                            Escolha como e quando quer receber os e-mails.
                        </span>
                    </p>
                </header>

                <form
                    ref={formRef}
                    data-astro-reload
                    onSubmit={submit}
                    hidden={success}
                    className="alerts-email-modal__form tw:flex tw:w-156 tw:max-w-full tw:pt-10 tw:flex-col tw:items-start tw:min-[821px]:pt-10 tw:min-[821px]:pb-4 tw:max-md:pt-0 tw:max-md:pb-12 tw:max-md:px-0"
                >
                    <fieldset className="alerts-email-modal__section alerts-email-modal__frequency-section tw:[&>p]:text-muted tw:[&>p]:font-sans tw:[&>p]:text-base tw:[&>p]:font-normal tw:[&>p]:leading-6 tw:[&>p]:pt-1.5 tw:w-full tw:min-w-0 tw:border-0 tw:p-0 tw:m-0 tw:min-[821px]:h-auto tw:min-[821px]:min-h-0 tw:min-[821px]:mt-9 tw:min-[821px]:pt-0 tw:min-[821px]:[&>p]:pt-1.5 tw:min-[821px]:[&>p]:pb-0 tw:min-[821px]:[&>p]:px-0 tw:min-[821px]:[&>p]:m-0 tw:max-md:[&>p]:text-ink tw:max-md:mt-9 tw:max-md:pt-0 tw:in-[.alerts-email-modal]:relative tw:in-[.alerts-email-modal]:mt-0">
                        <legend className="tw:m-0 tw:min-[821px]:m-0 tw:max-md:mt-0">Frequência</legend>
                        <p>
                            Escolha uma das opções.
                            <br />
                            Cada frequência tem regras diferentes — leia antes de selecionar.
                        </p>
                        <div className="alerts-email-modal__frequencies tw:flex tw:gap-4 tw:pt-6.5 tw:*:min-w-0 tw:*:w-[calc(50%-8px)] tw:*:flex-none tw:max-md:flex-col tw:max-md:gap-5 tw:max-md:*:w-full">
                            <div className="alerts-email-modal__weekly-card tw:flex tw:min-h-37 tw:flex-col tw:gap-4 tw:min-[821px]:relative tw:min-[821px]:gap-0 tw:max-md:w-full tw:max-md:min-h-46 tw:max-md:m-0 tw:max-md:max-[340px]:min-h-0">
                                <label className="alerts-email-modal__frequency-card tw:flex tw:min-h-37 tw:flex-col tw:border tw:border-solid tw:border-muted tw:bg-white tw:text-muted tw:font-normal tw:text-sm tw:leading-4 tw:font-sans tw:cursor-pointer tw:p-5.5 tw:max-md:border-muted tw:max-md:border tw:max-md:p-5 tw:h-full tw:max-md:min-h-46 tw:max-md:max-[340px]:h-auto tw:max-md:max-[340px]:p-4 tw:has-checked:border-2 tw:has-checked:border-ink tw:has-checked:p-5 tw:max-md:has-checked:p-5 tw:max-md:max-[340px]:has-checked:p-4">
                                    <span className="alerts-email-modal__frequency-heading tw:flex tw:items-center tw:justify-between tw:text-navy tw:font-display tw:text-lg tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:uppercase">
                                        <strong>Semanal</strong>
                                        <input
                                            className="tw:relative tw:w-5 tw:h-5 tw:appearance-none tw:border tw:border-solid tw:border-muted tw:rounded-none tw:bg-white tw:flex-[0_0_16px] tw:basis-5 tw:m-0 tw:checked:border-2 tw:checked:border-solid tw:checked:border-ink tw:checked:bg-lime tw:checked:after:absolute tw:checked:after:top-1 tw:checked:after:left-1 tw:checked:after:w-2.5 tw:checked:after:h-2 tw:checked:after:border-b-2 tw:checked:after:border-solid tw:checked:after:border-b-ink tw:checked:after:border-l-2 tw:checked:after:border-l-ink tw:checked:after:content-[''] tw:checked:after:transform-[rotate(-45deg)] tw:min-[821px]:w-5.5 tw:min-[821px]:h-5.5 tw:min-[821px]:basis-5.5 tw:max-md:w-5.5 tw:max-md:h-5.5 tw:max-md:basis-5.5 tw:max-md:checked:after:top-1 tw:max-md:checked:after:left-1"
                                            type="radio"
                                            name="frequencia"
                                            value="semanal"
                                            checked={frequency === "semanal"}
                                            disabled={submitting}
                                            onChange={() => {
                                                setFrequency("semanal");
                                                setStatus("");
                                                setWeeklyLoaded(true);
                                            }}
                                        />
                                    </span>
                                    <span className="tw:pt-3 tw:max-md:w-[min(262px,100%)]">
                                        A newsletter do Elas no Congresso reúne, contextualiza e analisa os
                                        impactos políticos das tramitações.
                                    </span>
                                </label>
                            </div>
                            <label className="alerts-email-modal__frequency-card alerts-email-modal__daily-card tw:flex tw:min-h-37 tw:flex-col tw:border tw:border-solid tw:border-muted tw:bg-white tw:text-muted tw:font-normal tw:text-sm tw:leading-4 tw:font-sans tw:cursor-pointer tw:p-5.5 tw:max-md:border-muted tw:max-md:border tw:max-md:p-5 tw:max-md:h-36 tw:max-md:min-h-36 tw:has-checked:border-2 tw:has-checked:border-ink tw:has-checked:p-5 tw:max-md:has-checked:p-5">
                                <span className="alerts-email-modal__frequency-heading tw:flex tw:items-center tw:justify-between tw:text-navy tw:font-display tw:text-lg tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:uppercase">
                                    <strong>Diário</strong>
                                    <input
                                        className="tw:relative tw:w-5 tw:h-5 tw:appearance-none tw:border tw:border-solid tw:border-muted tw:rounded-none tw:bg-white tw:flex-[0_0_16px] tw:basis-5 tw:m-0 tw:checked:border-2 tw:checked:border-solid tw:checked:border-ink tw:checked:bg-lime tw:checked:after:absolute tw:checked:after:top-1 tw:checked:after:left-1 tw:checked:after:w-2.5 tw:checked:after:h-2 tw:checked:after:border-b-2 tw:checked:after:border-solid tw:checked:after:border-b-ink tw:checked:after:border-l-2 tw:checked:after:border-l-ink tw:checked:after:content-[''] tw:checked:after:transform-[rotate(-45deg)] tw:min-[821px]:w-5.5 tw:min-[821px]:h-5.5 tw:min-[821px]:basis-5.5 tw:max-md:w-5.5 tw:max-md:h-5.5 tw:max-md:basis-5.5 tw:max-md:checked:after:top-1 tw:max-md:checked:after:left-1"
                                        type="radio"
                                        name="frequencia"
                                        value="diario"
                                        checked={frequency === "diario"}
                                        disabled={submitting}
                                        onChange={() => {
                                            setFrequency("diario");
                                            setStatus("");
                                        }}
                                    />
                                </span>
                                <span className="tw:pt-3 tw:max-md:w-[min(262px,100%)]">
                                    Alertas enviados assim que uma movimentação acontecer.
                                </span>
                            </label>
                        </div>
                        <section
                            className="alerts-email-modal__newsletter tw:flex tw:w-full tw:mt-6 tw:flex-col tw:gap-4 tw:[&_h3]:text-navy tw:[&_h3]:font-display tw:[&_h3]:text-xl tw:[&_h3]:font-bold tw:[&_h3]:leading-7 tw:[&_h3]:m-0 tw:[&_a]:self-start tw:[&_a]:text-ink tw:[&_a]:font-bold tw:[&_a]:text-sm tw:[&_a]:leading-5 tw:[&_a]:font-sans tw:[&_a]:underline"
                            hidden={frequency !== "semanal"}
                            aria-labelledby="alerts-newsletter-title"
                        >
                            <h3 id="alerts-newsletter-title">Assine a newsletter do Elas no Congresso</h3>
                            <iframe
                                className="tw:block tw:w-full tw:h-80 tw:border tw:border-solid tw:border-[#eee] tw:bg-white"
                                src={weeklyLoaded ? "https://elasnocongresso.substack.com/embed" : undefined}
                                width="480"
                                height="320"
                                title="Assine a newsletter Elas no Congresso"
                            ></iframe>
                            <a
                                href="https://elasnocongresso.substack.com/subscribe"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Abrir inscrição no Substack
                            </a>
                        </section>
                    </fieldset>

                    <div
                        className="alerts-email-modal__email-field tw:flex tw:w-full tw:mt-9 tw:flex-col tw:gap-1.5 tw:min-[821px]:gap-2 tw:max-md:gap-1.5 tw:[&_input:not(:placeholder-shown)]:border-2 tw:[&_input:not(:placeholder-shown)]:border-solid tw:[&_input:not(:placeholder-shown)]:border-ink tw:min-[821px]:[&_input:not(:placeholder-shown)]:border-2 tw:min-[821px]:[&_input:not(:placeholder-shown)]:border-solid tw:min-[821px]:[&_input:not(:placeholder-shown)]:border-ink tw:min-[821px]:[&_input:not(:placeholder-shown)]:font-bold tw:min-[821px]:[&_input:not(:placeholder-shown)]:py-3.5 tw:min-[821px]:[&_input:not(:placeholder-shown)]:px-4.5"
                        hidden={frequency !== "diario"}
                    >
                        <label
                            className="tw:text-navy tw:font-display tw:text-xl tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:uppercase tw:p-0 tw:max-md:min-h-7"
                            htmlFor="alerts-email"
                        >
                            E-mail
                        </label>
                        <input
                            className="tw:w-full tw:h-12.5 tw:border tw:border-solid tw:border-muted tw:rounded-none tw:text-navy tw:font-normal tw:text-lg tw:leading-6 tw:font-sans tw:py-3 tw:px-4 tw:placeholder:text-muted tw:placeholder:opacity-100 tw:min-[821px]:py-3.5 tw:min-[821px]:px-4.5 tw:min-[821px]:placeholder:opacity-70 tw:min-[821px]:focus:border-2 tw:min-[821px]:focus:border-solid tw:min-[821px]:focus:border-ink tw:min-[821px]:focus:font-bold tw:min-[821px]:focus:py-3.5 tw:min-[821px]:focus:px-4.5 tw:max-md:py-3.5 tw:max-md:px-4.5 tw:max-md:placeholder:opacity-70"
                            id="alerts-email"
                            name="email"
                            type="email"
                            required={frequency === "diario"}
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setValidEmail(event.target.validity.valid);
                            }}
                            placeholder="seu@email.com"
                            autoComplete="email"
                        />
                    </div>

                    <fieldset
                        className="alerts-email-modal__section tw:[&>p]:text-muted tw:[&>p]:font-sans tw:[&>p]:text-base tw:[&>p]:font-normal tw:[&>p]:leading-6 tw:[&>p]:pt-1.5 tw:w-full tw:min-w-0 tw:border-0 tw:p-0 tw:m-0 tw:min-[821px]:h-auto tw:min-[821px]:min-h-0 tw:min-[821px]:mt-9 tw:min-[821px]:pt-0 tw:min-[821px]:[&>p]:pt-1.5 tw:min-[821px]:[&>p]:pb-0 tw:min-[821px]:[&>p]:px-0 tw:min-[821px]:[&>p]:m-0 tw:max-md:[&>p]:text-ink tw:max-md:mt-9 tw:max-md:pt-0"
                        data-alerts-themes
                        hidden={frequency !== "diario"}
                    >
                        <legend className="tw:m-0 tw:min-[821px]:m-0 tw:max-md:mt-0">Temas</legend>
                        <p>Selecione os temas sobre os quais quer receber alertas diários.</p>
                        <div className="alerts-email-modal__topics tw:[&_label]:cursor-pointer tw:[&_input]:cursor-pointer tw:min-[821px]:pt-6.5 tw:max-md:gap-4 tw:max-md:pt-4 tw:gap-[12px_24px] tw:pt-4 tw:[&_input:checked+span]:bg-lime tw:[&_input:checked+span]:text-ink tw:[&_input:checked+span]:py-1 tw:[&_input:checked+span]:px-1.5 tw:min-[821px]:[&_input:checked+span]:text-ink tw:min-[821px]:[&_input:checked+span]:font-semibold tw:flex tw:*:min-w-0 tw:max-md:flex-col tw:flex-wrap tw:*:flex-none tw:*:w-[calc(50%-12px)] tw:max-md:*:w-full">
                            {categories.map((category) => (
                                <label
                                    key={category.value}
                                    className="tw:flex tw:items-center tw:gap-2.5 tw:text-muted tw:font-normal tw:text-base tw:leading-6 tw:font-sans tw:max-md:min-h-8 tw:max-md:text-ink"
                                >
                                    <input
                                        className="tw:min-[821px]:w-4.5 tw:min-[821px]:h-4.5 tw:min-[821px]:basis-4.5 tw:max-md:w-4.5 tw:max-md:h-4.5 tw:max-md:border-ink tw:max-md:basis-4.5"
                                        type="checkbox"
                                        name="tema"
                                        value={category.value}
                                        checked={topics.includes(category.value)}
                                        onChange={(event) =>
                                            setTopics(
                                                event.target.checked
                                                    ? [...topics, category.value]
                                                    : topics.filter((value) => value !== category.value),
                                            )
                                        }
                                    />
                                    <span>{category.label}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <section
                        className="alerts-email-modal__daily-options tw:relative tw:z-2 tw:w-156 tw:mt-4 tw:border tw:border-solid tw:border-[rgba(30,37,70,.12)] tw:bg-ink tw:text-white tw:p-5.5 tw:[&_h3]:m-0 tw:[&_p]:m-0 tw:max-md:w-full tw:max-md:h-auto tw:max-md:mt-4 tw:max-md:py-5.5 tw:max-md:px-4 tw:[&_legend]:text-navy tw:[&_legend]:font-display tw:[&_legend]:text-xl tw:[&_legend]:font-bold tw:[&_legend]:[font-variation-settings:'wdth'_75] tw:[&_legend]:leading-6 tw:[&_legend]:uppercase tw:[&_legend]:p-0 tw:[&_label]:flex tw:[&_label]:items-center tw:[&_label]:gap-2.5 tw:[&_label]:text-muted tw:[&_label]:font-normal tw:[&_label]:text-base tw:[&_label]:leading-6 tw:[&_label]:font-sans tw:[&_fieldset_label]:flex tw:[&_fieldset_label]:items-center tw:[&_fieldset_label]:gap-2.5 tw:[&_fieldset_label]:text-muted tw:[&_fieldset_label]:font-normal tw:[&_fieldset_label]:text-base tw:[&_fieldset_label]:leading-6 tw:[&_fieldset_label]:font-sans"
                        hidden={frequency !== "diario"}
                        aria-label="Filtros para alertas diários"
                    >
                        <p className="alerts-email-modal__daily-intro tw:flex tw:w-full tw:min-h-11.5 tw:items-center tw:bg-[#2b65d9] tw:text-white tw:font-normal tw:text-xs tw:leading-4 tw:font-sans tw:py-4 tw:px-4.5 tw:max-md:w-full tw:max-md:h-auto">
                            Você pode filtrar os alertas diários por casa e por proposição. Se não escolher
                            uma proposição, receberá alertas dos temas selecionados na casa escolhida.
                        </p>
                        <AlertsProposalCombobox />
                    </section>

                    <label
                        className="alerts-email-modal__terms tw:cursor-pointer tw:[&_input]:cursor-pointer tw:flex tw:items-center tw:gap-2.5 tw:text-muted tw:font-normal tw:font-sans tw:pt-7 tw:text-sm tw:leading-5 tw:[&_a]:text-navy tw:[&_a]:font-bold tw:min-[821px]:pt-9 tw:max-md:pt-5 tw:max-md:gap-3 tw:max-md:leading-6 tw:in-[.alerts-email-modal--daily-open]:pt-7 tw:min-[821px]:in-[.alerts-email-modal--daily-open]:pt-9 tw:max-md:in-[.alerts-email-modal--daily-open]:pt-5 tw:max-md:in-[.alerts-email-modal--daily-open]:gap-3 tw:max-md:in-[.alerts-email-modal--daily-open]:leading-6"
                        hidden={frequency !== "diario"}
                    >
                        <input
                            type="checkbox"
                            name="termos"
                            checked={terms}
                            onChange={(event) => setTerms(event.target.checked)}
                        />
                        <span>
                            Li e aceito os <a href="/termos-de-uso">Termos de Uso</a> e a{" "}
                            <a href="/politica-de-privacidade">Política de Privacidade</a> do Elas no
                            Congresso.
                        </span>
                    </label>
                    <button
                        className="alerts-email-modal__submit tw:enabled:hover:bg-ink tw:enabled:focus-visible:bg-ink tw:focus-visible:outline-2 tw:focus-visible:outline-ink tw:focus-visible:outline-offset-2 tw:transition-colors tw:duration-150 tw:motion-reduce:transition-none tw:flex tw:h-14 tw:items-center tw:justify-center tw:gap-2 tw:border-0 tw:rounded-none tw:bg-accent tw:text-white tw:font-display tw:text-lg tw:font-bold tw:[font-variation-settings:'wdth'_75] tw:leading-6 tw:uppercase tw:cursor-pointer tw:pt-4.5 tw:pb-3.5 tw:pr-5 tw:pl-6 tw:mt-8 tw:mb-0 tw:mr-0 tw:ml-auto tw:disabled:bg-[#c3c5ff] tw:disabled:cursor-default tw:min-[821px]:disabled:opacity-30 tw:min-[821px]:disabled:bg-accent tw:max-md:w-51.5 tw:max-md:mt-11 tw:max-md:bg-accent tw:max-md:text-xl tw:max-md:pt-4.5 tw:max-md:pb-3.5 tw:max-md:px-6 tw:max-md:disabled:w-51.5 tw:max-md:disabled:mt-11 tw:max-md:disabled:bg-accent tw:max-md:disabled:text-xl tw:max-md:disabled:pt-4.5 tw:max-md:disabled:pb-3.5 tw:max-md:disabled:px-6 tw:max-md:[&_img]:hidden tw:min-[821px]:mt-11 tw:min-[821px]:whitespace-nowrap tw:not-disabled:pr-6 tw:[&:not(:disabled)_img]:hidden"
                        type="submit"
                        disabled={!canSubmit}
                        hidden={frequency !== "diario"}
                    >
                        Quero me inscrever{" "}
                        <Image
                            className="tw:w-3.5 tw:h-2.5 tw:transform-[rotate(-90deg)] tw:filter-[brightness(0)_invert(1)]"
                            src={chevron}
                            alt=""
                        />
                    </button>
                </form>
                <p
                    className="alerts-email-modal__status tw:in-[.alerts-email-modal--success]:mt-0 tw:in-[.alerts-email-modal]:w-full tw:in-[.alerts-email-modal]:mt-6 tw:in-[.alerts-email-modal]:bg-[#f4f2f4] tw:in-[.alerts-email-modal]:text-navy tw:in-[.alerts-email-modal]:font-normal tw:in-[.alerts-email-modal]:text-[16px] tw:in-[.alerts-email-modal]:leading-5.5 tw:in-[.alerts-email-modal]:font-sans tw:in-[.alerts-email-modal]:py-3 tw:in-[.alerts-email-modal]:px-4 tw:data-[kind='ok']:bg-lime tw:data-[kind='ok']:text-ink tw:data-[kind='erro']:bg-[#ffe3e3] tw:data-[kind='erro']:text-[#8a1f1f]"
                    data-alerts-status
                    data-kind={success ? "ok" : status && !submitting ? "erro" : ""}
                    role="status"
                    aria-live="polite"
                    hidden={!status}
                >
                    {status}
                </p>
            </div>
        </AlertsEmailDialog>
    );
}
