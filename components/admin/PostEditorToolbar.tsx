"use client";

import type { MouseEvent, RefObject } from "react";
import { useCallback, useState } from "react";
import ImageInsertDialog from "@/components/admin/ImageInsertDialog";

type PostEditorToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
};

type Sel = { start: number; end: number };
type Result = { text: string; sel: Sel };

// ---------- Pure transforms ----------

function wrapInline(text: string, sel: Sel, marker: string): Result {
  const { start, end } = sel;
  const selected = text.slice(start, end);

  if (selected.length === 0) {
    const insert = marker + marker;
    const next = text.slice(0, start) + insert + text.slice(end);
    const caret = start + marker.length;
    return { text: next, sel: { start: caret, end: caret } };
  }

  const next = text.slice(0, start) + marker + selected + marker + text.slice(end);
  return {
    text: next,
    sel: { start: start + marker.length, end: end + marker.length },
  };
}

function lineBounds(text: string, sel: Sel): { lineStart: number; lineEnd: number } {
  const lineStart = text.lastIndexOf("\n", sel.start - 1) + 1;
  const endForSearch =
    sel.end > sel.start && text[sel.end - 1] === "\n" ? sel.end - 1 : sel.end;
  const nextNewline = text.indexOf("\n", endForSearch);
  const lineEnd = nextNewline === -1 ? text.length : nextNewline;
  return { lineStart, lineEnd };
}

function prefixLines(
  text: string,
  sel: Sel,
  prefix: string,
  skipIf?: (line: string) => boolean
): Result {
  const { lineStart, lineEnd } = lineBounds(text, sel);
  const block = text.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  const transformed = lines.map((line) => {
    if (skipIf && skipIf(line)) return line;
    return prefix + line;
  });
  const newBlock = transformed.join("\n");
  const next = text.slice(0, lineStart) + newBlock + text.slice(lineEnd);
  const delta = newBlock.length - block.length;
  return {
    text: next,
    sel: { start: lineStart, end: lineEnd + delta },
  };
}

function numberLines(text: string, sel: Sel): Result {
  const { lineStart, lineEnd } = lineBounds(text, sel);
  const block = text.slice(lineStart, lineEnd);
  const lines = block.split("\n");
  let n = 1;
  const transformed = lines.map((line) => {
    if (/^\d+\.\s/.test(line)) {
      n += 1;
      return line;
    }
    const out = `${n}. ${line}`;
    n += 1;
    return out;
  });
  const newBlock = transformed.join("\n");
  const next = text.slice(0, lineStart) + newBlock + text.slice(lineEnd);
  const delta = newBlock.length - block.length;
  return {
    text: next,
    sel: { start: lineStart, end: lineEnd + delta },
  };
}

function insertLink(text: string, sel: Sel): Result {
  const { start, end } = sel;
  const selected = text.slice(start, end);
  const url = "https://";

  if (selected.length === 0) {
    const insert = `[link text](${url})`;
    const next = text.slice(0, start) + insert + text.slice(end);
    const urlStart = start + "[link text](".length;
    return { text: next, sel: { start: urlStart, end: urlStart + url.length } };
  }

  const insert = `[${selected}](${url})`;
  const next = text.slice(0, start) + insert + text.slice(end);
  const urlStart = start + 1 + selected.length + 2;
  return { text: next, sel: { start: urlStart, end: urlStart + url.length } };
}

function insertCodeBlock(text: string, sel: Sel): Result {
  const { start, end } = sel;
  const selected = text.slice(start, end);

  if (selected.length === 0) {
    const insert = "```\n\n```";
    const next = text.slice(0, start) + insert + text.slice(end);
    const caret = start + 4;
    return { text: next, sel: { start: caret, end: caret } };
  }

  const before = text.slice(0, start);
  const after = text.slice(end);
  const lead = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
  const trail = after.length > 0 && !after.startsWith("\n") ? "\n" : "";
  const block = `${lead}\`\`\`\n${selected}\n\`\`\`${trail}`;
  const next = before + block + after;
  return {
    text: next,
    sel: {
      start: start + lead.length + 4,
      end: start + lead.length + 4 + selected.length,
    },
  };
}

function insertHorizontalRule(text: string, sel: Sel): Result {
  const { start, end } = sel;
  const before = text.slice(0, start);
  const after = text.slice(end);
  const lead = before.length > 0 && !before.endsWith("\n") ? "\n\n" : "";
  const trail = after.length > 0 && !after.startsWith("\n") ? "\n\n" : "\n";
  const insert = `${lead}---${trail}`;
  const next = before + insert + after;
  const caret = start + lead.length + 3;
  return { text: next, sel: { start: caret, end: caret } };
}

