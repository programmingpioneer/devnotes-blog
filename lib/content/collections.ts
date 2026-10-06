import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/client";

// Minimal shape for the home sidebar card.
// Deliberately does NOT hydrate posts[] — the card only renders metadata.
// A future collection detail page should add its own function (e.g.
// getCollectionWithPosts) so this list query stays cheap.
export type FeaturedCollection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  featured: boolean;
  postCount: number;
};

// `satisfies` gives the exact Prisma payload type without runtime cost
// (mirrors POST_SELECT in lib/content/posts.ts).
const COLLECTION_SELECT = {
  id: true,
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  featured: true,
  _count: { select: { posts: true } },
} satisfies Prisma.CollectionSelect;

type CollectionRow = Prisma.CollectionGetPayload<{
  select: typeof COLLECTION_SELECT;
}>;

function toFeaturedCollection(c: CollectionRow): FeaturedCollection {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    coverImage: c.coverImage,
    featured: c.featured,
    postCount: c._count.posts,
  };
}

export async function getFeaturedCollection(): Promise<FeaturedCollection | null> {
  const collection = await prisma.collection.findFirst({
    where: { featured: true },
    orderBy: { updatedAt: "desc" },
    select: COLLECTION_SELECT,
  });
  if (!collection) return null;
  return toFeaturedCollection(collection);
}