import type { LinkIcon } from "@/lib/profile/schemas";

type IconProps = {
  className?: string;
};

const baseSvg = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// ---------- Individual icons ----------

export function GithubIcon({ className }: IconProps) {
  return (
    <svg
      {...baseSvg}
      className={className}
      aria-hidden="true"
      fill="currentColor"
      stroke="none"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05.8-.23 1.65-.34 2.5-.34.85 0 1.7.11 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.04.36.32.68.95.68 1.92 0 1.39-.01 2.5-.01 2.84 0 .27.18.59.69.49A10.27 10.27 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function TwitterIcon({ className }: IconProps) {
  return (
    <svg
      {...baseSvg}
      className={className}
      aria-hidden="true"
      fill="currentColor"
      stroke="none"
    >
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.6l-5.2-6.8L5.2 22H2l8-9.2L1.3 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z" />
    </svg>
  );
}

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg
      {...baseSvg}
      className={className}
      aria-hidden="true"
      fill="currentColor"
      stroke="none"
    >
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 8.02h4.56V24H.22V8.02Zm7.68 0h4.37v2.18h.06c.61-1.15 2.1-2.37 4.32-2.37 4.62 0 5.47 3.04 5.47 7V24h-4.55v-7.24c0-1.73-.03-3.95-2.4-3.95-2.41 0-2.78 1.88-2.78 3.82V24H7.9V8.02Z" />
    </svg>
  );
}

export function YoutubeIcon({ className }: IconProps) {
  return (
    <svg
      {...baseSvg}
      className={className}
      aria-hidden="true"
      fill="currentColor"
      stroke="none"
    >
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.1C19.5 3.9 12 3.9 12 3.9s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5C0 8.4 0 12 0 12s0 3.6.5 5.5a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.5.5-5.5s0-3.6-.5-5.5ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...baseSvg} className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg
      {...baseSvg}
      className={className}
      aria-hidden="true"
      fill="currentColor"
      stroke="none"
    >
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

export function MastodonIcon({ className }: IconProps) {
  return (
    <svg
      {...baseSvg}
      className={className}
      aria-hidden="true"
      fill="currentColor"
      stroke="none"
    >
      <path d="M21.26 8.29c0-4.35-2.85-5.63-2.85-5.63C16.98 2.03 14.57 1.8 12.07 1.78h-.06c-2.5.02-4.9.25-6.33.88 0 0-2.86 1.28-2.86 5.63 0 1-.02 2.18.01 3.44.11 4.28.83 8.49 4.99 9.53 1.92.48 3.57.59 4.9.52 2.41-.13 3.76-.86 3.76-.86l-.08-1.75s-1.72.54-3.66.48c-1.92-.07-3.94-.21-4.26-2.57a4.7 4.7 0 0 1-.04-.66s1.89.46 4.28.57c1.46.07 2.83-.09 4.22-.26 2.67-.32 4.99-1.97 5.28-3.47.46-2.37.42-5.79.42-5.79Zm-3.6 6.06h-2.24V9.5c0-1.02-.43-1.54-1.29-1.54-.95 0-1.43.62-1.43 1.84v2.66H10.5V9.8c0-1.22-.48-1.84-1.43-1.84-.86 0-1.29.52-1.29 1.54v4.85H5.55V9.32c0-1.02.26-1.83.78-2.43.54-.6 1.24-.9 2.12-.9 1.01 0 1.78.39 2.29 1.17l.5.83.49-.83c.51-.78 1.28-1.17 2.29-1.17.87 0 1.57.3 2.11.9.53.6.79 1.41.79 2.43v5.03Z" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg {...baseSvg} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...baseSvg} className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function RssIcon({ className }: IconProps) {
  return (
    <svg {...baseSvg} className={className} aria-hidden="true">
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg {...baseSvg} className={className} aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

// ---------- Icon map ----------

const ICON_MAP: Record<LinkIcon, (props: IconProps) => React.ReactElement> = {
  github: GithubIcon,
  twitter: TwitterIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  mastodon: MastodonIcon,
  website: GlobeIcon,
  email: MailIcon,
  rss: RssIcon,
  custom: LinkIcon,
};

export function getSocialIcon(icon: LinkIcon) {
  return ICON_MAP[icon] ?? LinkIcon;
}

export const SOCIAL_ICON_LABELS: Record<LinkIcon, string> = {
  github: "GitHub",
  twitter: "Twitter / X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  mastodon: "Mastodon",
  website: "Website",
  email: "Email",
  rss: "RSS Feed",
  custom: "Link",
};