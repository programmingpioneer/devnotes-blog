"use client";

import { useEffect, useId, useRef, useState } from "react";
import MediaUploader from "@/components/admin/MediaUploader";

type ImageInsertDialogProps = {
  open: boolean;
  onInsert: (url: string, alt: string) => void;
  onCancel: () => void;
  /** Endpoint for the upload. Passed through to MediaUploader so members
   *  hit /api/user/upload instead of the admin-only route. */
  uploadEndpoint: string;
};

export default function ImageInsertDialog({
  open,
  onInsert,
  onCancel,
  uploadEndpoint,
}: ImageInsertDialogProps) {
  const titleId = useId();
  const altId = useId();
  const altInputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  // Reset internal state each time the dialog opens so a previous upload
  // never leaks into a new insertion.
  useEffect(() => {
    if (!open) return;
    setUrl(null);
    setAlt("");
    // Focus the alt input after paint so the dialog is announced first.
    const t = setTimeout(() => altInputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Escape closes the dialog. Mirrors ConfirmDialog's behaviour.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const canInsert = url !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-xl border border-border bg-background p-5 shadow-lg"
      >
        <h2 id={titleId} className="text-base font-semibold">
          Insert image
        </h2>

        <div className="mt-4 space-y-4">
          <MediaUploader
            onUploaded={(r) => setUrl(r.url)}
            uploadEndpoint={uploadEndpoint}
          />

          <div>
            <label
              htmlFor={altId}
              className="mb-1.5 block text-sm font-medium"
            >
              Alt text (optional)
            </label>
            <input
              ref={altInputRef}
              id={altId}
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image for screen readers"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canInsert}
            onClick={() => url && onInsert(url, alt.trim())}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}