# MEMORY.md — Blog Website Project State

> Running memory of decisions, verified behavior, and current implementation state.
> Update after every significant phase completion.
> Last updated: 2026-09-29 (Force delete + profile upload complete)

### 9.6 — Force Delete + Profile Upload (COMPLETED 2026-09-29)

Files added:
- app/api/user/upload/route.ts                     POST: auth-checked R2 upload (non-admin)
- prisma/migrations/<timestamp>_add_force_requested_at/migration.sql
                                                   adds AccountDeletionRequest.forceRequestedAt

Files changed:
- prisma/schema.prisma                             + forceRequestedAt DateTime? on AccountDeletionRequest
- lib/auth/deletion.ts                             verifyDeletionCode(userId, code, force=false)
                                                   + permanentlyDeleteUser grace guard: skip if forceRequestedAt
- app/api/user/delete/verify/route.ts              zod schema + force flag pass-through
- components/settings/DangerZone.tsx               "Force delete now (skip 15-day wait)" button (confirm step)
                                                   + intentForce state + done-step branch
                                                   + "Immediate deletion requested" message
- components/admin/DeletionRequestTable.tsx        "Force requested" badge + tooltip + enabled Delete permanently
- app/(admin)/admin/deletion-requests/page.tsx     forceRequestedAt serialization
- lib/auth/auth.ts                                 jwt callback: trigger === "update" branch
                                                   + session callback: name + image from token
- app/(dashboard)/dashboard/edit-profile/EditProfileForm.tsx
                                                   sticky topbar: top-14 z-20 (was top-0 z-30)
                                                   + file upload buttons (avatar + cover)
                                                   + URL inputs REMOVED (upload-only UX)
                                                   + useSession().update({}) on save

Business rules (Force Delete):
| Rule | Behavior |
|---|---|
| User "Force delete now" | Requires 6-digit code (session-hijack protection) |
| Code verify + force=true | Sets status SCHEDULED + forceRequestedAt = now |
| Admin sees force user | "Force requested" badge; Delete permanently enabled (even during grace) |
| Admin permanent delete on forced | permanentlyDeleteUser bypass guard skips grace check |
| User logs in after force | checkAndCancelOnLogin still cancels (login-cancel overrides force) |

Business rules (Profile Upload):
| Rule | Response |
|---|---|
| Auth required | 401 (via auth() + NextResponse) |
| No file / wrong field | 400 |
| Unsupported MIME | 400 |
| File > 5 MB | 400 |
| R2 error | 500 (server-logged) |
| Session refresh after save | useSession().update({}) → jwt trigger:"update" → fresh DB fetch |

Verified 2026-09-29:
- npx tsc --noEmit: 0 errors
- Force flow: user force → code → verify → DB forceRequestedAt set
- Admin: force badge visible + Delete permanently enabled
- Upload: avatar/cover from computer → R2 URL → preview → save → navbar avatar updates without logout
- Sticky topbar: sticks under navbar (top-14), no overlap on scroll
- updateSession({}) with empty object → forces POST → triggers jwt refresh (critical fix)

Design decisions:
- Force requires code verification (not just login) — prevents session hijack abuse
- Force button on confirm step (not done step) — linear flow, single state var
- URL inputs removed entirely — upload-only matches real-world UX (GitHub/Instagram)
- useSession().update({}) with explicit {} arg — NextAuth v5 update() without arg does GET, not POST; only POST fires trigger:"update"
- Grace bypass via forceRequestedAt flag — server is source of truth, not client intent

---
### 9.5 — Account Deletion (COMPLETED 2026-09-24)

Files added:
- lib/auth/deletion.ts                              createDeletionRequest, verifyDeletionCode,
                                                    cancelDeletionRequest, listDeletionRequests,
                                                    permanentlyDeleteUser, checkAndCancelOnLogin
- lib/email/templates/deletion-code.tsx             6-digit code email
- lib/email/templates/deletion-scheduled.tsx        user confirmation + scheduledFor
- lib/email/templates/deletion-admin.tsx            admin notification (ADMIN_EMAIL)
- lib/email/templates/account-restored.tsx          welcome-back on login-cancel
- app/api/user/delete/request/route.ts              POST: create request + send code
- app/api/user/delete/verify/route.ts               POST: verify code -> SCHEDULED
- app/api/user/delete/cancel/route.ts               POST: cancel pending
- app/api/admin/deletion-requests/route.ts          GET: list PENDING + SCHEDULED
- app/api/admin/deletion-requests/[userId]/purge/route.ts  POST: purge { bypass? }
- app/(admin)/admin/deletion-requests/page.tsx      server list page
- components/settings/DangerZone.tsx                user-side danger zone + modal
- components/admin/DeletionRequestTable.tsx         admin table + purge modal

