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
            <div className="alerts-email-dialog-host" ref={portalContainerRef} />
            <Dialog.Root open={open} onOpenChange={handleOpenChange} modal="trap-focus" disablePointerDismissal>
                <Dialog.Portal className="alerts-email-dialog-portal" container={portalContainerRef}>
                    <Dialog.Viewport className="alerts-email-dialog-viewport" ref={viewportRef}>
                        <Dialog.Popup
                            className="alerts-email-modal"
                            data-state="initial"
                            aria-labelledby="alerts-email-modal-title"
                            aria-describedby="alerts-email-modal-description"
                        >
                            <div className="alerts-email-modal__shell">
                                <div className="alerts-email-modal__close-row">
                                    <Dialog.Close className="alerts-email-modal__close" aria-label="Fechar alertas por e-mail">
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
