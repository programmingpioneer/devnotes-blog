import crypto from "node:crypto";
import { prisma } from "@/lib/db/client";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;
const GRACE_PERIOD_DAYS = 15;

// ============================================================
// User-facing: create / verify / cancel
// ============================================================

export type CreateDeletionResult =
  | { status: "ok"; code: string }
  | { status: "already_pending" }
  | { status: "is_last_admin" };

/**
 * Creates (or replaces) a pending deletion request for the given user.
 * Generates a fresh 6-digit code and emails-ready result.
 */
export async function createDeletionRequest(
  userId: string
): Promise<CreateDeletionResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user) return { status: "already_pending" };

  // Guard: block if user is the last ADMIN
  if (user.role === "ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });
    if (adminCount <= 1) return { status: "is_last_admin" };
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  const codeExpires = new Date(Date.now() + CODE_TTL_MS);
  const scheduledFor = new Date(
    Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.accountDeletionRequest.upsert({
    where: { userId },
    create: {
      userId,
      code,
      codeExpires,
      scheduledFor,
      status: "PENDING",
      attempts: 0,
    },
    update: {
      code,
      codeExpires,
      scheduledFor,
      status: "PENDING",
      attempts: 0,
      cancelledAt: null,
      requestedAt: new Date(),
    },
  });

  return { status: "ok", code };
}

export type VerifyDeletionResult =
  | { status: "ok" }
  | { status: "not_found" }
  | { status: "expired" }
  | { status: "mismatch"; attemptsLeft: number }
  | { status: "too_many_attempts" };

/**
 * Verifies the 6-digit code. On success, sets status to "SCHEDULED"
 * (confirmed — countdown running) and removes the code from the row.
 */
export async function verifyDeletionCode(
  userId: string,
  code: string,
  force = false
): Promise<VerifyDeletionResult> {
  const req = await prisma.accountDeletionRequest.findUnique({
    where: { userId },
  });

  if (!req || req.status !== "PENDING") return { status: "not_found" };

  if (req.codeExpires < new Date()) {
    return { status: "expired" };
  }

  if (req.attempts >= MAX_ATTEMPTS) {
    return { status: "too_many_attempts" };
  }

  if (req.code !== code) {
    const nextAttempts = req.attempts + 1;

    if (nextAttempts >= MAX_ATTEMPTS) {
      await prisma.accountDeletionRequest.update({
        where: { userId },
        data: { attempts: nextAttempts },
      });
      return { status: "too_many_attempts" };
    }

    await prisma.accountDeletionRequest.update({
      where: { userId },
      data: { attempts: nextAttempts },
    });

    return {
      status: "mismatch",
      attemptsLeft: MAX_ATTEMPTS - nextAttempts,
    };
  }

    // Success — schedule it
  await prisma.accountDeletionRequest.update({
    where: { userId },
    data: {
      status: "SCHEDULED",
      code: "", // wipe code after use
      codeExpires: new Date(0),
      ...(force ? { forceRequestedAt: new Date() } : {}),
    },
  });

  return { status: "ok" };
}

/**
 * Cancels a PENDING or SCHEDULED deletion request.
 * Returns true if a request was actually cancelled.
 */
export async function cancelDeletionRequest(
  userId: string
): Promise<boolean> {
  const req = await prisma.accountDeletionRequest.findUnique({
    where: { userId },
  });
  if (!req) return false;
  if (req.status === "CANCELLED" || req.status === "COMPLETED") return false;

  await prisma.accountDeletionRequest.update({
    where: { userId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  return true;
}

// ============================================================
// Admin-facing
// ============================================================

export type DeletionRequestRow = {
  id: string;
  userId: string;
  name: string | null;
  email: string;
  username: string | null;
  requestedAt: Date;
  scheduledFor: Date;
  status: string;
  forceRequestedAt: Date | null;
  daysRemaining: number;
  canDeleteNow: boolean;
  postCount: number;
};

/**
 * Lists all non-cancelled deletion requests for the admin page,
 * with computed days remaining and post count.
 */
export async function listDeletionRequests(): Promise<DeletionRequestRow[]> {
  const rows = await prisma.accountDeletionRequest.findMany({
    where: { status: "SCHEDULED" },
    orderBy: { scheduledFor: "asc" },
      select: {
      id: true,
      userId: true,
      requestedAt: true,
      scheduledFor: true,
      status: true,
      forceRequestedAt: true,
      user: {
        select: {
          name: true,
          email: true,
          username: true,
          _count: { select: { posts: true } },
        },
      },
    },
  });

  const now = Date.now();

  return rows.map((r) => {
    const msLeft = r.scheduledFor.getTime() - now;
    const daysRemaining = Math.max(
      0,
      Math.ceil(msLeft / (24 * 60 * 60 * 1000))
    );
    return {
      id: r.id,
      userId: r.userId,
      name: r.user.name,
      email: r.user.email,
      username: r.user.username,
      requestedAt: r.requestedAt,
      scheduledFor: r.scheduledFor,
      status: r.status,
      forceRequestedAt: r.forceRequestedAt,
      daysRemaining,
      canDeleteNow: daysRemaining === 0,
      postCount: r.user._count.posts,
    };
  });
}

export type PurgeResult =
  | { status: "ok" }
  | { status: "not_found" }
  | { status: "already_completed" };

/**
 * Permanently deletes a user and all related data.
 * Only allowed when the grace period has passed OR admin bypasses.
 * Cascade rules handle: sessions, accounts, passwordResetTokens, posts, tags.
 */
export async function permanentlyDeleteUser(
  userId: string,
  adminId: string,
  bypass = false
): Promise<PurgeResult> {
  const req = await prisma.accountDeletionRequest.findUnique({
    where: { userId },
  });

  if (!req) return { status: "not_found" };
  if (req.status === "COMPLETED") return { status: "already_completed" };

  if (!bypass && !req.forceRequestedAt && req.scheduledFor > new Date()) {
    return { status: "not_found" }; // still in grace period (unless user requested force)
  }

  await prisma.$transaction(async (tx) => {
    // Mark request completed first (audit)
    await tx.accountDeletionRequest.update({
      where: { userId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        completedBy: adminId,
      },
    });

    // Delete user (cascade removes posts, sessions, accounts, passwordResets,
    // and this deletionRequest row via onDelete: Cascade)
    await tx.user.delete({ where: { id: userId } });
  });

  return { status: "ok" };
}

// ============================================================
// Login hook
// ============================================================

/**
 * Called on every successful login. If a pending/scheduled request exists,
 * cancel it and return info needed to send a welcome-back email.
 */
export type LoginRestoreResult =
  | { restored: false }
  | { restored: true; requestedAt: Date; cancelledAt: Date };

export async function checkAndCancelOnLogin(
  userId: string
): Promise<LoginRestoreResult> {
  const req = await prisma.accountDeletionRequest.findUnique({
    where: { userId },
  });

  if (!req) return { restored: false };
  if (req.status !== "PENDING" && req.status !== "SCHEDULED") {
    return { restored: false };
  }

  const cancelledAt = new Date();

  await prisma.accountDeletionRequest.update({
    where: { userId },
    data: { status: "CANCELLED", cancelledAt },
  });

  return {
    restored: true,
    requestedAt: req.requestedAt,
    cancelledAt,
  };
}
