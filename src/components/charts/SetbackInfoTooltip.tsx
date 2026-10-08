import { Tooltip } from "@base-ui/react/tooltip";

type SetbackInfoTooltipProps = {
    count: number;
    iconSrc: string;
    title: string;
};

export function SetbackInfoTooltip({ count, iconSrc, title }: SetbackInfoTooltipProps) {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger className="setback-info-tooltip__trigger tw:w-6 tw:h-6 tw:border-0 tw:bg-transparent tw:cursor-help tw:p-0 tw:focus-visible:outline-2 tw:focus-visible:outline-accent tw:focus-visible:outline-offset-1 tw:[&_img]:w-6 tw:[&_img]:h-6 tw:flex tw:items-center tw:justify-center" aria-label={`Entenda os dados de ${title}`}>
                <img src={iconSrc} alt="" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Positioner side="top" sideOffset={8}>
                    <Tooltip.Popup className="setback-info-tooltip__popup tw:flex tw:z-20 tw:max-w-55 tw:flex-col tw:gap-1 tw:bg-ink tw:text-white tw:[font:14px/18px_'Plus_Jakarta_Sans',sans-serif] tw:shadow-[2px_2px_0_#4242f6] tw:py-2.5 tw:px-3">
                        <strong>{title}</strong>
                        <span>{count} proposições desfavoráveis nesta categoria.</span>
                    </Tooltip.Popup>
                </Tooltip.Positioner>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}
