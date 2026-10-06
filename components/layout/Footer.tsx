import Link from "next/link";
import { siteConfig } from "@/content/config";

// Mirrors the two-tone split used by the Navbar.
// Kept local rather than extracted; if a third use appears, lift to lib/utils.ts.
function splitTitle(title: string): [string, string] {
  const match = title.match(/^([A-Z][a-z]+)(.+)$/);
  if (match) return [match[1], match[2]];
  return [title, ""];
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.58.1.79-.25.79-.56v-2c-3.2.7-3.9-1.5-3.9-1.5-.53-1.35-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.55-.3-5.23-1.28-5.23-5.7 0-1.26.45-2.3 1.2-3.1-.12-.3-.52-1.48.1-3.08 0 0 .97-.3 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.48 3.17-1.18 3.17-1.18.63 1.6.23 2.78.11 3.08.75.8 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.25 5.68.4.35.76 1.04.76 2.1v3.12c0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function RSSIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.18 17.82a2.18 2.18 0 1 1-4.36 0 2.18 2.18 0 0 1 4.36 0zM1.82 9.45v3.08a9.64 9.64 0 0 1 9.64 9.64h3.08c0-7.02-5.7-12.72-12.72-12.72zM1.82 2.6v3.09c9.03 0 16.36 7.33 16.36 16.36h3.09c0-10.73-8.72-19.45-19.45-19.45z" />
    </svg>
  );
}

const socialLinks = [
  { href: siteConfig.social.github, label: "GitHub", icon: <GitHubIcon />, external: true },
  { href: siteConfig.social.twitter, label: "Twitter", icon: <TwitterIcon />, external: true },
  { href: siteConfig.social.rss, label: "RSS feed", icon: <RSSIcon />, external: false },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [brand, accent] = splitTitle(siteConfig.title);

  return (
    <footer className="mt-20 border-t border-border bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-12 md:gap-8">
          {/* Col 1: Brand + tagline */}
          <div className="sm:col-span-2 md:col-span-5">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight transition-opacity duration-200 hover:opacity-80"
            >
              <span className="text-foreground">{brand}</span>
              <span className="text-accent">{accent}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.tagline}
            </p>
          </div>

          {/* Col 2: Navigate */}
          <div className="md:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Navigate
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted transition-colors duration-200 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Elsewhere */}
          <div className="md:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Elsewhere
            </h2>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2.5 text-sm text-muted transition-colors duration-200 hover:text-foreground"
                    {...(link.external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors duration-200 group-hover:border-accent/40 group-hover:text-accent">
                      {link.icon}
                    </span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Meta */}
          <div className="md:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Info
            </h2>
            <div className="mt-4 space-y-2.5 text-xs leading-relaxed text-muted">
              <p>
                © {year} {siteConfig.author.name}
              </p>
              <p>All rights reserved.</p>
              <p className="pt-1">Built with Next.js and Tailwind CSS.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}