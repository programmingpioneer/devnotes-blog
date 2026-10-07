export const siteConfig = {
  title: "DevNotes",
  tagline: "Notes from shipping production web systems.",
  description:
    "Production-level Web Dev & Backend Architecture case studies.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: {
    name: "Programming Pioneer",
  },
  repo: {
    owner: "programmingpioneer",
    name: "devnotes-blog",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Posts", href: "/posts" },
    { label: "Topics", href: "/topics" },
    { label: "About", href: "/about" },
  ],
   social: {
    github: "https://github.com/programmingpioneer/devnotes-blog",
    twitter: "@programerPioner",
    rss: "/rss.xml",
  },
  legal: {
    lastUpdated: "2026-09-25",
    contactEmail: "7t7sufyan@gmail.com",
    companyName: "Programming Pioneer",
    jurisdiction: "Pakistan",
    address: "KPK, Malakand, Sakhakot",
    nav: [
      { label: "FAQ", href: "/faq" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
      { label: "Contact", href: "/contact" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;