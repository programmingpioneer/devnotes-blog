import type { ProfileLink } from "@/lib/profile/schemas";
import {
  getSocialIcon,
  SOCIAL_ICON_LABELS,
} from "@/components/profile/social-icons";

type SocialLinksProps = {
  links: ProfileLink[] | null;
  className?: string;
};

/**
 * Renders a horizontal row of social link icons.
 * Returns null if no links — caller decides empty-state handling.
 */
export default function SocialLinks({ links, className }: SocialLinksProps) {
  if (!links || links.length === 0) return null;

  return (
    <ul
      className={`flex flex-wrap items-center justify-center gap-2 sm:justify-start ${className ?? ""}`}
    >
      {links.map((link, idx) => {
        const Icon = getSocialIcon(link.icon);
        const label = SOCIAL_ICON_LABELS[link.icon] ?? "Link";

        // Email links need "mailto:" if not already there
        const href =
          link.icon === "email" && !link.url.startsWith("mailto:")
            ? `mailto:${link.url}`
            : link.url;

        return (
          <li key={`${link.icon}-${idx}`}>
            <a
              href={href}
              target={link.icon === "email" ? undefined : "_blank"}
              rel={link.icon === "email" ? undefined : "noopener noreferrer"}
              aria-label={label}
              title={label}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted transition-colors hover:border-accent hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <Icon className="h-5 w-5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}