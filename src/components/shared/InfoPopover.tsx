import { Popover } from "@base-ui/react/popover";
import type { ReactNode } from "react";
import info from "../../assets/images/activity/info-tooltip.svg";

export default function InfoPopover({ label, children }: { label: string; children: ReactNode }) {
    return (
        <Popover.Root>
            <Popover.Trigger
                openOnHover
                delay={100}
                aria-label={label}
                className="tw:inline-flex tw:border-0 tw:bg-transparent tw:p-0 tw:align-middle tw:cursor-pointer"
            >
                <img src={info.src} width={16} height={16} alt="" />
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Positioner side="top" sideOffset={8} collisionPadding={8} className="tw:z-130">
                    <Popover.Popup className="tw:w-72 tw:max-w-[calc(100vw-16px)] tw:bg-ink tw:text-white tw:p-3 tw:text-sm tw:[&_p]:my-2">
                        <Popover.Title className="tw:sr-only">{label}</Popover.Title>
                        {children}
                    </Popover.Popup>
                </Popover.Positioner>
            </Popover.Portal>
        </Popover.Root>
    );
}
