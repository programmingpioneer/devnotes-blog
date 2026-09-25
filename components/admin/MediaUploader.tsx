"use client";

import { useRef, useState } from "react";
import { useToast } from "@/components/shared/Toast";

export type UploadResult = {
  key: string;
  url: string;
};

export default function MediaUploader({
  onUploaded,
}: {
  onUploaded?: (result: UploadResult) => void;
}) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [lastUpload, setLastUpload] = useState<UploadResult | null>(null);

  async function uploadFile(file: File) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error ?? "Upload failed.", "error");
        return;
      }

      const data = (await res.json()) as UploadResult;
      setLastUpload({ key: data.key, url: data.url });
      toast("Image uploaded.", "success");
      onUploaded?.({ key: data.key, url: data.url });
    } catch {
      toast("Network error.", "error");
    } finally {
      setBusy(false);
    }
  }

  function onPickChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    // Reset input value so picking the same file again re-triggers change
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  async function copyUrl() {
    if (!lastUpload) return;
    try {
      await navigator.clipboard.writeText(lastUpload.url);
      toast("URL copied.", "success");
    } catch {
      toast("Copy failed — clipboard blocked.", "error");
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !busy && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/60"
        } ${busy ? "cursor-wait opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={onPickChange}
          disabled={busy}
          className="hidden"
        />
        <p className="text-sm font-medium">
          {busy ? "Uploading…" : "Drop an image here, or click to select"}
        </p>
        <p className="mt-1 text-xs text-muted">
          PNG · JPEG · WebP · AVIF — max 5 MB
        </p>
      </div>

      {lastUpload && (
        <div className="rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center gap-3">
            {/* Plain <img> — R2 public URL, no Next/Image optimization needed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lastUpload.url}
              alt="Uploaded"
              className="h-16 w-16 rounded-md border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted">{lastUpload.key}</p>
              <p className="mt-1 truncate text-sm">{lastUpload.url}</p>
            </div>
            <button
              type="button"
              onClick={copyUrl}
              className="rounded-md border border-border px-3 py-1 text-xs transition-colors hover:border-accent hover:text-accent"
            >
              Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}