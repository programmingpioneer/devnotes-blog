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
};

export default function PostPreview({
  title,
  excerpt,
  content,
}: PostPreviewProps) {
  const hasContent = content.trim().length > 0;

  // Memoize the rendered tree so typing outside the content field
  // doesn't re-parse the markdown.
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

  return (
    <div className="rounded-xl border border-border bg-background">
      <div className="border-b border-border px-4 py-2 text-xs font-medium text-muted">
        Live Preview
      </div>
      <div className="max-h-[600px] overflow-y-auto p-4">
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