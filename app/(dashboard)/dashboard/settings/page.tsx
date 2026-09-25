"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/shared/Container";
import Section from "@/components/shared/Section";
import FormField from "@/components/auth/FormField";
import { useToast } from "@/components/shared/Toast";
import DangerZone from "@/components/settings/DangerZone";
import { cn } from "@/lib/utils";

function ShieldIcon() {
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
      className="text-accent"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function strengthOf(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (pw.length === 0) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  const capped = Math.min(score, 3) as 0 | 1 | 2 | 3;
  const label = ["", "Weak", "Fair", "Strong"][capped];
  return { score: capped, label };
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const { score, label } = strengthOf(next);
  const mismatch = confirm.length > 0 && next !== confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (next !== confirm) {
      toast("New passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "Change failed.", "error");
        return;
      }

      toast("Password changed successfully.", "success");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto max-w-xl">
          <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full border border-border bg-muted/5 p-2">
                <ShieldIcon />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Security settings
                </h1>
                <p className="text-sm text-muted">
                  Update your password to keep your account secure.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <FormField
                  label="Current password"
                  name="current"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Enter your current password"
                />
                <p className="mt-1.5 text-xs text-muted">
                  Forgot your current password?{" "}
                  <Link
                    href="/forgot-password"
                    className="font-medium text-accent hover:underline"
                  >
                    Reset it via email
                  </Link>
                  .
                </p>
              </div>

              <div>
                <FormField
                  label="New password"
                  name="next"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  placeholder="At least 8 characters"
                />
                {next.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i <= score
                              ? score === 1
                                ? "bg-red-500"
                                : score === 2
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                              : "bg-border",
                          )}
                        />
                      ))}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        score === 1
                          ? "text-red-500"
                          : score === 2
                            ? "text-amber-500"
                            : "text-green-500",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                )}
              </div>

              <FormField
                label="Repeat new password"
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                error={mismatch ? "Passwords do not match" : undefined}
              />

              <button
                type="submit"
                disabled={loading || mismatch}
                className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Updating..." : "Change password"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6">
          <DangerZone />
        </div>
      </Section>
    </Container>
  );
}
