import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Container from "@/components/shared/Container";
import Prose from "@/components/post/Prose";
import TOC from "@/components/post/TOC";
import Breadcrumbs from "@/components/post/Breadcrumbs";
import AuthorCard from "@/components/post/AuthorCard";
import JSONLD from "@/components/shared/JSONLD";
import { mdxComponents } from "@/components/post/mdx-components";
import LikeButton from "@/components/post/LikeButton";
import ViewTracker from "@/components/post/ViewTracker";
import { getPostBySlug, getAllPostSlugs } from "@/lib/content/posts";
import { extractHeadings } from "@/lib/content/headings";
import { postMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { topics } from "@/content/topics";
import { getCurrentUser } from "@/lib/auth/session";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getAllPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return postMetadata(post);
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const post = await getPostBySlug(slug, user?.id);

  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const pillarTopic = post.pillar
    ? topics.find((t) => t.slug === post.pillar)
    : undefined;

  const crumbs = [
    { label: "Home", href: "/" },
    ...(pillarTopic
      ? [{ label: pillarTopic.name, href: `/topics/${pillarTopic.slug}` }]
      : []),
    { label: post.title },
  ];

  return (
    <Container>
      <JSONLD data={[articleJsonLd(post), breadcrumbJsonLd(crumbs)]} />

        <div className="grid gap-8 py-8 md:gap-12 md:py-16 lg:grid-cols-[1fr_200px]">
         <article className="min-w-0">
          <ViewTracker slug={post.slug} />
          <Breadcrumbs items={crumbs} />

          {post.coverImage && (
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-muted/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.title}
                className="mx-auto max-h-105 w-auto max-w-full object-contain"
              />
            </div>
          )}

          <header className="mb-10 mt-8">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
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
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden>·</span>
              <span>{post.readingTime}</span>
              <span aria-hidden>·</span>
              <span>{post.views.toLocaleString()} views</span>
            </div>
          </header>

          {headings.length > 0 && (
            <details className="mb-8 rounded-lg border border-border p-3 lg:hidden">
              <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-wider text-muted">
                On this page ▾
              </summary>
              <div className="mt-3">
                <TOC headings={headings} hideHeading />
              </div>
            </details>
          )}

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

          <div className="mt-8 flex items-center justify-end">
            <LikeButton
              slug={post.slug}
              initialLikes={post.likes}
              initialLikedByMe={post.likedByMe}
              canLike={!!user}
            />
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TOC headings={headings} />
          </div>
        </aside>
      </div>
    </Container>
  );
}