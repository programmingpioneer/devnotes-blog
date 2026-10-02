"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Prose from "@/components/post/Prose";
import CodeBlock from "@/components/post/CodeBlock";

type PostPreviewProps = {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
};

export default function PostPreview({
  title,
  excerpt,
  content,
  coverImage,
}: PostPreviewProps) {
  const hasContent = content.trim().length > 0;

  const rendered = useMemo(() => {
    if (!hasContent) return null;
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          pre: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }, [content, hasContent]);

  const trimmedCover = coverImage?.trim();

  return (
    <div className="rounded-xl border border-border bg-background">
      <div className="border-b border-border px-4 py-2 text-xs font-medium text-muted">
        Live Preview
      </div>
      <div className="max-h-[600px] overflow-y-auto p-4">
        {trimmedCover && (
          <div className="mb-6 overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trimmedCover}
              alt={title.trim() || "Cover image"}
              className="w-full h-auto"
            />
          </div>
        )}

        {(title.trim() || excerpt.trim()) && (
          <>
            <h1 className="text-2xl font-semibold tracking-tight">
              {title.trim() || "Untitled"}
            </h1>
            {excerpt.trim() && (
              <p className="mt-2 text-sm text-muted">{excerpt}</p>
            )}
            <hr className="my-6 border-border" />
          </>
        )}

        {!hasContent && (
          <p className="text-sm text-muted">Start typing to see a preview.</p>
        )}

        {hasContent && <Prose>{rendered}</Prose>}
      </div>
    </div>
  );
}