import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import PostRow from "@/components/dashboard/PostRow";

export default async function MyPostsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      status: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My posts</h2>
          <p className="mt-1 text-sm text-muted">
            Draft, submit for review, and track your submissions.
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-8 text-center">
          <p className="text-sm text-muted">
            You haven&apos;t written any posts yet.
          </p>
          <Link
            href="/dashboard/posts/new"
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            Write your first post →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <PostRow
              key={post.id}
              id={post.id}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              status={post.status}
              updatedAt={post.updatedAt.toISOString()}
            />
          ))}
        </ul>
      )}
    </div>
  );
}