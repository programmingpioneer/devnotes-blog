import { NextResponse } from "next/server";
import { getAllPostsWithContent } from "@/lib/content/posts";
import { searchPosts } from "@/lib/search/query";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (!query) {
    return NextResponse.json({ query: "", count: 0, results: [] });
  }

  const withContent = await getAllPostsWithContent();

  const results = searchPosts(withContent, query).map((r) => ({
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    date: r.date,
    readingTime: r.readingTime,
    tags: r.tags,
    score: r.score,
  }));

  return NextResponse.json({
    query,
    count: results.length,
    results,
  });
}