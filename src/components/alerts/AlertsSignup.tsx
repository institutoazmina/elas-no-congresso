import { Dialog } from "@base-ui/react/dialog";
import { Image } from "../shared/react-utils";
import chevron from "../../assets/images/home-news/chevron-right.svg";
import type { CategoryOption } from "../../service/api/alerts";
import AlertsSignupForm from "./AlertsSignupForm";

// The hero button and the signup dialog it opens. The dialog is portaled to
// <body> and covers the page below the sticky header; it stays mounted so the
// form keeps its state (and an in-flight request) when closed.
export default function AlertsSignup({ categories }: { categories: CategoryOption[] }) {
    return (
        <Dialog.Root disablePointerDismissal>
            <Dialog.Trigger className="tw:flex tw:h-11.5 tw:w-max tw:max-w-full tw:flex-none tw:cursor-pointer tw:items-center tw:justify-center tw:gap-2 tw:border-0 tw:bg-accent tw:px-3 tw:font-display tw:text-base tw:leading-6 tw:font-bold tw:whitespace-nowrap tw:text-white tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:transition-colors tw:duration-150 tw:hover:bg-ink tw:focus-visible:bg-ink tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-ink tw:motion-reduce:transition-none tw:md:h-14 tw:md:w-70.5 tw:md:px-6 tw:md:pt-4.5 tw:md:pb-3.5 tw:md:text-xl">
                Receber alertas por e-mail
                <Image className="tw:h-2.5 tw:w-3.5 tw:-rotate-90" src={chevron} alt="" />
            </Dialog.Trigger>
            <Dialog.Portal keepMounted>
                <Dialog.Popup
                    className="tw:fixed tw:inset-0 tw:z-99 tw:overflow-y-auto tw:bg-white tw:pt-13 tw:md:pt-26"
                    aria-labelledby="alerts-email-modal-title"
                    aria-describedby="alerts-email-modal-description"
                >
                    <div className="tw:flex tw:h-19 tw:justify-end tw:py-6.5 tw:pr-5 tw:pl-4 tw:md:mx-auto tw:md:h-23 tw:md:w-156 tw:md:max-w-[calc(100%-48px)] tw:md:px-0 tw:md:pt-12.5 tw:md:pb-0">
                        <Dialog.Close
                            className="tw:flex tw:size-5 tw:cursor-pointer tw:items-center tw:justify-center tw:border-2 tw:border-navy tw:bg-white tw:p-0 tw:pb-0.5 tw:font-[Arial,sans-serif] tw:text-[18px] tw:leading-none tw:text-navy tw:md:size-10.5 tw:md:border-4 tw:md:pb-1 tw:md:text-[38px]"
                            aria-label="Fechar alertas por e-mail"
                        >
                            ×
                        </Dialog.Close>
                    </div>
                    <AlertsSignupForm categories={categories} />
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