Files changed:
- prisma/schema.prisma                              + AccountDeletionRequest
                                                    Post.author onDelete Restrict -> Cascade
- lib/auth/auth.ts                                  login hook: checkAndCancelOnLogin(user.id)
- components/admin/AdminNav.tsx                     + "Deletions" link (between Users, Media)
- app/(dashboard)/dashboard/settings/page.tsx       + <DangerZone /> below password card

Schema (AccountDeletionRequest):
- id (cuid PK), userId (unique FK -> User cascade), code, codeExpires,
  attempts (default 0), requestedAt, scheduledFor, status (PENDING|SCHEDULED|COMPLETED),
  cancelledAt, completedAt, completedBy
- Post.author FK: Restrict -> Cascade  (deleting user removes their posts)

Business rules:
| Rule | Behavior |
|---|---|
| Request deletion | Emails 6-digit code, expires 15 min, max 3 attempts |
| Verify code | Sets scheduledFor = now + 15 days, status SCHEDULED |
| Login during grace | Auto-cancels + fires welcome-back email (fire-and-forget) |
| Admin bypass | POST purge { bypass: true } deletes immediately |
| Admin normal | POST purge { bypass: false } only when daysRemaining = 0 |
| Last admin | Blocked at request time (409) |
| Cascade | User delete removes posts, sessions, accounts, passwordResets, request row |

Verified 2026-09-24:
- npx tsc --noEmit: 0 errors
- User flow: request -> code email -> verify -> SCHEDULED + admin email
- Admin list: /admin/deletion-requests renders table (empty state OK)
- Nav: "Deletions" link visible + highlights on activation
- Force delete modal: type-email gate; Delete permanently disabled while daysRemaining > 0
- Prisma Client regenerated (npx prisma generate) after schema change

Design decisions:
- Modal inline in DangerZone.tsx / DeletionRequestTable.tsx (single-use; no shared Modal component yet)
- signOut from next-auth/react (mirrors login page signIn pattern)
- Login hook: DB restore awaited (must commit before session), email fire-and-forget
- Dates serialized to ISO strings at server->client boundary in admin page
- Delete permanently vs Force delete now: Force = emergency bypass, always enabled

---

### 9.4.6 — R2 + Media (COMPLETED 2026-09-24)

Files:
- lib/storage/r2.ts                       R2 S3 client + upload/delete/validate
- app/api/admin/upload/route.ts           POST upload handler
- components/admin/MediaUploader.tsx      Client drag-drop uploader
- app/(admin)/admin/media/page.tsx        Upload-only media page

Implementation:
- Lazy singleton S3Client (first-use instantiation, not module load)
- validateImage() pure: MIME whitelist (png/jpeg/webp/avif) + 5 MB cap
- uploadImage() returns { key: "uploads/<uuid>.<ext>", url }
- deleteImage() guarded: only uploads/ prefix deletable
- Runtime: nodejs (required for @aws-sdk/client-s3 + node:crypto)
- <img> not next/image (admin thumbnails, no remotePatterns config needed)

Env vars (.env):
- R2_ACCOUNT_ID
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- R2_BUCKET_NAME=blog-web
- R2_PUBLIC_URL=https://pub-<...>.r2.dev

Business rules:
| Rule | Response |
|---|---|
| Admin only | requireAdmin() redirect (302) |
| No file / wrong form field | 400 |
| Unsupported MIME | 400 |
| File > 5 MB | 400 |
| R2 error (network/auth) | 500 (details server-logged) |

Verified 2026-09-24:
- npx tsc --noEmit: 0 errors
- Upload PNG -> key + public URL displayed
- Public URL (pub-*.r2.dev) renders image in new tab
- R2 dashboard: uploads/ folder contains file

Design decisions:
- Upload-only page (no listing/delete) — matches 9.4 scope
- onUploaded callback prop — parent decides URL usage
- Explicit runtime = "nodejs" — prevents accidental edge migration

---

## 1. Project Identity

- Name: `blog-website` (package.json name, version `0.1.0`)
- Type: Full-stack blog — public site + admin panel
- Root: `D:\MY PROJECTS\Blog Website`
- Platform: Windows dev environment (PowerShell-first workflow)

---

## 2. Tech Stack (verified from package-lock.json + configs)

