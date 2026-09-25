import { z } from "zod";

// ============================================================
// Link icons
// ============================================================
export const LINK_ICONS = [
  "github",
  "twitter",
  "linkedin",
  "youtube",
  "instagram",
  "facebook",
  "mastodon",
  "website",
  "email",
  "rss",
  "custom",
] as const;

export type LinkIcon = (typeof LINK_ICONS)[number];

export type ProfileLink = {
  icon: LinkIcon;
  url: string;
};

// ============================================================
// Per-icon URL validation — returns error message or null
// ============================================================
const HTTP_URL_RE = /^https?:\/\/.+/i;

export function validateLinkUrl(icon: LinkIcon, rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url) return "URL is required";

  // Email — accept "user@host.tld" or "mailto:user@host.tld"
  if (icon === "email") {
    const addr = url.startsWith("mailto:") ? url.slice(7) : url;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)
      ? null
      : "Enter a valid email address";
  }

  // Mastodon — accept "@user@instance.tld" or full URL
  if (icon === "mastodon") {
    if (/^@[^@\s]+@[^@\s]+\.[^@\s]+$/.test(url)) return null;
    if (HTTP_URL_RE.test(url) && /\/@[^/]+/.test(url)) return null;
    return "Use @user@instance.tld format";
  }

  if (!HTTP_URL_RE.test(url)) return "URL must start with https://";

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname;

    switch (icon) {
      case "github":
        return host === "github.com" && /^\/[^/]+/.test(path)
          ? null
          : "Use a github.com profile or repo URL";

      case "twitter":
        return (host === "twitter.com" || host === "x.com") &&
          /^\/[^/]+/.test(path)
          ? null
          : "Use a twitter.com or x.com URL";

      case "linkedin":
        return host === "linkedin.com" && /^\/(in|company)\/[^/]+/.test(path)
          ? null
          : "Use a linkedin.com/in/... or /company/... URL";

      case "youtube":
        if (host === "youtube.com" && /^\/(@[^/]+|channel|c)\//.test(path))
          return null;
        if (host === "youtu.be" && path.length > 1) return null;
        return "Use a youtube.com channel or youtu.be video URL";

      case "instagram":
        return host === "instagram.com" && /^\/[^/]+/.test(path)
          ? null
          : "Use an instagram.com profile URL";

      case "facebook":
        return host === "facebook.com" && /^\/[^/]+/.test(path)
          ? null
          : "Use a facebook.com profile URL";

      case "rss":
        return /(\.xml$|\/feed\/?$|\/rss\/?$|rss)/i.test(url)
          ? null
          : "RSS URL should end with .xml, /feed, or /rss";

      case "website":
      case "custom":
      default:
        return null;
    }
  } catch {
    return "Invalid URL";
  }
}

// ============================================================
// Zod schemas
// ============================================================
export const profileLinkSchema = z.object({
  icon: z.enum(LINK_ICONS),
  url: z.string().trim().min(1).max(500),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      "Lowercase letters, numbers, hyphens only — no leading/trailing hyphen"
    )
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(500, "Bio must be at most 500 characters")
    .optional()
    .or(z.literal("")),
  links: z.array(profileLinkSchema).max(11, "Maximum 11 links").default([]),
  coverImage: z
    .string()
    .trim()
    .url("Cover image must be a valid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
  image: z
    .string()
    .trim()
    .url("Avatar must be a valid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;