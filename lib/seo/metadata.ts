import type { Metadata } from "next";
import { siteConfig } from "@/content/config";
import type { PostMeta } from "@/lib/content/posts";

export function postMetadata(post: PostMeta): Metadata {
  const url = `${siteConfig.url}/posts/${post.slug}`;
  const ogImage = `${siteConfig.url}/api/og?title=${encodeURIComponent(post.title)}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [siteConfig.author.name],
      tags: post.tags,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
      creator: siteConfig.author.twitter,
    },
  };
}