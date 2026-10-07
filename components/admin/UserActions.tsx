"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/Toast";

export default function UserActions({
  userId,
  userName,
  currentRole,
  isSelf,
  postCount,
}: {
  userId: string;
  userName: string;
  currentRole: "USER" | "ADMIN";
  isSelf: boolean;
  postCount: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState<"role" | "delete" | null>(null);

  const roleTooltip = isSelf ? "You cannot change your own role" : undefined;
  const deleteTooltip = isSelf
    ? "You cannot delete yourself"
    : postCount > 0
      ? "User has posts. Reassign or delete their posts first."
      : undefined;

  const deleteDisabled = isSelf || postCount > 0;

  async function onRoleChange(nextRole: "USER" | "ADMIN") {
    if (nextRole === currentRole) return;
    setBusy("role");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error ?? "Role change failed.", "error");
        return;
      }
      toast(`Role updated to ${nextRole}.`, "success");
      router.refresh();
    } catch {
      toast("Network error.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function onDelete() {
    if (!window.confirm(`Delete "${userName}"? This cannot be undone.`)) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data.error ?? "Delete failed.", "error");
        return;
      }
      toast("User deleted.", "success");
      router.refresh();
    } catch {
      toast("Network error.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value as "USER" | "ADMIN")}
        disabled={isSelf || busy !== null}
        title={roleTooltip}
        aria-label="Change role"
        className="rounded-md border border-border bg-transparent px-2 py-1 text-xs transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>

      <button
        type="button"
        onClick={onDelete}
        disabled={deleteDisabled || busy !== null}
        title={deleteTooltip}
        className="rounded-md border border-border px-3 py-1 text-xs text-error transition-colors hover:border-error disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy === "delete" ? "..." : "Delete"}
      </button>
    </div>
  );
}