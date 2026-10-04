import { Tooltip } from "@base-ui/react/tooltip";

type SetbackInfoTooltipProps = {
    count: number;
    iconSrc: string;
    title: string;
};

export function SetbackInfoTooltip({ count, iconSrc, title }: SetbackInfoTooltipProps) {
    return (
        <Tooltip.Root>
            <Tooltip.Trigger className="setback-info-tooltip__trigger" aria-label={`Entenda os dados de ${title}`}>
                <img src={iconSrc} alt="" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Positioner side="top" sideOffset={8}>
                    <Tooltip.Popup className="setback-info-tooltip__popup">
                        <strong>{title}</strong>
                        <span>{count} proposições desfavoráveis nesta categoria.</span>
                    </Tooltip.Popup>
                </Tooltip.Positioner>
            </Tooltip.Portal>
        </Tooltip.Root>
    );
}
