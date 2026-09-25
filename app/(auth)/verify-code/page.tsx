"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/auth/AuthCard";
import { useToast } from "@/components/shared/Toast";
import { cn } from "@/lib/utils";

const RESEND_COOLDOWN_S = 60;

function VerifyCodeContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const email = params.get("email") ?? "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [resending, setResending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function onCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setError(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (code.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        setCode("");
        inputRef.current?.focus();
        return;
      }

      toast("Email verified. Please sign in.", "success");
      router.push("/login?verified=true");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not resend code.");
        return;
      }

      toast("New code sent. Check your inbox.", "success");
      setCooldown(RESEND_COOLDOWN_S);
      setCode("");
      inputRef.current?.focus();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return (
      <AuthCard title="Invalid link" subtitle="We couldn't find your email.">
        <Link
          href="/register"
          className="block w-full rounded-md bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Back to register
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email}`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium">
            Verification code
          </label>
          <input
            ref={inputRef}
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={onCodeChange}
            placeholder="000000"
            className={cn(
              "w-full rounded-md border bg-background px-4 py-3 text-center text-2xl font-semibold tracking-[0.4em] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40",
              error
                ? "border-red-500"
                : "border-border focus:border-accent"
            )}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>

        <div className="text-center text-sm text-muted">
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            onClick={onResend}
            disabled={cooldown > 0 || resending}
            className="font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          >
            {resending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={null}>
      <VerifyCodeContent />
    </Suspense>
  );
}