"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/Toast";
import Badge from "@/components/ui/Badge";

const STATUS_VARIANTS: Record<
  string,
  "neutral" | "warning" | "success" | "error"
> = {
  DRAFT: "neutral",
  PENDING_REVIEW: "warning",
  PUBLISHED: "success",
  REJECTED: "error",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
};

type Props = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: string;
  updatedAt: string;
};

export default function PostRow({
  id,
  slug,
  title,
  excerpt,
  status,
  updatedAt,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();

  const isPublished = status === "PUBLISHED";
  const canEdit = status === "DRAFT" || status === "REJECTED";

  function handleActivate() {
    if (isPublished) {
      router.push(`/posts/${slug}`);
      return;
    }
    if (status === "PENDING_REVIEW") {
      toast(
        "This post is still under review. It will go live once an admin approves it.",
        "info"
      );
      return;
    }
    if (status === "REJECTED") {
      toast(
        "This post was rejected. Open it to edit and resubmit for review.",
        "info"
      );
      return;
    }
    toast("This is a draft. Open it to keep editing.", "info");
  }

  return (
    <li
      role="button"
      tabIndex={0}
      aria-label={`${title || "Untitled"} — ${STATUS_LABELS[status] ?? status}`}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleActivate();
        }
      }}
      className="cursor-pointer rounded-xl border border-border bg-background p-4 transition-colors hover:border-accent/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={STATUS_VARIANTS[status] ?? "neutral"}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
            <span className="text-xs text-muted">
              Updated {new Date(updatedAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="mt-2 truncate text-base font-medium">
            {title || "Untitled"}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {excerpt || "No excerpt yet."}
          </p>
        </div>

        {canEdit && (
          <Link
            href={`/dashboard/posts/${id}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Edit
          </Link>
        )}
      </div>
    </li>
  );
}