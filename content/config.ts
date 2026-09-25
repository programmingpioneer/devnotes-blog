export const siteConfig = {
  title: "DevNotes",
  description:
    "Production-level Web Dev & Backend Architecture case studies.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: {
    name: "Your Name",
    twitter: "@yourhandle",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Topics", href: "/topics" },
    { label: "About", href: "/about" },
    { label: "Search", href: "/search" },
  ],
  social: {
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourhandle",
    rss: "/rss.xml",
  },
} as const;

export type SiteConfig = typeof siteConfig;