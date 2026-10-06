import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { Metadata } from "next";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import Prose from "@/components/post/Prose";
import PostCard from "@/components/post/PostCard";
import EmptyState from "@/components/shared/EmptyState";
import JSONLD from "@/components/shared/JSONLD";
import Breadcrumbs from "@/components/post/Breadcrumbs";
import { getTopicIcon } from "@/components/shared/TopicIcon";
import {
  getTopicBySlug,
  getPostsByPillar,
  getPillarContent,
  getTopicStats,
} from "@/lib/content/topics";
import { topics } from "@/content/topics";
import { siteConfig } from "@/content/config";
import { getCurrentUser } from "@/lib/auth/session";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) return { title: "Topic not found" };

  const url = siteConfig.url + "/topics/" + topic.slug;
  return {
    title: topic.name,
    description: topic.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: topic.name + " — " + siteConfig.title,
      description: topic.description,
    },
  };
}

export default async function TopicPage({ params }: Params) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const user = await getCurrentUser();
  const posts = await getPostsByPillar(slug, user?.id);
  const canLike = !!user;
  const pillarContent = getPillarContent(slug);

  const latestDate = posts[0]?.date ?? null;
  const TopicIcon = getTopicIcon(slug);

  const allStats = await getTopicStats();
  const relatedTopics = allStats.filter((t) => t.slug !== slug);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.name,
    description: topic.description,
    url: siteConfig.url + "/topics/" + topic.slug,
    hasPart: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: siteConfig.url + "/posts/" + p.slug,
      datePublished: p.date,
    })),
  };

  return (
    <Container>
      <JSONLD data={collectionJsonLd} />

      {/* Breadcrumbs */}
      <div className="pt-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Topics", href: "/topics" },
            { label: topic.name },
          ]}
        />
      </div>

      {/* Hero — bounded card, icon badge, strong hierarchy */}
      <Section className="py-6 md:py-10">
        <div className="hero-ambient overflow-hidden rounded-xl border border-border bg-card p-6 shadow-soft-sm sm:p-10">
          <div className="flex items-start gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-accent">
              <TopicIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wider text-accent">
                Topic
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
                {topic.name}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
                {topic.description}
              </p>
            </div>
          </div>

          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6 text-sm">
            <div className="flex items-baseline gap-2">
              <dt className="text-muted">Articles</dt>
              <dd className="font-medium text-foreground">{posts.length}</dd>
            </div>
            {latestDate ? (
              <div className="flex items-baseline gap-2">
                <dt className="text-muted">Latest</dt>
                <dd className="font-medium text-foreground">{latestDate}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline gap-2">
              <dt className="text-muted">Browse</dt>
              <dd>
                <Link
                  href="/topics"
                  className="font-medium text-accent transition-colors hover:text-accent/80"
                >
                  All topics →
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </Section>

      {pillarContent ? (
        <Section className="py-6 md:py-10">
          <div className="mx-auto max-w-3xl">
            <Prose>
              <MDXRemote source={pillarContent} />
            </Prose>
          </div>
        </Section>
      ) : null}

      {posts.length === 0 ? (
        <Section className="py-6 md:py-10">
          <EmptyState
            title="No posts in this topic yet"
            description="New articles are on the way. Check back soon."
            action={{ label: "Browse all topics", href: "/topics" }}
          />
        </Section>
      ) : (
        <Section className="py-6 md:py-10">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">Articles</h2>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted">
              {posts.length}
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} canLike={canLike} />
            ))}
          </div>
        </Section>
      )}

      {/* Related topics — hub footer */}
      {relatedTopics.length > 0 ? (
        <Section className="py-6 md:py-10">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">
              Keep exploring
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Other topics
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTopics.map((t) => {
              const RelIcon = getTopicIcon(t.slug);
              const isEmpty = t.count === 0;
              return (
                <Link
                  key={t.slug}
                  href={`/topics/${t.slug}`}
                  className={`group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-soft-sm transition-token hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-soft-md ${
                    isEmpty ? "opacity-70" : ""
                  }`}
                >
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors group-hover:border-accent/40 group-hover:text-accent ${
                      isEmpty ? "text-muted" : "text-accent"
                    }`}
                  >
                    <RelIcon className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-semibold tracking-tight group-hover:text-accent">
                    {t.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">
                    {t.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted">
                    <span className={isEmpty ? "italic" : ""}>
                      {t.count === 1 ? "1 post" : `${t.count} posts`}
                    </span>
                    <span
                      aria-hidden
                      className="transition-transform duration-150 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      ) : null}
    </Container>
  );
}