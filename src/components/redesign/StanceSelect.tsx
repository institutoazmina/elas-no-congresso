import { Select } from "@base-ui/react/select";
import { useEffect, useRef, useState } from "react";
import type { Stance } from "../../service/api/stats";
import "./StanceSelect.css";

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
        <div ref={rootRef} className="stance-select-root">
            <Select.Root value={value} onValueChange={updateValue}>
                <Select.Trigger className="stance-toggle" aria-label="Filtrar por avaliação">
                    <img className="stance-toggle__thumb" src={iconFor(value)} alt="" aria-hidden="true" />
                    <Select.Value className="stance-toggle__value">
                        {labels[value]}
                    </Select.Value>
                    <Select.Icon className="stance-toggle__icon">
                        <img className="stance-toggle__chevron" src={chevronSrc} alt="" aria-hidden="true" />
                    </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                    <Select.Positioner className="stance-select__positioner" sideOffset={4} alignItemWithTrigger={false}>
                        <Select.Popup className="stance-select__popup">
                            <Select.List className="stance-select__list">
                                {stances.map((stance) => (
                                    <Select.Item key={stance} value={stance} className="stance-select__item">
                                        <img src={iconFor(stance)} alt="" aria-hidden="true" />
                                        <Select.ItemText className="stance-select__item-text">{labels[stance]}</Select.ItemText>
                                        <Select.ItemIndicator className="stance-select__indicator" aria-hidden="true">✓</Select.ItemIndicator>
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
