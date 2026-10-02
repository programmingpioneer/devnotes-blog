import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** Base path without query string, e.g. "/admin/posts" */
  basePath: string;
};

function pageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}?page=${page}`;
}

function buildPageList(currentPage: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const items: (number | "…")[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 1) items.push("…");
  items.push(totalPages);
  return items;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = buildPageList(currentPage, totalPages);
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  const navButtonClass =
    "rounded-md border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent";
  const disabledClass =
    "rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-xs text-muted">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={pageHref(basePath, prevPage)}
          aria-disabled={currentPage === 1}
          tabIndex={currentPage === 1 ? -1 : undefined}
          className={currentPage === 1 ? disabledClass : navButtonClass}
        >
          ← Prev
        </Link>

        {items.map((item, idx) =>
          item === "…" ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-2 text-xs text-muted"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={pageHref(basePath, item)}
              aria-current={item === currentPage ? "page" : undefined}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                item === currentPage
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border hover:border-accent hover:text-accent"
              )}
            >
              {item}
            </Link>
          )
        )}

        <Link
          href={pageHref(basePath, nextPage)}
          aria-disabled={currentPage === totalPages}
          tabIndex={currentPage === totalPages ? -1 : undefined}
          className={currentPage === totalPages ? disabledClass : navButtonClass}
        >
          Next →
        </Link>
      </div>
    </nav>
  );
}