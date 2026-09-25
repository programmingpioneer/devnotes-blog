import Link from "next/link";
import { topics } from "@/content/topics";
import PostForm from "@/components/admin/PostForm";

export default function NewPostPage() {
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
          New post
        </h2>
        <p className="mt-1 text-sm text-muted">
          Draft it first, then publish when ready.
        </p>
      </div>

      <PostForm pillars={[...topics]} />
    </div>
  );
}