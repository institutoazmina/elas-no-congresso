import { useState, type ReactNode } from "react";
import type { CategoryOption } from "../../service/api/alerts";
import AlertsHero from "./AlertsHero";
import AlertsEmailModal from "./AlertsEmailModal";

export default function AlertsExperience({
    categories,
    children,
}: {
    categories: CategoryOption[];
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <main className="site-alerts-main tw:bg-white" hidden={open}>
                <AlertsHero onOpen={() => setOpen(true)} />
                {children}
            </main>
            <AlertsEmailModal categories={categories} open={open} onOpenChange={setOpen} />
        </>
    );
}
