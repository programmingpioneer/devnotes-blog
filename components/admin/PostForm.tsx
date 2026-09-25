"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/shared/Toast";
import { cn } from "@/lib/utils";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PostPreview from "@/components/admin/PostPreview";
import PostEditorToolbar from "@/components/admin/PostEditorToolbar";
import SaveStatusIndicator, {
  type SaveStatus,
} from "@/components/admin/SaveStatusIndicator";

export type PostFormData = {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  pillar: string;
  status: "DRAFT" | "PUBLISHED";
  tags: string[];
};

type Props = {
  initial?: PostFormData;
  pillars: { slug: string; name: string }[];
};

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

// Idle time after the last edit before autosave fires.
const AUTOSAVE_DELAY_MS = 30_000;

type SaveMode = "draft" | "publish" | "autosave";

export default function PostForm({ initial, pillars }: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [postId, setPostId] = useState<string | null>(initial?.id ?? null);
  const isEdit = Boolean(postId);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [pillar, setPillar] = useState(initial?.pillar ?? "");
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [coverError, setCoverError] = useState(false);

  // ---- Autosave plumbing ----
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(
    initial?.id ? Date.now() : null
  );

  // Snapshot of the form values that were last persisted to the server. Used
  // to skip redundant autosaves and to know when the form is dirty.
  const lastSavedSnapshotRef = useRef<string>(
    JSON.stringify({
      title: initial?.title ?? "",
      excerpt: initial?.excerpt ?? "",
      content: initial?.content ?? "",
      coverImage: initial?.coverImage ?? "",
      pillar: initial?.pillar ?? "",
      tagsInput: (initial?.tags ?? []).join(", "),
    })
  );

  // Pending autosave timer. Held in a ref so mutating it never triggers a render.
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // True while ANY save (manual or autosave) is in flight. Guards against
  // overlapping requests that could create duplicate posts.
  const savingRef = useRef(false);

  function currentSnapshot(): string {
    return JSON.stringify({
      title,
      excerpt,
      content,
      coverImage,
      pillar,
      tagsInput,
    });
  }

  // ---- Markdown import ----
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [pendingImport, setPendingImport] = useState<{
    filename: string;
    content: string;
  } | null>(null);

  function resetFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".md") && !name.endsWith(".markdown")) {
      toast("Only .md and .markdown files are supported.", "error");
      resetFileInput();
      return;
    }

    if (file.size > 500 * 1024) {
      toast("File is too large. Max 500 KB.", "error");
      resetFileInput();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      if (!text.trim()) {
        toast("File is empty.", "error");
        resetFileInput();
        return;
      }
      if (content.trim().length > 0) {
        setPendingImport({ filename: file.name, content: text });
      } else {
        setContent(text);
        toast("Markdown imported.", "success");
        resetFileInput();
      }
    };
    reader.onerror = () => {
      toast("Could not read file. Please try again.", "error");
      resetFileInput();
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleConfirmImport() {
    if (!pendingImport) return;
    setContent(pendingImport.content);
    toast("Markdown imported.", "success");
    setPendingImport(null);
    resetFileInput();
  }

  function handleCancelImport() {
    setPendingImport(null);
    resetFileInput();
  }
  // ---- end Markdown import ----

  // ---- Low-level persist ----
  async function persist(
    mode: SaveMode
  ): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const body: Record<string, unknown> = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      coverImage: coverImage.trim(),
      pillar: pillar.trim(),
      tags,
    };

    if (mode === "publish") {
      body.status = "PUBLISHED";
    } else {
      // Autosave and Save Draft never set status on an existing post, so the
      // server preserves the current DRAFT/PUBLISHED value. On a brand new
      // post we must supply "DRAFT" because status is required by the schema.
      if (!postId) body.status = "DRAFT";
    }

    try {
      const res = await fetch(
        postId ? `/api/admin/posts/${postId}` : "/api/admin/posts",
        {
          method: postId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error ?? "Save failed." };
      }
      return { ok: true, id: postId ?? data.post?.id };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  }

  // After the first successful save on a brand-new post, mirror the newly
  // created id into the URL bar without triggering a Next.js navigation.
  // This keeps the mounted component intact while making a browser refresh
  // land on the edit page instead of starting another draft.
  function adoptNewId(newId: string) {
    setPostId(newId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/admin/posts/${newId}`);
    }
  }

  // ---- Manual save ----
  async function save(action: "DRAFT" | "PUBLISHED") {
    if (savingRef.current) return;

    // Cancel any pending autosave — the manual save supersedes it.
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    savingRef.current = true;
    setSaving(true);

    const result = await persist(action === "PUBLISHED" ? "publish" : "draft");

    if (!result.ok) {
      toast(result.error, "error");
      savingRef.current = false;
      setSaving(false);
      return;
    }

    if (!postId) adoptNewId(result.id);

    lastSavedSnapshotRef.current = currentSnapshot();
    setLastSavedAt(Date.now());
    setSaveStatus("saved");

    if (action === "PUBLISHED") {
      toast(isEdit ? "Post updated." : "Post published.", "success");
      router.push("/admin/posts");
      router.refresh();
      return;
    }

    toast(isEdit ? "Draft saved." : "Draft created.", "success");
    savingRef.current = false;
    setSaving(false);
  }

  // ---- Autosave ----
  async function runAutosave() {
    if (savingRef.current) return;

    const snap = currentSnapshot();
    if (snap === lastSavedSnapshotRef.current) return;

    savingRef.current = true;
    setSaveStatus("saving");

    const result = await persist("autosave");

    if (!result.ok) {
      savingRef.current = false;
      setSaveStatus("error");
      return;
    }

    if (!postId) adoptNewId(result.id);

    lastSavedSnapshotRef.current = snap;
    setLastSavedAt(Date.now());
    setSaveStatus("saved");
    savingRef.current = false;
  }

  // Schedule an autosave whenever any persisted field changes. The cleanup
  // returned by this effect clears the previous timer, so rapid edits keep
  // resetting the 30s window.
  useEffect(() => {
    // Required-field gate: don't schedule autosaves that would fail validation.
    if (!title.trim() || !excerpt.trim() || !content.trim()) return;

    // Nothing changed since the last successful save — no-op.
    if (currentSnapshot() === lastSavedSnapshotRef.current) return;

    setSaveStatus("unsaved");
    autosaveTimerRef.current = setTimeout(() => {
      void runAutosave();
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, excerpt, content, coverImage, pillar, tagsInput]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const action: "DRAFT" | "PUBLISHED" =
      submitter?.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    await save(action);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Composer grid: main column + settings sidebar (sticky on desktop) */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Main composer column */}
        <div className="space-y-5">
          <div className={cn(mobileView === "preview" && "hidden md:block")}>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              required
              placeholder="Your post title"
              className={cn(
                inputClass,
                "py-2.5 text-base font-medium placeholder:font-normal"
              )}
            />
          </div>

          <div className={cn(mobileView === "preview" && "hidden md:block")}>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="excerpt" className="text-sm font-medium">
                Excerpt
              </label>
              <span className="text-xs tabular-nums text-muted">
                {excerpt.length} / 500
              </span>
            </div>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={500}
              required
              rows={2}
              placeholder="One-line summary shown in cards and search results."
              className={cn(inputClass, "resize-none")}
            />
          </div>

          {/* Mobile-only edit/preview toggle */}
          <div className="inline-flex w-full rounded-md border border-border bg-background p-0.5 md:hidden">
            <button
              type="button"
              role="tab"
              aria-selected={mobileView === "edit"}
              onClick={() => setMobileView("edit")}
              className={cn(
                "flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                mobileView === "edit"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-accent"
              )}
            >
              Edit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileView === "preview"}
              onClick={() => setMobileView("preview")}
              className={cn(
                "flex-1 rounded px-3 py-1.5 text-xs font-medium transition-colors",
                mobileView === "preview"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-accent"
              )}
            >
              Preview
            </button>
          </div>

          {/* Editor — hidden on mobile when Preview is active; always shown on md+ */}
          <div className={cn(mobileView === "preview" && "hidden md:block")}>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium">
                Content (Markdown)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-muted transition-colors hover:text-accent"
              >
                Upload Markdown
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown"
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>
            <PostEditorToolbar
              textareaRef={contentRef}
              value={content}
              onChange={setContent}
            />
            <textarea
              ref={contentRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={22}
              placeholder={"# Heading\n\nWrite in Markdown. Code fences supported."}
              className={cn(
                inputClass,
                "font-mono text-xs leading-relaxed rounded-t-none"
              )}
            />
          </div>

          {/* Mobile-only preview */}
          <div className={cn("md:hidden", mobileView === "edit" && "hidden")}>
            <PostPreview title={title} excerpt={excerpt} content={content} />
          </div>
        </div>

        {/* Settings sidebar */}
        <aside
          className={cn(
            "space-y-5 lg:sticky lg:top-24 lg:self-start",
            mobileView === "preview" && "hidden md:block"
          )}
        >
          {/* Organization section */}
          <div className="rounded-xl border border-border bg-background p-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Organization
            </h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="pillar"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Topic
                </label>
                <select
                  id="pillar"
                  value={pillar}
                  onChange={(e) => setPillar(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— No topic —</option>
                  {pillars.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="react, hooks, typescript"
                  className={inputClass}
                />
                <p className="mt-2 text-xs text-muted">
                  Comma-separated. New tags are created automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Cover section */}
          <div className="rounded-xl border border-border bg-background p-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Cover
            </h3>

            <label
              htmlFor="coverImage"
              className="mb-1.5 block text-sm font-medium"
            >
              Cover image URL
            </label>
            <input
              id="coverImage"
              type="url"
              value={coverImage}
              onChange={(e) => {
                setCoverImage(e.target.value);
                setCoverError(false);
              }}
              placeholder="https://..."
              className={inputClass}
            />

            {coverImage && /^https?:\/\//i.test(coverImage) && !coverError && (
              <div className="mt-3 overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-32 w-full object-cover"
                  onError={() => setCoverError(true)}
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Desktop/tablet full-width preview */}
      <div className="hidden md:block">
        <PostPreview title={title} excerpt={excerpt} content={content} />
      </div>

      {/* Sticky action bar — safe-area aware on iOS */}
      <div
        className={cn(
          "sticky flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 p-3 shadow-sm backdrop-blur sm:justify-end",
          mobileView === "preview" && "hidden md:flex"
        )}
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <SaveStatusIndicator status={saveStatus} savedAt={lastSavedAt} />

        <div className="flex items-center gap-2">
          <Link
            href="/admin/posts"
            className="rounded-md border border-border px-3 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent sm:px-4"
          >
            Cancel
          </Link>

          <button
            type="submit"
            name="action"
            value="DRAFT"
            disabled={saving}
            className="px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            type="submit"
            name="action"
            value="PUBLISHED"
            disabled={saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={pendingImport !== null}
        title="Replace content?"
        description={
          pendingImport
            ? `This will replace the current editor content with the contents of ${pendingImport.filename}.`
            : undefined
        }
        confirmLabel="Import"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
      />
    </form>
  );
}