| Layer | Technology | Version / Notes |
|---|---|---|
| Framework | Next.js (App Router) | Turbopack in dev |
| Language | TypeScript | strict mode |
| ORM | Prisma | @prisma/client 6.19.3 |
| Database | MySQL | provider = "mysql" |
| Auth | Auth.js v5 (NextAuth) | role exposed on session.user |
| Validation | Zod | server-side safeParse |
| Styling | Tailwind CSS | tokens: accent, muted, border |
| Storage | Cloudflare R2 | @aws-sdk/client-s3 3.1136.0 (wired, 9.4.6 complete) |
| Toasts | @/components/shared/Toast | hook: useToast() → { toast } |

---

## 3. Directory Layout (verified via LIST_DIR)

    app/
      (admin)/admin/
        layout.tsx              requireAdmin() wrapper
        page.tsx                Dashboard (stats)
        posts/                  page.tsx, new/, [id]/
        users/                  page.tsx
        media/                  page.tsx (9.4.6)
        deletion-requests/      page.tsx (9.5)
      (auth)/                   login, register, etc.
      (dashboard)/              user dashboard
        dashboard/settings/     page.tsx (+ DangerZone, 9.5)
      (public)/                 public site
      api/
        admin/
          posts/                route.ts (GET/POST), [id]/route.ts (GET/PATCH/DELETE)
          users/                route.ts (GET), [id]/route.ts (PATCH/DELETE)
          upload/               route.ts (POST) - 9.4.6
          deletion-requests/    route.ts (GET), [userId]/purge/route.ts (POST) - 9.5
        user/
          delete/
            request/route.ts    POST create + email code - 9.5
            verify/route.ts     POST verify code -> schedule - 9.5
            cancel/route.ts     POST cancel pending - 9.5
        search/
      u/[username]/             public profile page
      sitemap.ts, robots.ts, rss.xml/

    components/
      admin/                    AdminNav, StatCard, PostTable, PostForm,
                                DeletePostButton, UserTable, UserActions,
                                MediaUploader, DeletionRequestTable (9.5)
      settings/                 DangerZone.tsx (9.5)
      post/                     MDX components
      shared/                   Providers, Toast, etc.

    lib/
      auth/session.ts           getSession, getCurrentUser, requireAuth, requireAdmin
      auth/deletion.ts          account deletion helpers (9.5)
      auth/auth.ts              NextAuth config + login hook (9.5)
      email/templates/          deletion-code, deletion-scheduled,
                                deletion-admin, account-restored (9.5)
      content/                  posts.ts, topics.ts, schema.ts, slug.ts, headings.ts
      db/client.ts              prisma singleton
      storage/r2.ts             R2 client (9.4.6)
      ...

    prisma/
      schema.prisma             User, Account, Session, VerificationToken,
                                PasswordResetToken, Post, Tag, PostTag,
                                AccountDeletionRequest (9.5)
      migrations/
      seed.ts

---

## 4. Database Schema (verified from prisma/schema.prisma)

### User
- id, email (unique), emailVerified, passwordHash, name, image
- role (USER | ADMIN, default USER)
- username (unique, nullable), bio (Text), links (Json), coverImage
- createdAt, updatedAt
- Relations: accounts[], sessions[], posts[], passwordResets[], deletionRequest?

### AccountDeletionRequest (added 9.5)
- id (cuid PK), userId (unique, FK -> User)
- code, codeExpires (DateTime), attempts (Int default 0)
- requestedAt (default now), scheduledFor (DateTime)
- status: String default "PENDING" (PENDING | SCHEDULED | COMPLETED)
- cancelledAt?, completedAt?, completedBy?
- @@index([status]), @@index([scheduledFor])

### Delete Cascade Rules (CRITICAL)

| Relation | onDelete |
|---|---|
| User -> Account | Cascade |
| User -> Session | Cascade |
| User -> PasswordResetToken | Cascade |
| User -> Post (via Post.authorId) | Cascade (changed from Restrict in 9.5) |
| User -> AccountDeletionRequest | Cascade (9.5) |
| User -> VerificationToken | No FK (identifier = email string); orphans on delete |

### Enums
- Role: USER, ADMIN
- PostStatus: DRAFT, PUBLISHED

---

## 5. Auth Pattern (lib/auth/session.ts)

    requireAdmin()
      -> redirect("/login") if no session
      -> redirect("/") if role !== "ADMIN"
      -> returns session with .user.id and .user.role

Rule: Every admin API handler and admin page calls requireAdmin() FIRST.
Never trust client-side disabled buttons.

