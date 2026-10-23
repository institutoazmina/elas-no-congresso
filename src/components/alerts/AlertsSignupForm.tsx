import { useState, type SubmitEvent } from "react";
import type { CategoryOption } from "../../service/api/alerts";
import { useAlertsSignup } from "../../hooks/useAlertsSignup";
import DailyFilters from "./signup/DailyFilters";
import EmailField from "./signup/EmailField";
import FieldSection from "./signup/FieldSection";
import FrequencyOption from "./signup/FrequencyOption";
import NewsletterEmbed from "./signup/NewsletterEmbed";
import SignupIntro from "./signup/SignupIntro";
import SignupStatus from "./signup/SignupStatus";
import SubmitButton from "./signup/SubmitButton";
import TermsCheckbox from "./signup/TermsCheckbox";
import TopicOption from "./signup/TopicOption";

type Frequency = "semanal" | "diario";

export default function AlertsSignupForm({ categories }: { categories: CategoryOption[] }) {
    const [frequency, setFrequency] = useState<Frequency | null>(null);
    // The Substack iframe loads the first time "Semanal" is picked and then stays.
    const [newsletterRequested, setNewsletterRequested] = useState(false);
    const [email, setEmail] = useState({ value: "", valid: false });
    const [topics, setTopics] = useState<string[]>([]);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const { state, submit, reset } = useAlertsSignup();

    const sending = state.status === "sending";
    const sent = state.status === "sent";
    const daily = frequency === "diario";
    const canSubmit = daily && email.valid && topics.length > 0 && termsAccepted && !sending;

    function selectFrequency(next: Frequency) {
        setFrequency(next);
        if (next === "semanal") { setNewsletterRequested(true); }
        reset();
    }

    function toggleTopic(value: string, checked: boolean) {
        setTopics((current) => (checked ? [...current, value] : current.filter((topic) => topic !== value)));
    }

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canSubmit) { return; }
        // House and propositions live in the combobox's own inputs.
        const data = new FormData(event.currentTarget);
        void submit({
            email: email.value,
            acceptedTerms: true,
            categories: topics,
            house: String(data.get("house") ?? ""),
            propositions: data.getAll("propositions").map(Number),
        });
    }

    return (
        <div className="tw:w-full tw:text-navy tw:md:mx-auto tw:md:w-[min(672px,calc(100vw-48px))]">
            <div className={`tw:flex tw:flex-col tw:items-start tw:px-4 tw:md:px-6 tw:md:pt-20 ${sent ? "tw:pb-30" : "tw:md:pb-10"}`}>
                <SignupIntro hidden={sent} />
                <form
                    data-astro-reload
                    onSubmit={handleSubmit}
                    hidden={sent}
                    className="tw:flex tw:w-full tw:flex-col tw:items-start tw:pb-12 tw:md:w-156 tw:md:max-w-full tw:md:pt-10 tw:md:pb-4"
                >
                    <FieldSection
                        legend="Frequência"
                        hint={
                            <>
                                Escolha uma das opções.
                                <br />
                                Cada frequência tem regras diferentes — leia antes de selecionar.
                            </>
                        }
                        className="tw:relative"
                    >
                        <div className="tw:flex tw:flex-col tw:gap-5 tw:pt-6.5 tw:md:flex-row tw:md:gap-4">
                            <FrequencyOption
                                title="Semanal"
                                value="semanal"
                                checked={frequency === "semanal"}
                                disabled={sending}
                                onSelect={() => selectFrequency("semanal")}
                                className="tw:min-h-46 tw:md:min-h-37"
                            >
                                A newsletter do Elas no Congresso reúne, contextualiza e analisa os impactos
                                políticos das tramitações.
                            </FrequencyOption>
                            <FrequencyOption
                                title="Diário"
                                value="diario"
                                checked={daily}
                                disabled={sending}
                                onSelect={() => selectFrequency("diario")}
                                className="tw:h-36 tw:md:h-auto tw:md:min-h-37"
                            >
                                Alertas enviados assim que uma movimentação acontecer.
                            </FrequencyOption>
                        </div>
                        <NewsletterEmbed hidden={frequency !== "semanal"} load={newsletterRequested} />
                    </FieldSection>

                    <EmailField
                        value={email.value}
                        required={daily}
                        hidden={!daily}
                        onChange={(value, valid) => setEmail({ value, valid })}
                    />

                    <FieldSection
                        legend="Temas"
                        hint="Selecione os temas sobre os quais quer receber alertas diários."
                        hidden={!daily}
                        className="tw:mt-9"
                    >
                        <div className="tw:flex tw:flex-col tw:gap-4 tw:pt-4 tw:md:flex-row tw:md:flex-wrap tw:md:gap-x-6 tw:md:gap-y-3 tw:md:pt-6.5">
                            {categories.map((category) => (
                                <TopicOption
                                    key={category.value}
                                    value={category.value}
                                    label={category.label}
                                    checked={topics.includes(category.value)}
                                    onChange={(checked) => toggleTopic(category.value, checked)}
                                />
                            ))}
                        </div>
                    </FieldSection>

                    <DailyFilters hidden={!daily} />
                    <TermsCheckbox checked={termsAccepted} hidden={!daily} onChange={setTermsAccepted} />
                    <SubmitButton disabled={!canSubmit} hidden={!daily} />
                </form>
                <SignupStatus state={state} />
            </div>
        </div>
    );
}
