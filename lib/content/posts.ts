import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

// Lightweight author shape for list views (RecentGrid, PostCard, etc.).
// Full PostAuthor (with id + bio) is only fetched on the detail page.
export type PostAuthorLite = {
  name: string | null;
  username: string | null;
  image: string | null;
};

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
  views: number;
  likes: number;
  likedByMe: boolean;
  author: PostAuthorLite;
};

export type PostAuthor = PostAuthorLite & {
  id: string;
  bio: string | null;
};

// Omit + re-add: PostMeta carries the lite author; Post upgrades to the
// full author. Avoids a confusing PostMeta & PostAuthor intersection.
export type Post = Omit<PostMeta, "author"> & {
  content: string;
  author: PostAuthor;
};

// Shared select — keeps shape consistent across all queries.
// `satisfies` gives us the exact Prisma payload type without runtime cost.
//
// `likes: { select: { userId: true } }` fetches every like row for a post so
// we can compute both the count and `likedByMe` in a single query. Fine for
// blog-scale traffic; revisit with `_count` + a filtered select if a post
// ever accumulates thousands of likes.
const POST_SELECT = {
  slug: true,
  title: true,
  excerpt: true,
  content: true,
  date: true,
  pillar: true,
  coverImage: true,
  status: true,
  views: true,
  author: { select: { name: true, username: true, image: true } },
  tags: { select: { tag: { select: { name: true } } } },
  likes: { select: { userId: true } },
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

function toPostMeta(post: PostRow, currentUserId?: string): PostMeta {
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
    views: post.views,
    likes: post.likes.length,
    likedByMe: currentUserId
      ? post.likes.some((l) => l.userId === currentUserId)
      : false,
    author: {
      name: post.author.name,
      username: post.author.username,
      image: post.author.image,
    },
  };
}

export async function getAllPosts(
  currentUserId?: string
): Promise<PostMeta[]> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "desc" },
    select: POST_SELECT,
  });
  return posts.map((p) => toPostMeta(p, currentUserId));
}

export async function getPostBySlug(
  slug: string,
  currentUserId?: string
): Promise<Post | null> {
  const post = await prisma.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: POST_DETAIL_SELECT,
  });
  if (!post) return null;
  return {
    ...toPostMeta(post, currentUserId),
    content: post.content,
    author: post.author,
  };
}

export async function getAllPostSlugs(): Promise<string[]> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => p.slug);
}

export async function getPostsByPillar(
  pillar: string,
  currentUserId?: string
): Promise<PostMeta[]> {
  const posts = await prisma.post.findMany({
    where: { pillar, status: "PUBLISHED" },
    orderBy: { date: "desc" },
    select: POST_SELECT,
  });
  return posts.map((p) => toPostMeta(p, currentUserId));
}

export async function getPostsByTag(
  tag: string,
  currentUserId?: string
): Promise<PostMeta[]> {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      tags: { some: { tag: { name: tag } } },
    },
    orderBy: { date: "desc" },
    select: POST_SELECT,
  });
  return posts.map((p) => toPostMeta(p, currentUserId));
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

export async function getAllPostsWithContent(
  currentUserId?: string
): Promise<(PostMeta & { content: string })[]> {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "desc" },
    select: POST_SELECT,
  });
  return posts.map((p) => ({
    ...toPostMeta(p, currentUserId),
    content: p.content,
  }));
}