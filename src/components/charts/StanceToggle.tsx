import { Image } from "../shared/react-utils";
import StanceSelect from "./StanceSelect";
import thumbsDown from "../../assets/images/thumbs-down.svg";
import thumbsUp from "../../assets/images/thumbs-up.svg";
import chevron from "../../assets/images/party-chart/chevron.svg";
import type { Stance } from "../../service/api/stats";

interface Props {
    /** texto exibido em cada estado, ex.: `{ unfavorable: "Atacado", favorable: "Defendido" }` */
    labels: Record<Stance, string>;
    value: Stance;
    onChange: (stance: Stance) => void;
}

export default function StanceToggle({ labels, value, onChange }: Props) {
    return (
        <StanceSelect
            labels={labels}
            value={value}
            onChange={onChange}
            thumbsDown={
                <Image
                    src={thumbsDown}
                    alt=""
                    width={32}
                    height={32}
                    className="stance-toggle__thumb tw:block tw:w-8 tw:h-8 tw:flex-none tw:rounded-[1000px]"
                />
            }
            thumbsUp={
                <Image
                    src={thumbsUp}
                    alt=""
                    width={32}
                    height={32}
                    className="stance-toggle__thumb tw:block tw:w-8 tw:h-8 tw:flex-none tw:rounded-[1000px]"
                />
            }
            chevron={
                <Image
                    src={chevron}
                    alt=""
                    width={16}
                    height={8}
                    className="stance-toggle__chevron tw:block tw:w-4 tw:h-2 tw:[transition:transform_160ms_ease] tw:[.stance-toggle[data-popup-open]_&]:transform-[rotate(180deg)]"
                />
            }
        />
    );
}
