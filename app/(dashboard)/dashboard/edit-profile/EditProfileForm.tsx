"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "@/components/shared/Toast";
import type { ProfileLink } from "@/lib/profile/schemas";
import ProfileHeader from "@/components/profile/ProfileHeader";
import LinkEditor from "@/components/profile/LinkEditor";
import { cn } from "@/lib/utils";

type Initial = {
  name: string;
  username: string;
  bio: string;
  image: string;
  coverImage: string;
  links: ProfileLink[];
};

type EditProfileFormProps = {
  initial: Initial;
  email: string;
};

type UsernameStatus =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "available" }
  | { kind: "taken"; reason: string }
  | { kind: "invalid"; reason: string };

const BIO_MAX = 500;

export default function EditProfileForm({ initial, email }: EditProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { update: updateSession } = useSession();

  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [image, setImage] = useState(initial.image);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [links, setLinks] = useState<ProfileLink[]>(initial.links);

   const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>({ kind: "idle" });

  // Detect dirty state by comparing current values vs initial snapshot
  const dirty = useMemo(() => {
    return (
      name !== initial.name ||
      username !== initial.username ||
      bio !== initial.bio ||
      image !== initial.image ||
      coverImage !== initial.coverImage ||
      JSON.stringify(links) !== JSON.stringify(initial.links)
    );
  }, [name, username, bio, image, coverImage, links, initial]);

  // beforeunload warning when dirty
  useEffect(() => {
    if (!dirty) return;
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // Debounced username check (500ms)
  const lastCheckedRef = useRef("");
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();

    // Empty → idle (will fall back to auto-generated)
    if (!trimmed) {
      setUsernameStatus({ kind: "idle" });
      return;
    }

    // Unchanged from saved value → treat as available (no request needed)
    if (trimmed === initial.username.toLowerCase()) {
      setUsernameStatus({ kind: "available" });
      return;
    }

    // Skip if already checked same value
    if (lastCheckedRef.current === trimmed) return;

    setUsernameStatus({ kind: "checking" });

    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/user/check-username?u=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        lastCheckedRef.current = trimmed;

        if (data.available === true) {
          setUsernameStatus({ kind: "available" });
        } else if (data.reason?.includes("Invalid") || data.reason?.includes("short") || data.reason?.includes("long")) {
          setUsernameStatus({ kind: "invalid", reason: data.reason });
        } else {
          setUsernameStatus({ kind: "taken", reason: data.reason ?? "Username is taken" });
        }
      } catch {
        setUsernameStatus({ kind: "idle" });
      }
    }, 500);

    return () => clearTimeout(t);
  }, [username, initial.username]);

  const usernameBlocked =
    usernameStatus.kind === "taken" || usernameStatus.kind === "invalid";

  const bioOver = bio.length > BIO_MAX;

    async function uploadFile(file: File, kind: "avatar" | "cover") {
    const setUploading =
      kind === "avatar" ? setUploadingAvatar : setUploadingCover;
    const setUrl = kind === "avatar" ? setImage : setCoverImage;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/user/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Upload failed.", "error");
        return;
      }
      setUrl(data.url);
      toast(
        kind === "avatar" ? "Avatar uploaded." : "Cover uploaded.",
        "success"
      );
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  }

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void uploadFile(f, "avatar");
    e.target.value = ""; // allow picking same file again
  }

   function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void uploadFile(f, "cover");
    e.target.value = "";
  }

  async function onSave() {
    if (usernameBlocked || bioOver) return;
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim().toLowerCase() || "",
          bio: bio.trim(),
          image: image.trim(),
          coverImage: coverImage.trim(),
          links,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "Save failed.", "error");
        return;
      }

      toast("Profile updated.", "success");
      await updateSession({}); // {} forces POST → triggers jwt refresh
      const newUsername = data.user?.username ?? username;
      router.push(`/u/${newUsername}`);
      router.refresh();
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    if (dirty && !window.confirm("Discard unsaved changes?")) return;
    router.push(initial.username ? `/u/${initial.username}` : "/dashboard");
  }

  return (
    <div className="min-h-screen">
      {/* Sticky top bar */}
        <div className="sticky top-14 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={initial.username ? `/u/${initial.username}` : "/dashboard"}
              className="text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              ← Back
            </Link>
            <span className="truncate text-sm font-semibold">Edit profile</span>
            {dirty && (
              <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 sm:inline-block">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-md border border-border px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !dirty || usernameBlocked || bioOver}
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Edit profile
          </h1>
          <p className="mt-1 text-sm text-muted">
            Make your profile look the way you want.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {/* LEFT — Live preview */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Live preview
            </div>
            <ProfileHeader
              name={name || null}
              username={username || null}
              email={email}
              image={image || null}
              bio={bio || null}
              coverImage={coverImage || null}
              links={links.length > 0 ? links : null}
              isOwner={false}
            />
          </div>

          {/* RIGHT — Form */}
          <div className="space-y-6">
            {/* Avatar */}
            <section className="rounded-xl border border-border bg-background p-5">
              <h2 className="mb-3 text-sm font-semibold">Avatar</h2>
              <div className="space-y-2">
                               <p className="text-xs text-muted">
                  Recommended: 400 × 400 · PNG / JPEG / WebP / AVIF · max 5 MB
                </p>
                               <div className="flex items-center gap-2">
                  <label
                    htmlFor="avatar-upload"
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent ${
                      uploadingAvatar ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {uploadingAvatar ? "Uploading…" : "Upload from computer"}
                  </label>
                                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={onPickAvatar}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="ml-auto text-xs text-muted hover:text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Basic info */}
            <section className="rounded-xl border border-border bg-background p-5">
              <h2 className="mb-3 text-sm font-semibold">Profile details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                    Display name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    placeholder="Your name"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
                    Username
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                      @
                    </span>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                            .slice(0, 30)
                        )
                      }
                      placeholder="your-username"
                      className={cn(
                        "w-full rounded-md border bg-background py-2 pl-7 pr-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40",
                        usernameStatus.kind === "taken" || usernameStatus.kind === "invalid"
                          ? "border-red-500"
                          : usernameStatus.kind === "available"
                            ? "border-green-500/60"
                            : "border-border focus:border-accent"
                      )}
                    />
                  </div>
                  <div className="mt-1.5 min-h-4.5 text-xs">
                    {usernameStatus.kind === "checking" && (
                      <span className="text-muted">Checking…</span>
                    )}
                    {usernameStatus.kind === "available" && (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ Username is available
                      </span>
                    )}
                    {usernameStatus.kind === "taken" && (
                      <span className="text-red-600 dark:text-red-400">
                        ✗ {usernameStatus.reason}
                      </span>
                    )}
                    {usernameStatus.kind === "invalid" && (
                      <span className="text-red-600 dark:text-red-400">
                        ✗ {usernameStatus.reason}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="mb-1.5 block text-sm font-medium">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell readers a bit about yourself."
                    className={cn(
                      "w-full resize-none rounded-md border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40",
                      bioOver ? "border-red-500" : "border-border focus:border-accent"
                    )}
                  />
                  <div className="mt-1 text-right text-xs">
                    <span className={cn(bioOver ? "text-red-500" : "text-muted")}>
                      {bio.length} / {BIO_MAX}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Social links */}
            <section className="rounded-xl border border-border bg-background p-5">
              <h2 className="mb-3 text-sm font-semibold">Social links</h2>
              <LinkEditor links={links} onChange={setLinks} />
            </section>

            {/* Cover */}
            <section className="rounded-xl border border-border bg-background p-5">
              <h2 className="mb-3 text-sm font-semibold">Cover image</h2>
              <div className="space-y-2">
                                <p className="text-xs text-muted">
                  Recommended: 1500 × 500 · PNG / JPEG / WebP / AVIF · max 5 MB
                </p>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="cover-upload"
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent hover:text-accent ${
                      uploadingCover ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    {uploadingCover ? "Uploading…" : "Upload from computer"}
                  </label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={onPickCover}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="ml-auto text-xs text-muted hover:text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}