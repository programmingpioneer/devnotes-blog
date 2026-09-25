"use client";

import {
  LINK_ICONS,
  validateLinkUrl,
  type LinkIcon,
  type ProfileLink,
} from "@/lib/profile/schemas";
import {
  getSocialIcon,
  SOCIAL_ICON_LABELS,
} from "@/components/profile/social-icons";

type LinkEditorProps = {
  links: ProfileLink[];
  onChange: (links: ProfileLink[]) => void;
};

const MAX_LINKS = 11;

export default function LinkEditor({ links, onChange }: LinkEditorProps) {
  function updateRow(idx: number, patch: Partial<ProfileLink>) {
    const next = links.map((l, i) => (i === idx ? { ...l, ...patch } : l));
    onChange(next);
  }

  function removeRow(idx: number) {
    onChange(links.filter((_, i) => i !== idx));
  }

  function addRow() {
    if (links.length >= MAX_LINKS) return;
    onChange([...links, { icon: "website", url: "" }]);
  }

  return (
    <div className="space-y-3">
      {links.length === 0 && (
        <p className="text-sm text-muted">
          No links yet. Add your social profiles below.
        </p>
      )}

      <ul className="space-y-2">
        {links.map((link, idx) => {
          const Icon = getSocialIcon(link.icon);
          const urlError = link.url.trim()
            ? validateLinkUrl(link.icon, link.url)
            : null;

          return (
            <li key={idx} className="space-y-1">
              <div className="flex items-stretch gap-2">
                {/* Icon preview */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/5 text-muted">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Icon select */}
                <select
                  aria-label="Link type"
                  value={link.icon}
                  onChange={(e) =>
                    updateRow(idx, { icon: e.target.value as LinkIcon })
                  }
                  className="h-10 shrink-0 rounded-md border border-border bg-background px-2 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                >
                  {LINK_ICONS.map((iconKey) => (
                    <option key={iconKey} value={iconKey}>
                      {SOCIAL_ICON_LABELS[iconKey]}
                    </option>
                  ))}
                </select>

                {/* URL input */}
                <input
                  type="text"
                  inputMode="url"
                  aria-label={`${SOCIAL_ICON_LABELS[link.icon]} URL`}
                  value={link.url}
                  onChange={(e) => updateRow(idx, { url: e.target.value })}
                  placeholder={
                    link.icon === "email"
                      ? "you@example.com"
                      : link.icon === "mastodon"
                        ? "@user@instance.tld"
                        : "https://..."
                  }
                  className={`h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
                    urlError
                      ? "border-red-500"
                      : "border-border focus:border-accent"
                  }`}
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  aria-label="Remove link"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-red-500 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {urlError && (
                <p
                  role="alert"
                  className="pl-12 text-xs text-red-600 dark:text-red-400"
                >
                  {urlError}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={addRow}
        disabled={links.length >= MAX_LINKS}
        className="inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Add another link
        <span className="text-xs opacity-70">
          ({links.length}/{MAX_LINKS})
        </span>
      </button>
    </div>
  );
}