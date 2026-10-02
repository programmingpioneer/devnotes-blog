import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { topics, type Topic } from "@/content/topics";
import {
  getAllPosts,
  getPostsByPillar as dbGetPostsByPillar,
  getPostsByTag as dbGetPostsByTag,
  type PostMeta,
} from "./posts";

const TOPICS_DIR = path.join(process.cwd(), "content", "topics");

export type TopicWithCount = Topic & { count: number };
export type TagWithCount = { tag: string; count: number };

// Re-export for consumers that historically imported these from ./topics
export type { PostMeta };
export { getAllTags } from "./posts";

export async function getTopicStats(): Promise<TopicWithCount[]> {
  const posts = await getAllPosts();
  return topics.map((topic) => ({
    ...topic,
    count: posts.filter((p) => p.pillar === topic.slug).length,
  }));
}

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}

export function getPostsByPillar(slug: string): Promise<PostMeta[]> {
  return dbGetPostsByPillar(slug);
}

export function getPostsByTag(tag: string): Promise<PostMeta[]> {
  return dbGetPostsByTag(tag);
}

export function getPillarContent(slug: string): string | null {
  const filePath = path.join(TOPICS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf8");
  return matter(raw).content;
}