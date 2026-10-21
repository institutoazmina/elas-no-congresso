export type InlineMarkdownPart = { text: string; bold: boolean };

/** Parses the only Markdown allowed in CMS headers: **bold text**. */
export function parseInlineMarkdown(value: string): InlineMarkdownPart[] {
    const parts: InlineMarkdownPart[] = [];
    const pattern = /\*\*(.+?)\*\*/g;
    let offset = 0;

    for (const match of value.matchAll(pattern)) {
        const index = match.index;
        if (index > offset) parts.push({ text: value.slice(offset, index), bold: false });
        parts.push({ text: match[1], bold: true });
        offset = index + match[0].length;
    }

    if (offset < value.length) parts.push({ text: value.slice(offset), bold: false });
    return parts;
}
