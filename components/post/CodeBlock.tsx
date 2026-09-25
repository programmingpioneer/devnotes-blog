"use client";

import { useState } from "react";

export default function CodeBlock({
  children,
  ...props
}: React.HTMLAttributes<HTMLPreElement>) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const text = typeof children === "string" ? children : "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="group relative my-6">
      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-2 top-2 rounded-md border border-border bg-background/80 px-2 py-1 text-xs text-muted opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <pre
        {...props}
        className="overflow-x-auto rounded-md border border-border bg-muted/5 p-4 text-sm"
      >
        {children}
      </pre>
    </div>
  );
}