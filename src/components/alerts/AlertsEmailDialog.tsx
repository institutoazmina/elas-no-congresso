import { Dialog } from "@base-ui/react/dialog";
import { useEffect, useRef, useState, type ReactNode } from "react";

type AlertsEmailDialogProps = {
    children: ReactNode;
};

export default function AlertsEmailDialog({ children }: AlertsEmailDialogProps) {
    const [open, setOpen] = useState(false);
    const portalContainerRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const openDialog = () => {
            document.body.classList.add("alerts-email-modal-open");
            setOpen(true);
        };
        const opener = document.querySelector<HTMLButtonElement>(".alerts-hero__button");

        opener?.addEventListener("click", openDialog);
        document.addEventListener("alerts-email-dialog-open", openDialog);
        return () => {
            opener?.removeEventListener("click", openDialog);
            document.removeEventListener("alerts-email-dialog-open", openDialog);
        };
    }, []);

    useEffect(() => {
        if (!open) return;
        document.dispatchEvent(new Event("alerts-email-dialog-mounted"));
        viewportRef.current?.scrollIntoView({ block: "start" });
    }, [open]);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            document.body.classList.remove("alerts-email-modal-open");
            document.dispatchEvent(new Event("alerts-email-dialog-closed"));
        }
    };

    return (
        <>
            <div className="alerts-email-dialog-host tw:w-full tw:bg-white" ref={portalContainerRef} />
            <Dialog.Root open={open} onOpenChange={handleOpenChange} modal="trap-focus" disablePointerDismissal>
                <Dialog.Portal className="alerts-email-dialog-portal tw:w-full tw:bg-white" container={portalContainerRef}>
                    <Dialog.Viewport className="alerts-email-dialog-viewport tw:w-full tw:bg-white" ref={viewportRef}>
                        <Dialog.Popup
                            className="alerts-email-modal tw:max-md:[body.alerts-email-modal-open_&]:order-1 tw:relative tw:w-[min(672px,calc(100vw-48px))] tw:border-0 tw:bg-white tw:text-navy tw:p-0 tw:my-0 tw:mx-auto tw:**:[[hidden]]:hidden! tw:[&_h2]:text-navy tw:[&_h2]:font-display tw:[&_h2]:text-[33px] tw:[&_h2]:font-extrabold tw:[&_h2]:[font-variation-settings:'wdth'_75] tw:[&_h2]:leading-11.25 tw:[&_h2]:m-0 tw:[&_p]:m-0 tw:[&_fieldset_>_legend]:text-navy tw:[&_fieldset_>_legend]:font-display tw:[&_fieldset_>_legend]:text-xl tw:[&_fieldset_>_legend]:font-bold tw:[&_fieldset_>_legend]:[font-variation-settings:'wdth'_75] tw:[&_fieldset_>_legend]:leading-6 tw:[&_fieldset_>_legend]:uppercase tw:[&_fieldset_>_legend]:p-0 tw:[&_input]:accent-lime tw:[&_select]:accent-lime tw:[&_input[type='checkbox']]:relative tw:[&_input[type='checkbox']]:w-4 tw:[&_input[type='checkbox']]:h-4 tw:[&_input[type='checkbox']]:appearance-none tw:[&_input[type='checkbox']]:border tw:[&_input[type='checkbox']]:border-solid tw:[&_input[type='checkbox']]:border-muted tw:[&_input[type='checkbox']]:rounded-none tw:[&_input[type='checkbox']]:bg-white tw:[&_input[type='checkbox']]:flex-[0_0_16px] tw:[&_input[type='checkbox']]:m-0 tw:[&_input[type='checkbox']:checked]:border-2 tw:[&_input[type='checkbox']:checked]:border-solid tw:[&_input[type='checkbox']:checked]:border-ink tw:[&_input[type='checkbox']:checked]:bg-lime tw:[&_input[type='checkbox']:checked::after]:absolute tw:[&_input[type='checkbox']:checked::after]:top-0.5 tw:[&_input[type='checkbox']:checked::after]:left-0.5 tw:[&_input[type='checkbox']:checked::after]:w-2 tw:[&_input[type='checkbox']:checked::after]:h-1.25 tw:[&_input[type='checkbox']:checked::after]:border-b-2 tw:[&_input[type='checkbox']:checked::after]:border-solid tw:[&_input[type='checkbox']:checked::after]:border-b-ink tw:[&_input[type='checkbox']:checked::after]:border-l-2 tw:[&_input[type='checkbox']:checked::after]:border-l-ink tw:[&_input[type='checkbox']:checked::after]:content-[''] tw:[&_input[type='checkbox']:checked::after]:transform-[rotate(-45deg)] tw:min-[821px]:bg-white tw:min-[821px]:bg-none tw:min-[821px]:opacity-100 tw:min-[821px]:[&_h2]:text-navy tw:min-[821px]:[&_h2]:text-4xl tw:min-[821px]:[&_h2]:font-bold tw:min-[821px]:[&_h2]:leading-10.5 tw:min-[821px]:[&_h2]:text-center tw:min-[821px]:[&_h2]:uppercase tw:max-md:w-full tw:max-md:m-0 tw:max-md:[&_h2]:text-[28px] tw:max-md:[&_h2]:leading-8 tw:max-md:[&_h2]:wrap-normal tw:max-md:[&_h2]:uppercase"
                            data-state="initial"
                            aria-labelledby="alerts-email-modal-title"
                            aria-describedby="alerts-email-modal-description"
                        >
                            <div className="alerts-email-modal__shell tw:min-h-full tw:min-[821px]:bg-white tw:min-[821px]:bg-none tw:min-[821px]:opacity-100">
                                <div className="alerts-email-modal__close-row tw:flex tw:w-156 tw:max-w-[calc(100%-48px)] tw:h-23 tw:pt-12.5 tw:justify-end tw:my-0 tw:mx-auto tw:max-md:w-full tw:max-md:max-w-none tw:max-md:h-18.75 tw:max-md:py-6.25 tw:max-md:pr-5 tw:max-md:pl-3.75 tw:max-md:m-0">
                                    <Dialog.Close className="alerts-email-modal__close tw:w-10.5 tw:h-10.5 tw:border-[2.222px] tw:border-solid tw:border-navy tw:bg-white tw:text-navy tw:font-[Arial,sans-serif] tw:text-[37px] tw:font-normal tw:leading-none tw:cursor-pointer tw:pt-0 tw:pb-1 tw:px-0 tw:max-md:w-4.75 tw:max-md:h-4.75 tw:max-md:border-2 tw:max-md:text-[17px] tw:max-md:pt-0 tw:max-md:pb-0.5 tw:max-md:px-0 tw:flex tw:items-center tw:justify-center" aria-label="Fechar alertas por e-mail">
                                        ×
                                    </Dialog.Close>
                                </div>
                                {children}
                            </div>
                        </Dialog.Popup>
                    </Dialog.Viewport>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
