import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

export type PostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  pillar?: string;
  coverImage?: string | null;
  draft: boolean;
  readingTime: string;
};

export type PostAuthor = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  bio: string | null;
};

export type Post = PostMeta & { content: string; author: PostAuthor };
// Shared select â€” keeps shape consistent across all queries.
// `satisfies` gives us the exact Prisma payload type without runtime cost.
const POST_SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  date: true,
  pillar: true,
  coverImage: true,
  status: true,
  tags: { select: { tag: { select: { name: true } } } },
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof POST_SELECT }>;

const POST_DETAIL_SELECT = {
  ...POST_SELECT,
  author: {
    select: { id: true, name: true, username: true, image: true, bio: true },
  },
} satisfies Prisma.PostSelect;

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function toPostMeta(post: PostRow): PostMeta {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date.toISOString().slice(0, 10),
    tags: post.tags.map((pt) => pt.tag.name),
    pillar: post.pillar ?? undefined,
    coverImage: post.coverImage,
    draft: post.status === "DRAFT",
    readingTime: calcReadingTime(post.content),
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "desc" },
    select: POST_SELECT,
  });
  return posts.map(toPostMeta);
}
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: POST_DETAIL_SELECT,
  });
  if (!post) return null;
  return { ...toPostMeta(post), content: post.content, author: post.author };
}
export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => p.slug);
}

export async function getPostsByPillar(pillar: string): Promise<PostMeta[]> {
  const posts = await prisma.post.findMany({
    where: { pillar, status: "PUBLISHED" },
    orderBy: { date: "desc" },
    select: POST_SELECT,
  });
  return posts.map(toPostMeta);
}

export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      tags: { some: { tag: { name: tag } } },
    },
    orderBy: { date: "desc" },
    select: POST_SELECT,
  });
  return posts.map(toPostMeta);
}

export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const tags = await prisma.tag.findMany({
    select: {
      name: true,
      posts: { select: { post: { select: { status: true } } } },
    },
  });
  return tags
    .map((t) => ({
      tag: t.name,
      count: t.posts.filter((pt) => pt.post.status === "PUBLISHED").length,
    }))
    .filter((t) => t.count > 0)
    .sort((a, b) => a.tag.localeCompare(b.tag));
}
export async function getAllPostsWithContent(): Promise<(PostMeta & { content: string })[]> {  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "desc" },
    select: POST_SELECT,
  });
  return posts.map((p) => ({ ...toPostMeta(p), content: p.content }));
}
