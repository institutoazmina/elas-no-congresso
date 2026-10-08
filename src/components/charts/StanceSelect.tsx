import { Select } from "@base-ui/react/select";
import { useEffect, useRef, useState } from "react";
import type { Stance } from "../../service/api/stats";

interface Props {
    labels: Record<Stance, string>;
    thumbsDownSrc: string;
    thumbsUpSrc: string;
    chevronSrc: string;
}

const stances: Stance[] = ["unfavorable", "favorable"];

export default function StanceSelect({ labels, thumbsDownSrc, thumbsUpSrc, chevronSrc }: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState<Stance>("unfavorable");

    useEffect(() => {
        const scope = rootRef.current?.closest<HTMLElement>("[data-stance]");
        const initialValue = scope?.dataset.stance;
        if (initialValue === "favorable" || initialValue === "unfavorable") {
            setValue(initialValue);
        }
    }, []);

    const updateValue = (nextValue: Stance | null) => {
        if (!nextValue) return;
        setValue(nextValue);
        const scope = rootRef.current?.closest<HTMLElement>("[data-stance]");
        if (scope) scope.dataset.stance = nextValue;
    };

    const iconFor = (stance: Stance) => stance === "unfavorable" ? thumbsDownSrc : thumbsUpSrc;

    return (
        <div ref={rootRef} className="stance-select-root tw:contents">
            <Select.Root value={value} onValueChange={updateValue}>
                <Select.Trigger className="stance-toggle tw:flex tw:w-max tw:h-14 tw:items-center tw:justify-start tw:gap-2 tw:border-2 tw:border-solid tw:border-accent tw:rounded-none tw:bg-white tw:text-accent tw:font-display tw:text-(length:--stance-toggle-font-size,28px) tw:font-bold tw:leading-8 tw:text-left tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:cursor-pointer tw:py-3 tw:px-4 tw:focus-visible:outline-2 tw:focus-visible:outline-ink tw:focus-visible:outline-offset-0.5" aria-label="Filtrar por avaliação">
                    <img className="stance-toggle__thumb tw:block tw:w-8 tw:h-8 tw:flex-none tw:rounded-[999px]" src={iconFor(value)} alt="" aria-hidden="true" />
                    <Select.Value className="stance-toggle__value tw:flex-none tw:whitespace-nowrap">
                        {labels[value]}
                    </Select.Value>
                    <Select.Icon className="stance-toggle__icon tw:flex-none tw:flex tw:items-center tw:justify-center">
                        <img className="stance-toggle__chevron tw:block tw:w-4 tw:h-2 tw:[transition:transform_160ms_ease] tw:[.stance-toggle[data-popup-open]_&]:transform-[rotate(180deg)]" src={chevronSrc} alt="" aria-hidden="true" />
                    </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                    <Select.Positioner className="stance-select__positioner tw:z-100 tw:outline-none" sideOffset={4} alignItemWithTrigger={false}>
                        <Select.Popup className="stance-select__popup tw:w-max tw:min-w-(--anchor-width) tw:border-2 tw:border-solid tw:border-accent tw:bg-white tw:text-accent tw:shadow-[-4px_4px_0_#0b0f5e] tw:origin-(--transform-origin) tw:[transition:opacity_120ms_ease,transform_120ms_ease] tw:data-starting-style:opacity-0 tw:data-starting-style:transform-[translateY(-4px)] tw:data-ending-style:opacity-0 tw:data-ending-style:transform-[translateY(-4px)]">
                            <Select.List className="stance-select__list tw:p-0">
                                {stances.map((stance) => (
                                    <Select.Item key={stance} value={stance} className="stance-select__item tw:min-h-14 tw:items-center tw:gap-2 tw:border-b tw:border-solid tw:border-b-[rgb(66_66_246/35%)] tw:bg-white tw:text-accent tw:font-display tw:text-xl tw:font-bold tw:leading-6 tw:uppercase tw:[font-variation-settings:'wdth'_75] tw:cursor-pointer tw:[user-select:none] tw:outline-none tw:py-2.5 tw:px-3.5 tw:last:[border-bottom:0] tw:data-highlighted:bg-[#eeeeff] tw:data-selected:bg-accent tw:data-selected:text-white tw:[&_>_img]:w-8 tw:[&_>_img]:h-8 tw:max-md:min-h-11 tw:max-md:text-base tw:max-md:leading-5 tw:max-md:py-2 tw:max-md:px-2.5 tw:max-md:[&_>_img]:w-5.25 tw:max-md:[&_>_img]:h-5.25 tw:flex">
                                        <img src={iconFor(stance)} alt="" aria-hidden="true" />
                                        <Select.ItemText className="stance-select__item-text tw:whitespace-nowrap">{labels[stance]}</Select.ItemText>
                                        <Select.ItemIndicator className="stance-select__indicator tw:[justify-self:end] tw:font-sans tw:text-base" aria-hidden="true">✓</Select.ItemIndicator>
                                    </Select.Item>
                                ))}
                            </Select.List>
                        </Select.Popup>
                    </Select.Positioner>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}

