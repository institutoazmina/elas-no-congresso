import { Image } from "../../shared/react-utils";
import chevron from "../../../assets/images/home-news/chevron-right.svg";

// The chevron only shows on desktop while the button is disabled.
export default function SubmitButton({ disabled, hidden }: { disabled: boolean; hidden: boolean }) {
    return (
        <button
            className="tw:group tw:mt-11 tw:ml-auto tw:flex tw:h-14 tw:w-51.5 tw:cursor-pointer tw:items-center tw:justify-center tw:gap-2 tw:bg-accent tw:px-6 tw:pt-4.5 tw:pb-3.5 tw:font-display tw:text-xl tw:leading-6 tw:font-bold tw:text-white tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:transition-colors tw:duration-150 tw:enabled:hover:bg-ink tw:enabled:focus-visible:bg-ink tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-ink tw:disabled:cursor-default tw:motion-reduce:transition-none tw:md:w-auto tw:md:text-lg tw:md:whitespace-nowrap tw:md:disabled:pr-5 tw:md:disabled:opacity-30"
            type="submit"
            disabled={disabled}
            hidden={hidden}
        >
            Quero me inscrever
            <Image
                className="tw:hidden tw:h-2.5 tw:w-3.5 tw:-rotate-90 tw:brightness-0 tw:invert tw:md:group-disabled:block"
                src={chevron}
                alt=""
            />
        </button>
    );
}
