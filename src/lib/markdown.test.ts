import assert from "node:assert/strict";
import test from "node:test";
import { renderMarkdown, splitMarkdownSections } from "./markdown.ts";

test("full-page Markdown renders the supported editorial elements", () => {
    const html = renderMarkdown(`## Título

Texto com **negrito**, ~~destaque~~, [link](https://example.com) e lista:

- item

| A | B |
| --- | --- |
| 1 | 2 |

![Imagem](/media/cms/imagem.webp)`);

    assert.match(html, /<h2>Título<\/h2>/);
    assert.match(html, /<strong>negrito<\/strong>/);
    assert.match(html, /<s>destaque<\/s>/);
    assert.match(html, /<table>/);
    assert.match(html, /src="\/media\/cms\/imagem.webp"/);
});

test("a struck x at the start of a list item becomes a cross marker", () => {
    const html = renderMarkdown("- ~~x~~ item bloqueado\n- item comum");

    assert.match(html, /<li class="markdown-list-item--cross">item bloqueado<\/li>/);
    assert.match(html, /<li>item comum<\/li>/);
    assert.doesNotMatch(html, /<s>x<\/s>/);
});

test("tables can opt out of striped rows", () => {
    const html = renderMarkdown(`::: table transparent

| Coluna | Valor |
| --- | --- |
| Item | 1 |

:::`);

    assert.match(html, /class="markdown-table markdown-table--transparent"/);
    assert.match(html, /<table>/);
});

test("trend markers render styled and accessible arrows", () => {
    const html = renderMarkdown("| Tendência |\n| --- |\n| :::up::: |\n| :::down::: |");

    assert.match(html, /class="markdown-trend markdown-trend--up" aria-label="Tendência de alta">↑<\/span>/);
    assert.match(html, /class="markdown-trend markdown-trend--down" aria-label="Tendência de baixa">↓<\/span>/);
    assert.doesNotMatch(html, /:::up:::|:::down:::/);
});

test("raw HTML and unsafe links are not rendered", () => {
    const html = renderMarkdown('<script>alert(1)</script> [x](javascript:alert(1))');

    assert.doesNotMatch(html, /<script>/);
    assert.doesNotMatch(html, /href="javascript:/);
    assert.match(html, /&lt;script&gt;/);
});

test("card groups render two or three columns with Markdown content", () => {
    const html = renderMarkdown(`:::: cards 2

::: card
#### Primeiro card

Texto com [link](https://example.com).
:::

::: card
#### Segundo card

**Destaque**
:::

::::`);

    assert.match(html, /class="markdown-card-grid markdown-card-grid--2"/);
    assert.equal(html.match(/<article class="markdown-card">/g)?.length, 2);
    assert.match(html, /<h4>Primeiro card<\/h4>/);
    assert.match(html, /href="https:\/\/example.com"/);
    assert.match(html, /<strong>Destaque<\/strong>/);

    const threeColumns = renderMarkdown(`:::: cards 3

::: card
Um
:::

::: card
Dois
:::

::: card
Três
:::

::::`);

    assert.match(threeColumns, /class="markdown-card-grid markdown-card-grid--3"/);
    assert.equal(threeColumns.match(/<article class="markdown-card">/g)?.length, 3);
});

test("card groups reject unsupported column counts", () => {
    const html = renderMarkdown(":::: cards 4\n\n::: card\nTexto\n:::\n\n::::");

    assert.doesNotMatch(html, /markdown-card-grid/);
});

test("horizontal dividers split page sections without splitting table separators", () => {
    assert.deepEqual(splitMarkdownSections("# Hero\n\n---\n\n## Seção\n\n| A |\n| --- |"), [
        "# Hero",
        "## Seção\n\n| A |\n| --- |",
    ]);
});
