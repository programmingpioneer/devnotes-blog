"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/shared/Toast";

export type SerializedDeletionRequest = {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  username: string | null;
  requestedAt: string;
  scheduledFor: string;
  status: string;
  forceRequestedAt: string | null;
  daysRemaining: number;
  postCount: number;
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

type ModalMode = "force" | "normal";

export default function DeletionRequestTable({
  requests: initialRequests,
}: {
  requests: SerializedDeletionRequest[];
}) {
  const { toast } = useToast();
  const [requests, setRequests] = useState(initialRequests);
  const [selected, setSelected] = useState<SerializedDeletionRequest | null>(
    null,
  );
  const [mode, setMode] = useState<ModalMode>("normal");
  const [emailInput, setEmailInput] = useState("");
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected) {
      emailRef.current?.focus();
    }
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [selected]);

  useEffect(() => {
    if (!selected || busy) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, busy]);

  function openModal(req: SerializedDeletionRequest, m: ModalMode) {
    setSelected(req);
    setMode(m);
    setEmailInput("");
  }

  function closeModal() {
    setSelected(null);
    setEmailInput("");
  }

  async function confirmPurge() {
    if (!selected) return;
    if (emailInput !== selected.email) return;

    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/deletion-requests/${selected.userId}/purge`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bypass: mode === "force" }),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "Delete failed.", "error");
        return;
      }

      toast("User permanently deleted.", "success");
      setRequests((prev) => prev.filter((r) => r.userId !== selected.userId));
      closeModal();
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="mt-4 text-base font-semibold tracking-tight">All clear</p>
        <p className="mt-1 text-sm text-muted">No pending deletion requests.</p>
        <p className="mx-auto mt-2 max-w-sm text-xs text-muted">
          Users who request account deletion will appear here with a 15-day
          grace period.
        </p>
      </div>
    );
  }
  const emailMatches = selected ? emailInput === selected.email : false;

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/5 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Email
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Requested
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Scheduled
              </th>
              <th className="px-4 py-3 font-medium">Days left</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">
                Posts
              </th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {requests.map((req) => (
              <tr key={req.id} className="transition-colors hover:bg-muted/5">
                <td className="px-4 py-3">
                  <div className="font-medium">{req.name ?? "—"}</div>
                  {req.username && (
                    <div className="mt-0.5 text-xs text-muted">
                      @{req.username}
                    </div>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">
                  {req.email}
                </td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">
                  {formatDate(req.requestedAt)}
                </td>
                <td className="hidden px-4 py-3 text-muted lg:table-cell">
                  {formatDate(req.scheduledFor)}
                </td>
                <td className="px-4 py-3 text-muted">
                  {req.daysRemaining === 0
                    ? "Ready"
                    : `${req.daysRemaining} ${
                        req.daysRemaining === 1 ? "day" : "days"
                      }`}
                </td>
                                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {req.daysRemaining === 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-red-500"
                          aria-hidden="true"
                        />
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted">
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-muted"
                          aria-hidden="true"
                        />
                        Pending
                      </span>
                    )}
                    {req.forceRequestedAt && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500"
                        title={`User requested immediate deletion on ${formatDate(req.forceRequestedAt)}`}
                      >
                        Force requested
                      </span>
                    )}
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted sm:table-cell">
                  {req.postCount}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openModal(req, "force")}
                      className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                    >
                      Force delete now
                    </button>
                    <button
                      type="button"
                      onClick={() => openModal(req, "normal")}
                      disabled={req.daysRemaining > 0 && !req.forceRequestedAt}
                      title={
                        req.daysRemaining > 0 && !req.forceRequestedAt
                          ? `Available in ${req.daysRemaining} day(s), or use "Force delete now" to override`
                          : undefined
                      }
                      className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Delete permanently
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="purge-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) closeModal();
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            <h2
              id="purge-modal-title"
              className="text-lg font-semibold tracking-tight"
            >
              {mode === "force" ? "Force delete?" : "Delete permanently?"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {mode === "force"
                ? "This will bypass the 15-day grace period and permanently delete this user immediately."
                : "This user will be permanently deleted along with all their data."}
            </p>

            <div className="mt-4 rounded-md border border-border bg-muted/5 p-3 text-sm">
              <div>
                <span className="text-muted">User:</span>{" "}
                <span className="font-medium">
                  {selected.name ?? selected.username ?? selected.email}
                </span>
              </div>
              <div className="mt-1">
                <span className="text-muted">Email:</span>{" "}
                <span className="font-mono text-xs">{selected.email}</span>
              </div>
              <div className="mt-1">
                <span className="text-muted">Posts:</span>{" "}
                <span className="font-medium">{selected.postCount}</span>
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="purge-email"
                className="mb-1.5 block text-sm font-medium"
              >
                Type <span className="font-mono text-xs">{selected.email}</span>{" "}
                to confirm
              </label>
              <input
                id="purge-email"
                ref={emailRef}
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                disabled={busy}
                placeholder={selected.email}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={busy}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/5 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPurge}
                disabled={busy || !emailMatches}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
