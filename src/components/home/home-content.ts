import { splitMarkdownSections } from "../../lib/markdown.ts";

type HomeComponent =
    | "chart rights-under-attack"
    | "chart legislative-setbacks"
    | "reports"
    | "chart women-in-defense"
    | "chart party-rights"
    | "chart state-projects"
    | "alerts"
    | "proposals fast"
    | "proposals slow"
    | "proposals enacted"
    | "explore"
    | "parliamentarians"
    | "quiteria";

export type HomeSection = {
    component: HomeComponent;
    content: Record<string, string>;
};

const componentPattern = /^::: (chart [a-z-]+|reports|alerts|proposals (?:fast|slow|enacted)|explore|parliamentarians|quiteria) :::$/m;

const plain = (value: string) => value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .trim();

function required(value: string | undefined, label: string): string {
    if (!value?.trim()) throw new Error(`The Home Markdown requires ${label}`);
    return value.trim();
}

function container(source: string, name: string): string {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return source.match(new RegExp(`^::: ${escaped}\\s*\\n([\\s\\S]*?)\\n:::\\s*$`, "m"))?.[1].trim() ?? "";
}

function links(source: string): { text: string; url: string }[] {
    return [...source.matchAll(/\[([^\]]+)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)]
        .map((match) => ({ text: plain(match[1]), url: match[2] }))
        .filter(({ url }) => {
            if ((url.startsWith("/") && !url.startsWith("//")) || url.startsWith("#")) return true;
            try {
                return ["http:", "https:"].includes(new URL(url).protocol);
            } catch {
                return false;
            }
        });
}

