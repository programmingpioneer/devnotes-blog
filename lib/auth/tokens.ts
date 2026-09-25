import crypto from "node:crypto";
import { prisma } from "@/lib/db/client";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours (legacy link flow)
const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes (6-digit code)
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CODE_ATTEMPTS = 3;

// ============================================================
// LEGACY: link-based verification token (kept for backward compat)
// ============================================================
export async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + VERIFICATION_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  return token;
}

export async function consumeVerificationToken(
  email: string,
  token: string
): Promise<{ identifier: string } | null> {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!record) return null;

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
    return null;
  }

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });

  return { identifier: record.identifier };
}

// ============================================================
// NEW: 6-digit code verification
// ============================================================
export async function createVerificationCode(email: string): Promise<string> {
  // Generate a zero-padded 6-digit code (100000–999999 — never leading zero)
  const code = crypto.randomInt(100000, 1000000).toString();
  const expires = new Date(Date.now() + VERIFICATION_CODE_TTL_MS);

  // One active code per email — invalidate any existing
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires,
      attempts: 0,
    },
  });

  return code;
}

export type ConsumeCodeResult =
  | { status: "ok"; identifier: string }
  | { status: "invalid" }
  | { status: "expired" }
  | { status: "mismatch"; attemptsLeft: number }
  | { status: "too_many_attempts" };

export async function consumeVerificationCode(
  email: string,
  code: string
): Promise<ConsumeCodeResult> {
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  });

  if (!record) return { status: "invalid" };

  // Expired → delete and report
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: record.token } });
    return { status: "expired" };
  }

  // Already out of attempts → invalidate
  if (record.attempts >= MAX_CODE_ATTEMPTS) {
    await prisma.verificationToken.delete({ where: { token: record.token } });
    return { status: "too_many_attempts" };
  }

  // Wrong code → increment attempts
  if (record.token !== code) {
    const nextAttempts = record.attempts + 1;

    if (nextAttempts >= MAX_CODE_ATTEMPTS) {
      await prisma.verificationToken.delete({ where: { token: record.token } });
      return { status: "too_many_attempts" };
    }

    await prisma.verificationToken.update({
      where: { token: record.token },
      data: { attempts: nextAttempts },
    });

    return { status: "mismatch", attemptsLeft: MAX_CODE_ATTEMPTS - nextAttempts };
  }

  // Success → delete the used code
  await prisma.verificationToken.delete({ where: { token: record.token } });

  return { status: "ok", identifier: record.identifier };
}

// ============================================================
// Password reset (unchanged)
// ============================================================
export async function createPasswordResetToken(
  userId: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  await prisma.passwordResetToken.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

export async function consumePasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;

  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record;
}