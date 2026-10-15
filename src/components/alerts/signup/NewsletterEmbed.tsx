// Substack signup for the weekly newsletter; the iframe only loads once requested.
export default function NewsletterEmbed({ hidden, load }: { hidden: boolean; load: boolean }) {
    return (
        <section
            className="tw:mt-6 tw:flex tw:w-full tw:flex-col tw:gap-4"
            hidden={hidden}
            aria-labelledby="alerts-newsletter-title"
        >
            <h3 id="alerts-newsletter-title" className="tw:font-display tw:text-xl tw:leading-7 tw:font-bold">
                Assine a newsletter do Elas no Congresso
            </h3>
            <iframe
                className="tw:block tw:h-80 tw:w-full tw:border tw:border-[#eee] tw:bg-white"
                src={load ? "https://elasnocongresso.substack.com/embed" : undefined}
                width="480"
                height="320"
                title="Assine a newsletter Elas no Congresso"
            ></iframe>
            <a
                className="tw:self-start tw:font-sans tw:text-sm tw:leading-5 tw:font-bold tw:text-ink tw:underline"
                href="https://elasnocongresso.substack.com/subscribe"
                target="_blank"
                rel="noopener noreferrer"
            >
                Abrir inscrição no Substack
            </a>
        </section>
    );
}
