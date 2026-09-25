import Link from "next/link";
import { siteConfig } from "@/content/config";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {year} {siteConfig.author.name}. All rights reserved.
        </p>
        <ul className="flex gap-4">
          <li>
            <Link href={siteConfig.social.github} className="hover:text-foreground">
              GitHub
            </Link>
          </li>
          <li>
            <Link href={siteConfig.social.twitter} className="hover:text-foreground">
              Twitter
            </Link>
          </li>
          <li>
            <Link href={siteConfig.social.rss} className="hover:text-foreground">
              RSS
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}