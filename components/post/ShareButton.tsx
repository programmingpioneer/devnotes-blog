"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
} from "react";
import {
  CheckIcon,
  CopyIcon,
  FacebookIcon,
  LinkedinIcon,
  MailIcon,
  RedditIcon,
  SHARE_ICON_LABELS,
  ShareIcon,
  TelegramIcon,
  TwitterXIcon,
  WhatsappIcon,
  type SharePlatform,
} from "@/components/post/share-icons";

type ShareButtonProps = {
  title: string;
  excerpt: string;
  slug: string;
  coverImage?: string | null;
  viewsLabel: string;
  siteUrl: string;
  siteTitle: string;
  twitterHandle?: string;
  variant: "icon" | "button";
};

type PlatformTile = {
  key: SharePlatform;
  href: string;
  Icon: (props: { className?: string }) => ReactElement;
};

/**
 * Trust native share ONLY on real touch devices (phones/tablets).
 * Windows/macOS desktop Chrome/Edge also expose navigator.share, but the OS
 * sheet is jarring for blog sharing — the custom modal is preferred there.
 */
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  return coarse && narrow;
}

export default function ShareButton({
  title,
  excerpt,
  slug,
  coverImage,
  viewsLabel,
  siteUrl,
  siteTitle,
  twitterHandle,
  variant,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialogTitleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseUrl = siteUrl.replace(/\/$/, "");
  const postUrl = `${baseUrl}/posts/${slug}`;
  const shareText = `"${title}" — ${siteTitle}`;
  const handleParam = twitterHandle?.replace(/^@/, "") ?? "";
  const enc = encodeURIComponent;

  const platforms: PlatformTile[] = [
    {
      key: "x",
      Icon: TwitterXIcon,
      href: `https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(postUrl)}${
        handleParam ? `&via=${enc(handleParam)}` : ""
      }`,
    },
    {
      key: "facebook",
      Icon: FacebookIcon,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(postUrl)}`,
    },
    {
      key: "linkedin",
      Icon: LinkedinIcon,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(postUrl)}`,
    },
    {
      key: "whatsapp",
      Icon: WhatsappIcon,
      href: `https://wa.me/?text=${enc(`${shareText} ${postUrl}`)}`,
    },
    {
      key: "telegram",
      Icon: TelegramIcon,
      href: `https://t.me/share/url?url=${enc(postUrl)}&text=${enc(shareText)}`,
    },
    {
      key: "reddit",
      Icon: RedditIcon,
      href: `https://www.reddit.com/submit?url=${enc(postUrl)}&title=${enc(title)}`,
    },
    {
      key: "email",
      Icon: MailIcon,
      href: `mailto:?subject=${enc(title)}&body=${enc(`${excerpt}\n\n${postUrl}`)}`,
    },
    {
      key: "copy",
      Icon: CopyIcon,
      href: "",
    },
  ];

  // Escape-to-close + body scroll lock while modal is open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Focus the close button on open
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  // Clear copied-state timer on unmount
  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  async function handleTrigger() {
    if (isMobileDevice() && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: shareText, url: postUrl });
        return;
      } catch (err) {
        // User cancelled native sheet — done.
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Any other error → fall through to modal.
      }
    }
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setCopied(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(postUrl);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = postUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        return;
      }
    }
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={handleTrigger}
          aria-label="Share this post"
          className="inline-flex items-center text-muted transition-colors hover:text-accent"
        >
          <ShareIcon className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleTrigger}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
        >
          <ShareIcon className="h-4 w-4" />
          <span>Share</span>
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-2xl border border-border bg-background shadow-2xl sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 id={dialogTitleId} className="text-base font-semibold">
                Share this post
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="rounded-md p-1 text-muted transition-colors hover:bg-muted/10 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {/* Preview card */}
              <div className="flex gap-3 rounded-lg border border-border bg-muted/5 p-3">
                {coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverImage}
                    alt=""
                    className="h-14 w-14 flex-none rounded-md border border-border object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs text-muted">{viewsLabel}</p>
                </div>
              </div>

              {/* URL bar with copy button */}
              <div className="mt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Copy link
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/5 px-3 py-2">
                  <input
                    readOnly
                    value={postUrl}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? "Link copied" : "Copy link"}
                    className="flex flex-none items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors hover:border-accent hover:text-accent"
                  >
                    {copied ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5 text-accent" />
                        <span className="text-accent">Copied</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Share tiles */}
              <div className="mt-5">
                <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Share to
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {platforms.map((p) => {
                    if (p.key === "copy") {
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={handleCopy}
                          className="group flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-[11px] text-muted transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                        >
                          {copied ? (
                            <CheckIcon className="h-5 w-5 text-accent" />
                          ) : (
                            <CopyIcon className="h-5 w-5" />
                          )}
                          <span className="text-center leading-tight">
                            {copied ? "Copied!" : SHARE_ICON_LABELS[p.key]}
                          </span>
                        </button>
                      );
                    }
                    return (
                      <a
                        key={p.key}
                        href={p.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeModal}
                        className="group flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-[11px] text-muted transition-all hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                      >
                        <p.Icon className="h-5 w-5" />
                        <span className="text-center leading-tight">
                          {SHARE_ICON_LABELS[p.key]}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}