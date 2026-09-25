"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { useToast } from "@/components/shared/Toast";

type Step = "confirm" | "code" | "done";

function WarningIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-red-500"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DangerZone() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("confirm");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  // Focus the code input when the user enters the code step.
  useEffect(() => {
    if (step === "code") {
      codeRef.current?.focus();
    }
  }, [step]);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // ESC closes the modal only during the confirm step (not mid-verify).
  useEffect(() => {
    if (!open || step !== "confirm" || busy) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, busy]);

  function resetState() {
    setStep("confirm");
    setCode("");
    setAttemptsLeft(null);
    setScheduledFor(null);
  }

  function closeModal() {
    setOpen(false);
    window.setTimeout(resetState, 200);
  }

  async function requestDeletion() {
    setBusy(true);
    try {
      const res = await fetch("/api/user/delete/request", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Request failed.", "error");
        return;
      }
      toast(data.message ?? "Check your inbox for the code.", "success");
      setStep("code");
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast("Please enter a 6-digit code.", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/user/delete/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && typeof data.attemptsLeft === "number") {
          setAttemptsLeft(data.attemptsLeft);
          toast(
            `${data.error} ${data.attemptsLeft} attempt(s) left.`,
            "error"
          );
        } else {
          toast(data.error ?? "Verification failed.", "error");
        }
        return;
      }
      setScheduledFor(data.scheduledFor ?? null);
      setStep("done");
      // Auto sign-out after the user has seen the confirmation message.
      window.setTimeout(() => {
        void signOut({ callbackUrl: "/" });
      }, 2500);
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function cancelPending() {
    setBusy(true);
    try {
      const res = await fetch("/api/user/delete/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Cancel failed.", "error");
        return;
      }
      toast("Deletion request cancelled.", "success");
      closeModal();
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full border border-red-500/30 bg-red-500/10 p-2">
            <WarningIcon />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-red-500">
              Danger zone
            </h2>
            <p className="text-sm text-muted">
              Irreversible actions. Proceed with caution.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Delete my account</p>
            <p className="mt-1 text-xs text-muted">
              Your account will be scheduled for deletion after 15 days.
              Logging in before then cancels the request.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-md border border-red-500/40 bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Delete account
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="deletion-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && step === "confirm" && !busy) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl">
            {step === "confirm" && (
              <>
                <h2
                  id="deletion-modal-title"
                  className="text-lg font-semibold tracking-tight"
                >
                  Delete your account?
                </h2>
                <p className="mt-2 text-sm text-muted">
                  We will email you a 6-digit code to confirm. Once verified,
                  your account is scheduled for permanent deletion in{" "}
                  <strong>15 days</strong>.
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  <li>- All your posts will be deleted</li>
                  <li>- Your profile and data will be removed</li>
                  <li>- You can cancel by logging in before then</li>
                </ul>

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
                    onClick={requestDeletion}
                    disabled={busy}
                    className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {busy ? "Sending..." : "Send code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={cancelPending}
                  disabled={busy}
                  className="mt-4 w-full text-center text-xs text-muted underline-offset-4 hover:underline hover:text-foreground disabled:opacity-60"
                >
                  Already requested? Cancel pending request
                </button>
              </>
            )}

            {step === "code" && (
              <form onSubmit={verifyCode}>
                <h2
                  id="deletion-modal-title"
                  className="text-lg font-semibold tracking-tight"
                >
                  Enter verification code
                </h2>
                <p className="mt-2 text-sm text-muted">
                  We sent a 6-digit code to your email. It expires in 15
                  minutes.
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="deletion-code"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Code
                  </label>
                  <input
                    id="deletion-code"
                    ref={codeRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    disabled={busy}
                    placeholder="123456"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-center font-mono text-lg tracking-[0.5em] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
                  />
                  {attemptsLeft !== null && (
                    <p className="mt-2 text-xs text-red-500">
                      {attemptsLeft} attempt(s) remaining
                    </p>
                  )}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("confirm");
                      setCode("");
                      setAttemptsLeft(null);
                    }}
                    disabled={busy}
                    className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/5 disabled:opacity-60"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={busy || code.length !== 6}
                    className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Verifying..." : "Verify"}
                  </button>
                </div>
              </form>
            )}

            {step === "done" && (
              <>
                <h2
                  id="deletion-modal-title"
                  className="text-lg font-semibold tracking-tight"
                >
                  Account scheduled for deletion
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Your account is scheduled for permanent deletion on{" "}
                  <strong>{formatDate(scheduledFor)}</strong>. A confirmation
                  email has been sent.
                </p>
                <p className="mt-2 text-sm text-muted">
                  Logging in before that date will cancel the request
                  automatically.
                </p>
                <p className="mt-4 text-sm font-medium text-accent">
                  Signing you out...
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}