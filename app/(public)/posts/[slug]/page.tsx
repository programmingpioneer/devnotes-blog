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
import { getPostBySlug, getAllPostSlugs } from "@/lib/content/posts";
import { extractHeadings } from "@/lib/content/headings";
import { postMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { topics } from "@/content/topics";

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
  const post = await getPostBySlug(slug);

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

      <div className="grid gap-12 py-12 md:py-16 lg:grid-cols-[1fr_200px]">
        <article>
          <Breadcrumbs items={crumbs} />

          <header className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-muted">{post.excerpt}</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-muted">
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden>Â·</span>
              <span>{post.readingTime}</span>
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
    </Container>
  );
}