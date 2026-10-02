import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { topics } from "@/content/topics";
import PostForm from "@/components/admin/PostForm";

type Params = { params: Promise<{ id: string }> };

export default async function EditMemberPostPage({ params }: Params) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      pillar: true,
      status: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  // Security: 404 for both "not found" and "not yours" — no info leak.
  if (!post) notFound();
  if (post.authorId !== user.id) notFound();

  // Members can only edit DRAFT or REJECTED. Anything else returns to list.
  if (post.status !== "DRAFT" && post.status !== "REJECTED") {
    redirect("/dashboard/posts");
  }

  const isRejected = post.status === "REJECTED";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/posts"
          className="text-xs font-medium text-muted transition-colors hover:text-accent"
        >
          ← Back to my posts
        </Link>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {isRejected ? "Edit & resubmit" : "Edit draft"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {isRejected
            ? "Make the requested changes, then submit for review again."
            : "Changes are saved as a draft until you submit for review."}
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
        basePath="/dashboard/posts"
        apiBasePath="/api/posts"
        allowPublish={false}
        allowSaveDraft={true}
        allowSubmitForReview={true}
      />
    </div>
  );
}