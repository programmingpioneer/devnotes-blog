import GithubSlugger from "github-slugger";

export type Heading = {
  id: string;
  text: string;
  level: number;
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(mdx: string): Heading[] {
  const regex = /^(##|###)\s+(.+)$/gm;
  const headings: Heading[] = [];
  // Use the same slugger as rehype-slug so TOC anchors match the rendered
  // heading IDs exactly. A custom slugify drifts on em dashes, unicode
  // punctuation, and repeated headings.
  const slugger = new GithubSlugger();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(mdx)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    const text = stripMarkdown(rawText);
    headings.push({
      id: slugger.slug(text),
      text,
      level,
    });
  }

  return headings;
}

// Strip inline markdown syntax so TOC displays clean text.
// Does NOT affect the slug (id) — the slug is computed from the raw text
// to stay in sync with rehype-slug on the rendered heading.
function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) → text
    .replace(/\*\*([^*]+)\*\*/g, "$1")       // **bold** → bold
    .replace(/__([^_]+)__/g, "$1")           // __bold__ → bold
    .replace(/\*([^*]+)\*/g, "$1")           // *italic* → italic
    .replace(/_([^_]+)_/g, "$1")             // _italic_ → italic
    .replace(/`([^`]+)`/g, "$1")             // `code` → code
    .trim();
}