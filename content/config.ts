export const siteConfig = {
  title: "DevNotes",
  tagline: "Notes from shipping production web systems.",
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
  ],
  social: {
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourhandle",
    rss: "/rss.xml",
  },
  legal: {
    lastUpdated: "2026-09-25",
    contactEmail: "hello@example.com",
    companyName: "[YOUR COMPANY NAME]",
    jurisdiction: "[YOUR JURISDICTION]",
    address: "[YOUR ADDRESS]",
  },
} as const;

export type SiteConfig = typeof siteConfig;
