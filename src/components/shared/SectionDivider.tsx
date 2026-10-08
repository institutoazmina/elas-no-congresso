import { Image, cx } from "./react-utils";
import elasHorizontal from "../../assets/images/party-chart/elas-horizontal.svg";

interface Props {
    content: string;
    class?: string;
    href?: string;
}

export default function SectionDivider({ content, class: className, href, ...attributes }: Props) {
    return (
        <footer
            className={cx([
                "section-divider tw:mx-auto tw:[&_a]:text-inherit tw:[&_a]:underline tw:[&_a]:underline-offset-[4px] tw:[&_a:hover]:text-accent tw:[&_a:focus-visible]:outline-2 tw:[&_a:focus-visible]:outline-accent tw:[&_a:focus-visible]:outline-offset-1",
                className,
            ])}
            {...attributes}
        >
            {href ? <a href={href}>{content}</a> : <span>{content}</span>}
            <Image src={elasHorizontal} alt="Elas no Congresso" />
        </footer>
    );
}
