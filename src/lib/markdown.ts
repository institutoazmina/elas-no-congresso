import MarkdownIt from "markdown-it";
import markdownItContainer from "markdown-it-container";
import type Token from "markdown-it/lib/token.mjs";

const markdown = new MarkdownIt({
    html: false,
    linkify: false,
    typographer: false,
});

markdown
    .use(markdownItContainer, "cards", {
        validate: (params) => /^cards\s+(2|3)$/.test(params.trim()),
        render: (tokens: Token[], index: number) => {
            if (tokens[index].nesting === -1) return "</div>\n";

            const columns = tokens[index].info.trim().split(/\s+/)[1];
            return `<div class="markdown-card-grid markdown-card-grid--${columns}">\n`;
        },
    })
    .use(markdownItContainer, "card", {
        validate: (params) => params.trim() === "card",
        render: (tokens: Token[], index: number) => tokens[index].nesting === 1
            ? '<article class="markdown-card">\n'
            : "</article>\n",
    })
    .use(markdownItContainer, "table", {
        validate: (params) => params.trim() === "table transparent",
        render: (tokens: Token[], index: number) => tokens[index].nesting === 1
            ? '<div class="markdown-table markdown-table--transparent">\n'
            : "</div>\n",
    });

markdown.inline.ruler.before("text", "trend-marker", (state, silent) => {
    const source = state.src.slice(state.pos);
    const direction = source.startsWith(":::up:::")
        ? "up"
        : source.startsWith(":::down:::")
          ? "down"
          : null;
    if (!direction) return false;

    if (!silent) {
        const token = state.push("trend_marker", "span", 0);
        token.content = direction;
    }
    state.pos += direction === "up" ? 8 : 10;
    return true;
});

markdown.renderer.rules.trend_marker = (tokens, index) => {
    const direction = tokens[index].content;
    const arrow = direction === "up" ? "↑" : "↓";
    const label = direction === "up" ? "Tendência de alta" : "Tendência de baixa";
    return `<span class="markdown-trend markdown-trend--${direction}" aria-label="${label}">${arrow}</span>`;
};

markdown.core.ruler.after("inline", "cross-list-markers", (state) => {
    for (let index = 0; index < state.tokens.length; index += 1) {
        const item = state.tokens[index];
        if (item.type !== "list_item_open") continue;

        for (let childIndex = index + 1; childIndex < state.tokens.length; childIndex += 1) {
            const token = state.tokens[childIndex];
            if (token.type === "list_item_close" && token.level === item.level) break;
            if (token.type !== "inline" || !token.children) continue;

            const [open, marker, close] = token.children;
            if (open?.type !== "s_open" || marker?.type !== "text"
                || marker.content.toLowerCase() !== "x" || close?.type !== "s_close") break;

            token.children.splice(0, 3);
            if (token.children[0]?.type === "text") {
                token.children[0].content = token.children[0].content.trimStart();
            }
            item.attrJoin("class", "markdown-list-item--cross");
            break;
        }
    }
});

const validateLink = markdown.validateLink.bind(markdown);
markdown.validateLink = (url) => {
    if (!validateLink(url)) return false;
    if (url.startsWith("/") || url.startsWith("#")) return true;

    try {
        return ["http:", "https:"].includes(new URL(url).protocol);
    } catch {
        return false;
    }
};

export function splitMarkdownSections(source: string): string[] {
    return source
        .split(/^\s*---\s*$/m)
        .map((section) => section.trim())
        .filter(Boolean);
}

export function renderMarkdown(source: string): string {
    return markdown.render(source);
}
