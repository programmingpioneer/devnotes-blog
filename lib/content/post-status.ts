import type { PostStatus } from "@prisma/client";

export type PostActor = "MEMBER" | "ADMIN";

type Transition = {
  from: PostStatus;
  to: PostStatus;
  actor: PostActor;
};

/**
 * Single source of truth for Post status transitions.
 *
 * Any (from, to, actor) triple NOT present here is forbidden.
 * Both member routes (app/api/posts/**) and admin routes
 * (app/api/admin/posts/**) consult this list. Do NOT hardcode
 * status comparisons anywhere else — add the rule here instead.
 */
export const ALLOWED_TRANSITIONS: readonly Transition[] = [
  // Member actions on their own posts
  { from: "DRAFT", to: "PENDING_REVIEW", actor: "MEMBER" },       // submit for review
  { from: "REJECTED", to: "PENDING_REVIEW", actor: "MEMBER" },     // resubmit after edit
  { from: "PENDING_REVIEW", to: "DRAFT", actor: "MEMBER" },        // withdraw

  // Admin moderation actions
  { from: "PENDING_REVIEW", to: "PUBLISHED", actor: "ADMIN" },     // approve
  { from: "PENDING_REVIEW", to: "REJECTED", actor: "ADMIN" },      // reject
];

export function canTransition(
  from: PostStatus,
  to: PostStatus,
  actor: PostActor
): boolean {
  return ALLOWED_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.actor === actor
  );
}