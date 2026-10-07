import Link from "next/link";
import { siteConfig } from "@/content/config";
import ThemeToggle from "@/components/layout/ThemeToggle";
import MobileNav from "@/components/layout/MobileNav";
import NavUserArea from "@/components/layout/NavUserArea";
import GitHubStars from "@/components/layout/GitHubStars";

// Split a camelCase title like "DevNotes" into ["Dev", "Notes"].
// Falls back to the whole string as the brand half when the title has no
// camelCase boundary (e.g. all-lowercase or single-token titles).
function splitTitle(title: string): [string, string] {
  const match = title.match(/^([A-Z][a-z]+)(.+)$/);
  if (match) return [match[1], match[2]];
  return [title, ""];
}

export default function Navbar() {
  const [brand, accent] = splitTitle(siteConfig.title);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4"
      >
        <Link
          href="/"
          className="text-base font-semibold tracking-tight transition-opacity duration-150 hover:opacity-80"
        >
          <span className="text-foreground">{brand}</span>
          <span className="text-accent">{accent}</span>
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
          <GitHubStars />
          <NavUserArea />
          <ThemeToggle />
          <MobileNav items={siteConfig.nav} />
        </div>
      </nav>
    </header>
  );
}