function insertImageAtCursor(
  text: string,
  sel: Sel,
  url: string,
  alt: string
): Result {
  // Escape markdown-sensitive characters in alt text only; the URL is
  // generated server-side (R2 key) and is markdown-safe.
  const safeAlt = alt.replace(/[[\]]/g, "\\$&");
  const markdown = `![${safeAlt}](${url})`;

  const before = text.slice(0, sel.start);
  const after = text.slice(sel.end);

  // Ensure the image sits on its own paragraph without duplicating blank lines.
  let lead = "";
  if (before.length > 0 && !before.endsWith("\n\n")) {
    lead = before.endsWith("\n") ? "\n" : "\n\n";
  }
  const trail = after.length > 0 && !after.startsWith("\n") ? "\n\n" : "";

  const insert = lead + markdown + trail;
  const next = before + insert + after;
  const caret = sel.start + lead.length + markdown.length;
  return { text: next, sel: { start: caret, end: caret } };
}

// ---------- Component ----------

export default function PostEditorToolbar({
  textareaRef,
  value,
  onChange,
}: PostEditorToolbarProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const [imageSel, setImageSel] = useState<Sel | null>(null);

  const apply = useCallback(
    (fn: (t: string, s: Sel) => Result) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const sel: Sel = { start: ta.selectionStart, end: ta.selectionEnd };
      const result = fn(value, sel);
      onChange(result.text);
      setTimeout(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        el.setSelectionRange(result.sel.start, result.sel.end);
      }, 0);
    },
    [textareaRef, value, onChange]
  );

  // Capture the cursor position *before* the modal opens. Once the modal
  // takes focus, the textarea's selection may be reset by the browser.
  function openImageDialog() {
    const ta = textareaRef.current;
    if (!ta) return;
    setImageSel({ start: ta.selectionStart, end: ta.selectionEnd });
    setImageOpen(true);
  }

  function handleInsertImage(url: string, alt: string) {
    const sel = imageSel ?? { start: value.length, end: value.length };
    const result = insertImageAtCursor(value, sel, url, alt);
    onChange(result.text);
    setTimeout(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(result.sel.start, result.sel.end);
    }, 0);
    setImageOpen(false);
    setImageSel(null);
  }

  function closeImageDialog() {
    setImageOpen(false);
    setImageSel(null);
  }

  const keepFocus = (e: MouseEvent<HTMLButtonElement>) => e.preventDefault();

  return (
    <>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-border bg-muted/5 px-2 py-1.5">
        <Btn label="B" bold title="Bold" onClick={() => apply((t, s) => wrapInline(t, s, "**"))} onMouseDown={keepFocus} />
        <Btn label="I" italic title="Italic" onClick={() => apply((t, s) => wrapInline(t, s, "*"))} onMouseDown={keepFocus} />

        <Div />

        <Btn label="H1" title="Heading 1" onClick={() => apply((t, s) => prefixLines(t, s, "# "))} onMouseDown={keepFocus} />
        <Btn label="H2" title="Heading 2" onClick={() => apply((t, s) => prefixLines(t, s, "## "))} onMouseDown={keepFocus} />
        <Btn label="H3" title="Heading 3" onClick={() => apply((t, s) => prefixLines(t, s, "### "))} onMouseDown={keepFocus} />

        <Div />

        <Btn label="Link" title="Insert link" onClick={() => apply(insertLink)} onMouseDown={keepFocus} />
        <Btn label="Quote" title="Blockquote" onClick={() => apply((t, s) => prefixLines(t, s, "> ", (l) => l.startsWith("> ")))} onMouseDown={keepFocus} />

        <Div />

        <Btn label="Image" title="Insert image" onClick={openImageDialog} onMouseDown={keepFocus} />

        <Div />

        <Btn label="`x`" title="Inline code" onClick={() => apply((t, s) => wrapInline(t, s, "`"))} onMouseDown={keepFocus} />
        <Btn label="</>" title="Code block" onClick={() => apply(insertCodeBlock)} onMouseDown={keepFocus} />

        <Div />

        <Btn label="•" title="Bulleted list" onClick={() => apply((t, s) => prefixLines(t, s, "- ", (l) => /^-\s/.test(l)))} onMouseDown={keepFocus} />
        <Btn label="1." title="Numbered list" onClick={() => apply(numberLines)} onMouseDown={keepFocus} />

        <Div />

        <Btn label="—" title="Horizontal rule" onClick={() => apply(insertHorizontalRule)} onMouseDown={keepFocus} />
      </div>

      <ImageInsertDialog
        open={imageOpen}
        onInsert={handleInsertImage}
        onCancel={closeImageDialog}
      />
    </>
  );
}

// ---------- Tiny helpers ----------

function Btn({
  label,
  title,
  onClick,
  onMouseDown,
  bold,
  italic,
}: {
  label: string;
  title: string;
  onClick: () => void;
  onMouseDown: (e: MouseEvent<HTMLButtonElement>) => void;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      onMouseDown={onMouseDown}
      className={[
        "min-w-[28px] rounded px-2 py-1 text-xs text-muted transition-colors",
        "hover:bg-background hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/40",
        bold ? "font-bold" : "font-medium",
        italic ? "italic" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function Div() {
  return <span aria-hidden className="mx-1 h-4 w-px bg-border" />;
}