function blocks(source: string): { title: string; paragraphs: string[] } {
    const title = required(source.match(/^##\s+(.+)$/m)?.[1], "a level-two heading");
    const body = source
        .replace(/^##\s+.+$/m, "")
        .replace(componentPattern, "")
        .replace(/^::: [a-z ]+\s*\n[\s\S]*?\n:::\s*$/gm, "")
        .trim();
    return {
        title,
        paragraphs: body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean),
    };
}

function parseSection(source: string): HomeSection {
    const component = required(source.match(componentPattern)?.[1], "a ::: component ::: marker") as HomeComponent;

    if (component === "quiteria") {
        const body = source
            .replace(componentPattern, "")
            .replace(/^::: [a-z ]+\s*\n[\s\S]*?\n:::\s*$/gm, "")
            .trim();
        const emphasis = [...body.matchAll(/\*\*(.*?)\*\*/g)];
        if (emphasis.length !== 2) throw new Error("The QuitérIA section requires two bold spans");
        const cta = required(links(container(source, "cta"))[0]?.text, "the QuitérIA CTA");
        const ctaUrl = required(links(container(source, "cta"))[0]?.url, "the QuitérIA CTA URL");
        return {
            component,
            content: {
                quiteria_before_name: body.slice(0, emphasis[0].index),
                quiteria_name: emphasis[0][1],
                quiteria_between: body.slice((emphasis[0].index ?? 0) + emphasis[0][0].length, emphasis[1].index),
                quiteria_ai: emphasis[1][1],
                quiteria_after: body.slice((emphasis[1].index ?? 0) + emphasis[1][0].length),
                quiteria_image_alt: required(container(source, "image alt"), "the QuitérIA image alt text"),
                quiteria_cta_text: cta,
                quiteria_cta_url: ctaUrl,
            },
        };
    }

    const { title, paragraphs } = blocks(source);

    if (component === "chart rights-under-attack") {
        const noteLinks = links(container(source, "note"));
        const captions = container(source, "caption").split(/\n{2,}/);
        return { component, content: {
            rights_title: plain(title),
            rights_text: plain(required(paragraphs[0], "the rights introduction")),
            rights_postit_text: required(noteLinks[0]?.text, "the rights note"),
            rights_postit_desktop_url: required(noteLinks[0]?.url, "the rights note URL"),
            rights_postit_cta: required(noteLinks[1]?.text, "the rights note CTA"),
            rights_postit_mobile_url: required(noteLinks[1]?.url, "the rights mobile note URL"),
            rights_caption: plain(required(captions[0], "the rights caption")),
            rights_footnote: plain(required(captions[1], "the rights footnote")),
        } };
    }

    if (component === "chart legislative-setbacks") {
        const caption = links(container(source, "caption"))[0];
        return { component, content: {
            setbacks_title: plain(title),
            setbacks_text: plain(required(paragraphs[0], "the setbacks introduction")),
            setbacks_caption: required(caption?.text, "the setbacks caption"),
            setbacks_caption_url: required(caption?.url, "the setbacks caption URL"),
        } };
    }

    if (component === "reports") return { component, content: {
        reports_title: plain(title),
        reports_subtitle: plain(required(paragraphs[0], "the reports introduction")),
    } };

    if (component === "chart women-in-defense") {
        const note = required(container(source, "note"), "the women note");
        const [before, after] = note.split("**{percentual}**");
        if (after === undefined) throw new Error("The women note requires **{percentual}**");
        return { component, content: {
            women_title: plain(title),
            women_text: plain(required(paragraphs[0], "the women introduction")),
            women_postit_before: plain(before),
            women_postit_after: plain(after),
            women_caption: plain(required(container(source, "caption"), "the women caption")),
            women_followup: plain(required(container(source, "followup"), "the women follow-up")),
        } };
    }

    if (component === "chart party-rights") {
        const [before, after] = title.split("{posição}");
        if (after === undefined) throw new Error("The party title requires {posição}");
        const caption = links(container(source, "caption"))[0];
        return { component, content: {
            party_title_before: plain(before),
            party_title_after: plain(after),
            party_subtitle: plain(required(paragraphs[0], "the party introduction")),
            party_caption: required(caption?.text, "the party caption"),
            party_caption_url: required(caption?.url, "the party caption URL"),
        } };
    }

    if (component === "chart state-projects") {
        const cta = links(container(source, "cta"))[0];
        return { component, content: {
            uf_title: plain(title),
            uf_subtitle: plain(required(paragraphs[0], "the state introduction")),
            uf_caption: plain(required(container(source, "caption"), "the state caption")),
            uf_cta_text: required(cta?.text, "the state CTA"),
            uf_cta_url: required(cta?.url, "the state CTA URL"),
        } };
    }

    if (component === "alerts") {
        const detail = required(paragraphs[1], "the alerts detail");
        const highlight = detail.match(/\*\*(.*?)\*\*/);
        if (!highlight) throw new Error("The alerts detail requires one bold span");
        const cta = links(container(source, "cta"))[0];
        return { component, content: {
            alerts_title: plain(title),
            alerts_intro: plain(required(paragraphs[0], "the alerts introduction")),
            alerts_detail_before: plain(detail.slice(0, highlight.index)),
            alerts_detail_highlight: highlight[1],
            alerts_detail_after: plain(detail.slice((highlight.index ?? 0) + highlight[0].length)),
            alerts_cta_text: required(cta?.text, "the alerts CTA"),
            alerts_cta_url: required(cta?.url, "the alerts CTA URL"),
        } };
    }

    const simple = {
        "proposals fast": ["fast_title", "fast_subtitle"],
        "proposals slow": ["slow_title", "slow_subtitle"],
        "proposals enacted": ["enacted_title", "enacted_subtitle"],
        parliamentarians: ["parliamentarians_title", "parliamentarians_subtitle"],
    } satisfies Partial<Record<HomeComponent, [string, string]>>;
    const keys = simple[component as keyof typeof simple];
    if (keys) return { component, content: {
        [keys[0]]: plain(title),
        [keys[1]]: plain(required(paragraphs[0], `the ${component} introduction`)),
    } };

    if (component === "explore") {
        const cta = links(container(source, "cta"))[0];
        return { component, content: {
            explore_title: plain(title),
            explore_subtitle: plain(required(paragraphs[0], "the Explore introduction")),
            explore_image_alt: plain(required(container(source, "image alt"), "the Explore image alt text")),
            explore_cta_text: required(cta?.text, "the Explore CTA"),
            explore_cta_url: required(cta?.url, "the Explore CTA URL"),
        } };
    }

    throw new Error(`Unsupported Home component: ${component}`);
}

export function parseHomeContent(source: string): HomeSection[] {
    return splitMarkdownSections(source.replace(/\r\n?/g, "\n")).map(parseSection);
}
