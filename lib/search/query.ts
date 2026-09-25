import type { PostMeta } from "@/lib/content/posts";

export type SearchResult = PostMeta & { score: number };

const WEIGHTS = {
  title: 10,
  tag: 5,
  excerpt: 3,
  body: 1,
} as const;

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const lower = haystack.toLowerCase();
  let count = 0;
  let idx = lower.indexOf(needle);
  while (idx !== -1) {
    count++;
    idx = lower.indexOf(needle, idx + needle.length);
  }
  return count;
}

export function searchPosts(
  posts: (PostMeta & { content?: string })[],
  query: string
): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const scored = posts.map((post) => {
    const title = post.title.toLowerCase();
    const excerpt = post.excerpt.toLowerCase();
    const tags = post.tags.map((t) => t.toLowerCase());
    const body = (post.content ?? "").toLowerCase();

    let score = 0;

    for (const token of tokens) {
      score += countOccurrences(title, token) * WEIGHTS.title;
      score += tags.filter((t) => t.includes(token)).length * WEIGHTS.tag;
      score += countOccurrences(excerpt, token) * WEIGHTS.excerpt;
      score += countOccurrences(body, token) * WEIGHTS.body;
    }

    return { ...post, score };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}