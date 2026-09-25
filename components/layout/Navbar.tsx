import Link from "next/link";
import { siteConfig } from "@/content/config";
import ThemeToggle from "@/components/layout/ThemeToggle";
import UserMenu from "@/components/layout/UserMenu";
import { getSession } from "@/lib/auth/session";

export default async function Navbar() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4"
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:text-accent"
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
          {user ? (
            <UserMenu
              name={user.name ?? null}
              email={user.email ?? ""}
              image={user.image ?? null}
              role={user.role}
              username={user.username ?? null}
            />
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent"
            >
              Sign in
            </Link>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
