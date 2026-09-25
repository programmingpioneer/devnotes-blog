import Link from "next/link";
import { prisma } from "@/lib/db/client";
import PostTable, { type PostRow } from "@/components/admin/PostTable";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      status: true,
      pillar: true,
      date: true,
      updatedAt: true,
      author: { select: { name: true, username: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  const rows: PostRow[] = posts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    status: p.status,
    pillar: p.pillar,
    date: p.date,
    updatedAt: p.updatedAt,
    author: p.author,
    tags: p.tags.map((pt) => pt.tag.name),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Posts</h2>
          <p className="mt-1 text-sm text-muted">
            {posts.length} {posts.length === 1 ? "post" : "posts"} total
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          New post
        </Link>
      </div>

      <PostTable posts={rows} />
    </div>
  );
}