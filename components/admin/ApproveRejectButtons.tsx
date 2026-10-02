"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useToast } from "@/components/shared/Toast";

type ApproveRejectButtonsProps = {
  postId: string;
  postTitle: string;
};

export default function ApproveRejectButtons({
  postId,
  postTitle,
}: ApproveRejectButtonsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [approving, setApproving] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const noteValid = note.trim().length >= 10 && note.trim().length <= 1000;

  async function handleApprove() {
    if (approving) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}/approve`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data?.error ?? "Approve failed", "error");
        return;
      }
      toast(`"${postTitle}" approved and published`, "success");
      router.refresh();
    } catch {
      toast("Network error while approving", "error");
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!noteValid || rejecting) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data?.error ?? "Reject failed", "error");
        return;
      }
      toast(`"${postTitle}" rejected`, "success");
      setRejectOpen(false);
      setNote("");
      router.refresh();
    } catch {
      toast("Network error while rejecting", "error");
    } finally {
      setRejecting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={approving}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {approving ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => setRejectOpen(true)}
          className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
        >
          Reject
        </button>
      </div>

      <ConfirmDialog
        open={rejectOpen}
        title="Reject this post?"
        description="The author will be notified by email and can edit + resubmit."
        confirmLabel={rejecting ? "Rejecting…" : "Reject"}
        cancelLabel="Cancel"
        destructive
        onCancel={() => {
          if (rejecting) return;
          setRejectOpen(false);
          setNote("");
        }}
        onConfirm={handleReject}
      >
        <label
          htmlFor={`reject-note-${postId}`}
          className="block text-xs font-medium text-muted"
        >
          Reviewer note (10–1000 characters)
        </label>
        <textarea
          id={`reject-note-${postId}`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Explain what needs to change…"
          className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent"
        />
        <p className="mt-1 text-[11px] text-muted">
          {note.trim().length}/1000
          {note.trim().length > 0 && note.trim().length < 10
            ? " · need at least 10"
            : ""}
        </p>
      </ConfirmDialog>
    </>
  );
}