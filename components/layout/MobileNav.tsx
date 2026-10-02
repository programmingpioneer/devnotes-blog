"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

type MobileNavProps = {
  items: readonly NavItem[];
};

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {open ? (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </>
      )}
    </svg>
  );
}

export default function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape key + focus management + body scroll lock
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus first link
    const t = setTimeout(() => firstLinkRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open]);

  // Return focus to trigger on close
  useEffect(() => {
    if (!open) {
      // Only return focus if trigger exists and user had opened before
      return;
    }
  }, [open]);

  const closeAndRestoreFocus = () => {
    setOpen(false);
    // Restore focus after animation
    setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-controls="mobile-nav"
        aria-expanded={open}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
      >
        <HamburgerIcon open={open} />
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => closeAndRestoreFocus()}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm",
          open ? "opacity-100" : "pointer-events-none opacity-0",
          "motion-safe:transition-opacity motion-safe:duration-200"
        )}
      />

      {/* Drawer */}
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-xs border-l border-border bg-card shadow-soft-lg",
          open ? "translate-x-0" : "translate-x-full",
          "motion-safe:transition-transform motion-safe:duration-300"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold tracking-tight">Menu</span>
          <button
            type="button"
            onClick={() => closeAndRestoreFocus()}
            aria-label="Close menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground"
          >
            <HamburgerIcon open={true} />
          </button>
        </div>

        <ul className="flex flex-col p-2">
          {items.map((item, i) => (
            <li key={item.href}>
              <Link
                ref={i === 0 ? firstLinkRef : undefined}
                href={item.href}
                onClick={closeAndRestoreFocus}
                className="block rounded-md px-4 py-3 text-base text-foreground transition-colors duration-150 hover:bg-subtle"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}