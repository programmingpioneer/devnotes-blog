import Link from "next/link";
import { topics } from "@/content/topics";
import PostForm from "@/components/admin/PostForm";

export default function NewMemberPostPage() {
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
          New post
        </h2>
        <p className="mt-1 text-sm text-muted">
          Save a draft, then submit for review when it&apos;s ready.
        </p>
      </div>

      <PostForm
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