### Login hook (lib/auth/auth.ts — added 9.5)

    authorize() after credential + emailVerified:
      const restore = await checkAndCancelOnLogin(user.id);
      if (restore.restored) void sendEmail(welcome-back).catch(...);

- DB restore is AWAITED (must commit before session issues)
- Welcome-back email is fire-and-forget (never blocks login)

---

## 6. API Conventions (mirrored Posts -> Users)

### File layout
- route.ts          -> list / create
- [id]/route.ts     -> single-resource operations

### Next.js 15 params signature

    type Params = { params: Promise<{ id: string }> };
    export async function PATCH(request: Request, { params }: Params) {
      const { id } = await params;
      // ...
    }

### Response shapes
- Success:          { ok: true, ...data }          -> 200 / 201
- Validation fail:  { error, issues: <fields> }    -> 422
- Bad JSON:         { error: "Invalid JSON" }      -> 400
- Not found:        { error }                      -> 404
- Conflict:         { error }                      -> 409
- Rate/expired:     { error }                      -> 410 / 429
- Non-admin:        requireAdmin() redirects       -> 302

### Zod usage
- Every request body validated with safeParse
- .flatten().fieldErrors returned on failure

### Transactions
- Multi-step mutations wrapped in prisma.$transaction(async (tx) => { ... })
- Discriminated union result pattern:

      return { kind: "not_found" as const };
      return { kind: "ok" as const, user: updated };

---

## 7. Frontend Conventions

### Server admin page

    export default async function AdminXxxPage() {
      const session = await requireAdmin();
      const data = await prisma.xxx.findMany({ ... });
      return <XxxTable items={data} currentUserId={session.user.id} />;
    }

### Toast usage

    "use client";
    import { useToast } from "@/components/shared/Toast";
    const { toast } = useToast();
    toast("Message", "success");   // or "error"

### Table styling tokens
- Container:      rounded-xl border border-border
- Header:         bg-muted/5 text-xs uppercase tracking-wider text-muted
- Row hover:      hover:bg-muted/5
- ADMIN badge:    border-accent/30 bg-accent/10 text-accent
- USER badge:     border-border text-muted
- Delete button:  text-red-600 border-border hover:border-red-500
- Danger card:    border-red-500/30 bg-red-500/5 (9.5)

