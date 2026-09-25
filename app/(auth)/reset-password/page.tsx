"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import FormField from "@/components/auth/FormField";
import { useToast } from "@/components/shared/Toast";
import { cn } from "@/lib/utils";

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

function LockIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();

  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const { score, label } = strengthOf(password);
  const mismatch = confirm.length > 0 && password !== confirm;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirm) {
      toast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast(data.error ?? "Reset failed.", "error");
        return;
      }

      toast("Password reset. Sign in now.", "success");
      router.push("/login?reset=true");
    } catch {
      toast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthCard
        title="Invalid link"
        subtitle="This password reset link is missing a token."
      >
        <Link
          href="/forgot-password"
          className="block w-full rounded-md bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a strong password you haven't used before."
    >
      <div className="mb-6 flex justify-center">
        <div className="rounded-full border border-border bg-muted/5 p-3">
          <LockIcon />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <FormField
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          {password.length > 0 && (
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
                        : "bg-border"
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
                      : "text-green-500"
                )}
              >
                {label}
              </span>
            </div>
          )}
        </div>

        <FormField
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter your password"
          error={mismatch ? "Passwords do not match" : undefined}
        />

        <button
          type="submit"
          disabled={loading || mismatch}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}