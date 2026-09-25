import PostCard from "@/components/post/PostCard";
import type { PostMeta } from "@/lib/content/posts";

type HeroEditorialProps = {
  featured: PostMeta;
  sidePosts: PostMeta[];
};

export default function HeroEditorial({
  featured,
  sidePosts,
}: HeroEditorialProps) {
  return (
    <div className="grid gap-5 md:grid-cols-5">
      <div className="md:col-span-3">
        <PostCard post={featured} variant="featured" />
      </div>

      <div className="flex flex-col gap-5 md:col-span-2">
        {sidePosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}