### Client delete pattern

    const res = await fetch(`/api/.../${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error ?? "Delete failed.", "error");
      return;
    }
    toast("Deleted.", "success");
    router.refresh();

### Client modal pattern (9.5)
- fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4
- Card: w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-xl
- role="dialog" aria-modal="true" aria-labelledby
- ESC + backdrop click close (unless busy)
- Body scroll lock via useEffect

---

## 8. Completed Phases

### 9.4.0 — Content Migration (MDX -> DB)
- Script: scripts/migrate-mdx-to-db.ts
- Uses gray-matter + postFrontmatterSchema
- Upserts Post + Tag + PostTag
- Public site reads via lib/content/posts.ts
- Status: COMPLETE

### 9.4.1 — Admin Shell
- app/(admin)/admin/layout.tsx with requireAdmin()
- components/admin/AdminNav.tsx sidebar (Dashboard / Posts / Users / Media)
- Status: COMPLETE

### 9.4.2 — Admin Dashboard
- app/(admin)/admin/page.tsx with stat cards + recent posts + recent users
- components/admin/StatCard.tsx
- Verified: 4 posts, 3 users, real DB counts
- Status: COMPLETE

### 9.4.3 — Posts API
- app/api/admin/posts/route.ts          (GET list, POST create)
- app/api/admin/posts/[id]/route.ts     (GET, PATCH, DELETE)
- Zod schemas: title, excerpt, content, coverImage, pillar, status, date, tags
- Slug auto-generated via generateUniquePostSlug
- Tags upserted in transaction
- Author = session.user.id
- Status: COMPLETE

### 9.4.4 — Posts UI
- app/(admin)/admin/posts/page.tsx         (list)
- app/(admin)/admin/posts/new/page.tsx     (create)
- app/(admin)/admin/posts/[id]/page.tsx    (edit)
- components/admin/PostTable.tsx           (server)
- components/admin/PostForm.tsx            (client)
- components/admin/DeletePostButton.tsx    (client delete + toast)
- Status: COMPLETE

### 9.4.5 — Users API + UI (COMPLETED 2026-09-24)

Files added / changed:
- app/api/admin/users/route.ts              (GET list)
- app/api/admin/users/[id]/route.ts         (PATCH role, DELETE)
- components/admin/UserTable.tsx            (server table)
- components/admin/UserActions.tsx          (client role dropdown + delete)
- app/(admin)/admin/users/page.tsx          (server page)

Business rules (server-enforced):
| Rule | HTTP | Message |
|---|---|---|
| Self-role-change blocked | 400 | "You cannot change your own role" |
| Self-delete blocked | 400 | "You cannot delete yourself" |
| Last admin demote blocked | 409 | "Cannot demote the last admin" |
| Delete user with posts blocked | 409 | "User has posts. Reassign or delete their posts first." |
| User not found | 404 | "User not found" |
| Bad role value | 422 | "Validation failed" + issues |

### 9.4.6 — R2 + Media (COMPLETED 2026-09-24)
- See top-block above for details
- Status: COMPLETE

### 9.4.7 — Final Verify
- npx tsc --noEmit: 0 errors
- Status: COMPLETE (2026-09-24)

### 9.5 — Account Deletion (COMPLETED 2026-09-24)
- See top-block above for details
- Status: COMPLETE

---

## 9. Pending Work

None currently. (Section reserved for next phase.)

---

## 10. Known Issues / Tech Debt

| Item | Impact | Resolution |
|---|---|---|
| VerificationToken rows orphan on user delete | No FK (identifier = email) | Acceptable; garbage-collected naturally |
| /favicon.ico 404 in browser console | Cosmetic | Add app/icon.tsx or public/favicon.ico (low priority) |
| Project not under version control | No rollback safety | Run `git init` + first commit (user action) |
| TiDB Cloud anycast IP routing intermittent | Prisma hangs ("Can't reach database") | Switch DNS to 1.1.1.1; or hosts file pin to working IP |

---

## 11. Phase Plan Reference

Current block: 9.5 Account Deletion (parallel to 9.4 Admin Panel)

    9.4.0  Migration       DONE
    9.4.1  Admin shell     DONE
    9.4.2  Dashboard       DONE
    9.4.3  Posts API       DONE
    9.4.4  Posts UI        DONE
    9.4.5  Users           DONE (2026-09-24)
    9.4.6  R2 + Media      DONE (2026-09-24)
    9.4.7  Verify          DONE (2026-09-24, tsc clean)
    9.5    Account Deletion DONE (2026-09-24, tsc clean)
    9.6    Force Delete + Profile Upload DONE (2026-09-29, tsc clean)

---

## 12. Explicit Non-Goals (9.4 + 9.5 blocks)

Do NOT build as part of current phases:

- Rich text / MDX editor (plain markdown textarea only)
- Post scheduling / auto-publish
- Comment moderation
- Analytics / charts
- Multi-author workflow / draft approval
- Bulk import/export
- Admin-created user password reset
- Image resize / optimization (raw upload)
- Audit log table for admin actions
- Email notifications on role change
- Pagination on deletion-requests list (expected small)
- Rate limiting on admin purge (admin-only, no rate-limit infra)

---

## 13. Session Log

| Date | Phase | Action | Verification |
|---|---|---|---|
| 2026-09-24 | 9.4.5 | Implemented Users API + UI (5 files) | tsc: 2 expected errors; browser: 3 users, disabled self-row; API: 400/404/200 confirmed |
| 2026-09-24 | 9.4.6 | Implemented R2 + Media upload | tsc: 0 errors; upload PNG -> key + URL; R2 dashboard shows file |
| 2026-09-24 | 9.4.7 | Final verify pass | npx tsc --noEmit: 0 errors |
| 2026-09-24 | 9.5   | Implemented Account Deletion (user + admin + auth hook) | tsc: 0 errors; user flow + admin list + purge modal verified |
| 2026-09-29 | 9.6   | Force delete feature (schema + logic + UI) | tsc: 0 errors; user force flow + admin badge verified |
| 2026-09-29 | 9.6   | Profile upload (avatar + cover) + navbar sync | tsc: 0 errors; upload -> save -> navbar updates |
| 2026-09-29 | 9.6   | Sticky topbar fix (top-14 z-20) | manual: no overlap with navbar on scroll |
| 2026-09-24 | - | Created MEMORY.md | manual |

---

## 14. How To Update This File

After each phase completion:

1. Move the phase from section 9 (Pending) to section 8 (Completed)
2. Add a row to section 13 (Session Log)
3. Update section 10 (Known Issues) if new debt added
4. Update "Last updated" at top
5. Update section 11 (Phase Plan Reference) checkbox
6. Add a top-block for the newest phase (keep last 2)

Keep it terse. This is a working memory doc, not a tutorial.
