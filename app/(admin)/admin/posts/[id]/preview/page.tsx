import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { prisma } from "@/lib/db/client";
import { topics } from "@/content/topics";
import { extractHeadings } from "@/lib/content/headings";
import { mdxComponents } from "@/components/post/mdx-components";
import Prose from "@/components/post/Prose";
import TOC from "@/components/post/TOC";
import Breadcrumbs from "@/components/post/Breadcrumbs";
import AuthorCard from "@/components/post/AuthorCard";

type Params = { params: Promise<{ id: string }> };

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
};

function calcReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default async function PreviewPostPage({ params }: Params) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      date: true,
      status: true,
      pillar: true,
      author: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
        },
      },
    },
  });

  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const pillarTopic = post.pillar
    ? topics.find((t) => t.slug === post.pillar)
    : undefined;

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Admin posts", href: "/admin/posts" },
    ...(pillarTopic
      ? [{ label: pillarTopic.name, href: `/topics/${pillarTopic.slug}` }]
      : []),
    { label: post.title },
  ];

  const readingTime = calcReadingTime(post.content);
  const date = post.date.toISOString().slice(0, 10);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/admin/posts"
          className="text-xs font-medium text-muted transition-colors hover:text-accent"
        >
          ← Back to posts
        </Link>

        <div className="flex items-center gap-3">
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
            {STATUS_LABEL[post.status] ?? post.status}
          </span>
          <Link
            href={`/admin/posts/${post.id}`}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_200px]">
        <article>
          <Breadcrumbs items={crumbs} />

          <header className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-muted">{post.excerpt}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
              {post.author.name || post.author.username ? (
                <>
                  <span>
                    By{" "}
                    {post.author.username ? (
                      <Link
                        href={`/u/${post.author.username}`}
                        className="transition-token hover:text-accent"
                      >
                        {post.author.name ?? post.author.username}
                      </Link>
                    ) : (
                      post.author.name
                    )}
                  </span>
                  <span aria-hidden>·</span>
                </>
              ) : null}
              <time dateTime={date}>{date}</time>
              <span aria-hidden>·</span>
              <span>{readingTime}</span>
            </div>
          </header>

          <Prose>
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </Prose>

          <AuthorCard author={post.author} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TOC headings={headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}