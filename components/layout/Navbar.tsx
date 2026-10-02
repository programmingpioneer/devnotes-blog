import Link from "next/link";
import { siteConfig } from "@/content/config";
import ThemeToggle from "@/components/layout/ThemeToggle";
import MobileNav from "@/components/layout/MobileNav";
import NavUserArea from "@/components/layout/NavUserArea";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4"
      >
        <Link
          href="/"
          className="text-base font-semibold tracking-tight transition-colors duration-150 hover:text-accent"
        >
          {siteConfig.title}
        </Link>

        <ul className="hidden items-center gap-6 text-sm text-muted md:flex">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-token hover:border-accent hover:text-accent"
          >
            <SearchIcon />
          </Link>
          <NavUserArea />
          <ThemeToggle />
          <MobileNav items={siteConfig.nav} />
        </div>
      </nav>
    </header>
  );
}