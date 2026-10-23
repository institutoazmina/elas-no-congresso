import assert from "node:assert/strict";
import test from "node:test";
import { parseInlineMarkdown } from "./inline-markdown.ts";

test("header Markdown parses only bold spans", () => {
    assert.deepEqual(parseInlineMarkdown("Quem foi **Maria Quitéria?**"), [
        { text: "Quem foi ", bold: false },
        { text: "Maria Quitéria?", bold: true },
    ]);
    assert.deepEqual(parseInlineMarkdown("**Elas** no **Congresso**"), [
        { text: "Elas", bold: true },
        { text: " no ", bold: false },
        { text: "Congresso", bold: true },
    ]);
    assert.deepEqual(parseInlineMarkdown("Texto com ** incompleto"), [
        { text: "Texto com ** incompleto", bold: false },
    ]);
});
