import PostCard from "@/components/post/PostCard";
import type { PostMeta } from "@/lib/content/posts";

type RecentGridProps = {
  posts: PostMeta[];
};

export default function RecentGrid({ posts }: RecentGridProps) {
  if (posts.length === 0) return null;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">
        Recent articles
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}