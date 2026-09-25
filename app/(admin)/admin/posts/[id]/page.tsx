import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { topics } from "@/content/topics";
import PostForm from "@/components/admin/PostForm";

type Params = { params: Promise<{ id: string }> };

export default async function EditPostPage({ params }: Params) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      pillar: true,
      status: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/posts"
          className="text-xs font-medium text-muted transition-colors hover:text-accent"
        >
          ← Back to posts
        </Link>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Edit post
        </h2>
        <p className="mt-1 text-sm text-muted">
          Changes save to the live site immediately.
        </p>
      </div>

      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage ?? "",
          pillar: post.pillar ?? "",
          status: post.status,
          tags: post.tags.map((pt) => pt.tag.name),
        }}
        pillars={[...topics]}
      />
    </div>
  );
}