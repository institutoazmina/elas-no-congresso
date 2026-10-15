export default function SignupIntro({ hidden }: { hidden: boolean }) {
    return (
        <header
            className="tw:w-full tw:pb-9 tw:md:mx-auto tw:md:flex tw:md:w-156 tw:md:max-w-full tw:md:flex-col tw:md:items-center tw:md:gap-4 tw:md:pb-0 tw:md:text-center"
            hidden={hidden}
        >
            <h2
                id="alerts-email-modal-title"
                className="tw:font-display tw:text-[28px] tw:leading-8 tw:font-extrabold tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:md:text-4xl tw:md:leading-10.5 tw:md:font-bold"
            >
                Receba alertas do que acontece no Congresso Nacional!
            </h2>
            <p
                id="alerts-email-modal-description"
                className="tw:pt-4 tw:font-sans tw:text-base tw:leading-6 tw:text-ink tw:md:pt-0 tw:md:text-muted"
            >
                <span>
                    Quer saber quando uma nova proposta sobre gênero é apresentada,
                    <br className="tw:max-md:hidden" />
                    ou quando algo de muita importância avança? A gente te avisa!
                </span>
                <br className="tw:max-md:hidden" />
                <span className="tw:block tw:pt-6 tw:md:inline tw:md:pt-0">
                    Escolha como e quando quer receber os e-mails.
                </span>
            </p>
        </header>
    );
}
