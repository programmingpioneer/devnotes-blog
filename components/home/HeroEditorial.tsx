import PostCard from "@/components/post/PostCard";
import RevealOnScroll from "@/components/shared/RevealOnScroll";
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
    <div className="grid gap-5 md:grid-cols-12 md:gap-6">
      <RevealOnScroll className="md:col-span-7">
        <PostCard post={featured} variant="featured" />
      </RevealOnScroll>

      <div className="flex flex-col gap-5 md:col-span-5">
        {sidePosts.map((post, i) => (
          <RevealOnScroll key={post.slug} delay={120 + i * 90}>
            <PostCard post={post} />
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}