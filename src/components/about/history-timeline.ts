import MarkdownIt from "markdown-it";
import markdownItContainer from "markdown-it-container";

const markdown = new MarkdownIt({
    html: false,
    linkify: false,
    typographer: false,
});

for (const container of ["timeline", "milestones", "milestone"]) {
    markdown.use(markdownItContainer, container, {
        validate: (params) => params.trim() === container,
    });
}

interface TimelineMilestone {
    prefix: string;
    year: string;
    description: string;
    tag: string;
}

interface Timeline {
    milestones: TimelineMilestone[];
    footer: string;
}

export function parseTimeline(source: string): Timeline {
    const tokens = markdown.parse(source, {});
    const milestones: TimelineMilestone[] = [];
    let milestoneParts: string[] | null = null;
    let inFooter = false;
    let footer = "";

    for (const token of tokens) {
        if (token.type === "container_milestone_open") {
            milestoneParts = [];
        } else if (token.type === "container_milestone_close") {
            if (milestoneParts?.length !== 4) {
                throw new Error("Each timeline milestone must contain a prefix, year, description, and tag");
            }
            const [prefix, year, description, tag] = milestoneParts;
            milestones.push({ prefix, year, description, tag });
            milestoneParts = null;
        } else if (token.type === "blockquote_open") {
            inFooter = true;
        } else if (token.type === "blockquote_close") {
            inFooter = false;
        } else if (token.type === "inline") {
            const html = markdown.renderInline(token.content);
            if (milestoneParts) milestoneParts.push(html);
            else if (inFooter) footer = html;
        }
    }

    return { milestones, footer };
}
