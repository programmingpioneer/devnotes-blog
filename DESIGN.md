\# DESIGN.md — DevNotes Design System



> Single source of truth for tokens, component contracts, and visual direction.

> Last updated: 2026-10-02 (Phase 1)



\---



\## 1. Visual Direction



DevNotes is a \*\*developer-focused publishing platform\*\*. The design language is \*\*calm, structured, premium, and fast\*\* — closer to Linear, Vercel Dashboard, and Resend than to a generic Tailwind SaaS template.



Principles:

\- Content over chrome. Typography and whitespace carry the hierarchy; decoration does not.

\- Every surface has a purpose. Solid planes, deliberate elevation, restrained shadows.

\- Motion is functional, never decorative. Duration stays in the 150–300ms band.

\- Dark mode is designed, not inverted.



Explicit anti-goals: excessive glassmorphism, neon accents, giant shadows, random gradients, off-system colors like `text-red-600` / `bg-amber-500/10`.



\---



\## 2. Color Tokens



All colors are \*\*OKLCH\*\*, defined in `app/globals.css` under `@theme` and `.dark`.



\### Base



| Token | Purpose |

|---|---|

| `--color-background` | Page background |

| `--color-foreground` | Primary text |

| `--color-muted` | Secondary text, metadata |

| `--color-border` | Borders, dividers |

| `--color-accent` | Brand / primary action |



\### Surfaces



| Token | Purpose |

|---|---|

| `--color-surface` | Subtle section background |

| `--color-card` | Card background (sits on `background`) |

| `--color-elevated` | Modals, popovers, dropdowns |

| `--color-subtle` | Inset wells, code callouts |



\### Semantic



| Token | Usage example |

|---|---|

| `--color-success` / `-fg` / `-bg` / `-border` | Post published, upload complete, form saved |

| `--color-warning` / `-fg` / `-bg` / `-border` | Pending review, unsaved draft warning |

| `--color-error` / `-fg` / `-bg` / `-border` | Destructive actions, validation errors |

| `--color-info` / `-fg` / `-bg` / `-border` | Neutral callouts, tips, help text |



\*\*Never use raw Tailwind palette colors\*\* (`text-red-600`, `bg-amber-500/10`, `border-emerald-\*`). Use the semantic tokens above. This is the single biggest source of visual inconsistency in the pre-redesign codebase.



\### Code blocks



`--color-code-bg` / `--color-code-fg` are intentionally always dark in both themes (GitHub / Dev.to convention).



\---



\## 3. Typography Scale



Font: Geist via `--font-geist`, exposed as `--font-sans`. Mono: `--font-mono`.



| Token | Size | Line-height | Weight | Use case |

|---|---|---|---|---|

| `--text-display` | 3.5rem | 1.1 | 700 | Home hero title |

| `--text-h1` | 2.5rem | 1.15 | 700 | Page title (one per page) |

| `--text-h2` | 2rem | 1.2 | 700 | Section title |

| `--text-h3` | 1.5rem | 1.3 | 600 | Card title (large) |

| `--text-h4` | 1.25rem | 1.4 | 600 | Card title (compact), subsection |

| `--text-body-lg` | 1.125rem | 1.6 | 400 | Lead paragraph, post excerpt |

| `--text-body` | 1rem | 1.6 | 400 | Default body |

| `--text-sm` | 0.875rem | 1.55 | 400 | Metadata, form helper |

| `--text-caption` | 0.75rem | 1.5 | 500 | Timestamps, badges, tags |



Usage in Tailwind: `text-display`, `text-h1`, `text-body`, etc. (Tailwind v4 auto-generates utilities from `--text-\*` tokens.)



\*\*Rules:\*\*

\- One `--text-h1` per page.

\- A card title never jumps more than one tier from its siblings. The pre-redesign `PostCard.tsx` violating this (same title as `text-3xl md:text-4xl` OR `text-base` based on `isFeatured`) is fixed in Phase 4.

\- Never use arbitrary `text-\[18px]` unless the design truly calls for it.



\---



\## 4. Spacing System



Tailwind's numeric scale (`p-2`, `gap-4`, `space-y-6`) remains the default. Semantic aliases sit on top for narrative clarity:



| Token | Value | Use case |

|---|---|---|

| `--space-xs` | 0.5rem | Tight inline gaps |

| `--space-sm` | 0.75rem | Badge padding, small gaps |

| `--space-md` | 1rem | Card padding (compact) |

| `--space-lg` | 1.5rem | Card padding (default), section gap |

| `--space-xl` | 2rem | Section separator |

| `--space-2xl` | 3rem | Major section break |

| `--space-3xl` | 4rem | Page top/bottom rhythm |



Vertical rhythm: prefer `space-y-6` between blocks, `gap-4` between grid items, `py-16 md:py-20` for page wrappers (existing convention).



\---



\## 5. Radius \& Shadow



\### Radius



| Token | Value | Use case |

|---|---|---|

| `--radius-sm` | 6px | Badges, small chips |

| `--radius-md` | 10px | Inputs, buttons |

| `--radius-lg` | 14px | Cards (default) |

| `--radius-xl` | 20px | Modals, large panels |



\*\*Rule:\*\* pick one radius per element class. Do not mix `rounded-lg` on PostCard with `rounded-xl` on tables — the audit identifies this as an inconsistency to fix in Phase 2–7.



\### Shadow



| Token | Use case |

|---|---|

| `--shadow-soft-sm` | Resting card |

| `--shadow-soft-md` | Hover card, dropdown |

| `--shadow-soft-lg` | Modal, elevated popover |



Do not invent heavier shadows. Do not stack shadows.



\---



\## 6. Motion



| Token | Value | Use case |

|---|---|---|

| `--duration-fast` | 150ms | Hover, focus |

| `--duration-base` | 200ms | Default transition |

| `--duration-slow` | 300ms | Enter animations, reveal |

| `--ease-out-quart` | cubic-bezier(0.25, 1, 0.5, 1) | Standard easing |



Utility: `transition-token` applies the base transition to color / background / border / shadow / opacity / transform.



\*\*Rules:\*\*

\- No animation longer than 300ms except the theme toggle (280ms).

\- Respect `prefers-reduced-motion`. Existing global override handles this for CSS transitions; new components must not defeat it.

\- Skeleton shimmer (Phase 2) must be disabled under reduced motion.



\---



\## 7. Z-Index Scale



Never hardcode `z-50` etc. Use the token.



| Token | Value | Layer |

|---|---|---|

| `--z-base` | 0 | Page content |

| `--z-dropdown` | 10 | Dropdowns |

| `--z-sticky` | 20 | Sticky topbar |

| `--z-nav` | 30 | Navbar, mobile drawer |

| `--z-modal-backdrop` | 40 | Modal backdrop |

| `--z-modal` | 50 | Modal dialog |

| `--z-popover` | 60 | Popovers, tooltips |

| `--z-toast` | 70 | Toasts |

| `--z-tooltip` | 80 | Tooltips above everything |



Existing code uses `top-14 z-20` (sticky topbar), `z-30`, `z-50` (modals). Map these: `z-20 → z-\[var(--z-sticky)]`, `z-30 → z-\[var(--z-nav)]`, `z-50 → z-\[var(--z-modal)]`.



\---



\## 8. Focus \& Accessibility



\- `--focus-ring-color`: `var(--color-accent)`

\- `--focus-ring-width`: 2px

\- `--focus-ring-offset`: 2px



Global `:focus-visible` uses these tokens.



\*\*Requirements:\*\*

\- Every interactive element must be reachable by Tab.

\- Every icon-only button needs `aria-label`.

\- Every form input needs a visible `<label>` or `aria-label`.

\- Contrast: body text ≥ 4.5:1, large text ≥ 3:1 against its background.

\- Semantic HTML: `<button>` for actions, `<a>` for navigation, `<nav>` for nav, `<main>` for content.



\---



\## 9. Component Contracts



Descriptive contracts. These are implemented in \*\*Phase 2\*\* under `components/ui/`.



\### `Button`

```ts

type ButtonProps = {

&#x20; variant: "primary" | "secondary" | "ghost" | "outline" | "destructive" | "success";

&#x20; size: "sm" | "md" | "lg";

&#x20; loading?: boolean;

&#x20; iconOnly?: boolean;

&#x20; disabled?: boolean;

&#x20; type?: "button" | "submit" | "reset";

&#x20; asChild?: boolean;

} \& React.ButtonHTMLAttributes<HTMLButtonElement>;

# DESIGN_AUDIT.md — Phase 1 Reconnaissance

> Raw inventory feeding Phases 2–8 of the redesign.
> Last updated: 2026-10-02 (Phase 1)
> Method: verified via file listing + targeted codebase searches. Items marked **[unverified]** require Phase 2 investigation.

---

## 1. Route Inventory

Grouped by layout scope. Source: project file tree + `MEMORY.md`.

### Public site — `app/(public)/`
- `page.tsx` — Home
- `posts/[slug]/` — Post detail
- `search/page.tsx` — Search
- `tags/[tag]/` — Tag listing
- `topics/page.tsx`, `topics/[slug]/page.tsx` — Topics
- `about/page.tsx`, `contact/page.tsx`, `faq/page.tsx`
- `privacy/page.tsx`, `terms/page.tsx`, `cookies/page.tsx`

### Auth — `app/(auth)/`
- `login/page.tsx`
- `register/page.tsx`
- `forgot-password/page.tsx`
- `reset-password/page.tsx`
- `verify-code/page.tsx`
- `verify-email/page.tsx`
- `layout.tsx`

### Dashboard — `app/(dashboard)/`
- `dashboard/page.tsx`
- `dashboard/posts/` — user posts
- `dashboard/posts/new/`
- `dashboard/edit-profile/` (contains `EditProfileForm.tsx`)
- `dashboard/settings/page.tsx`
- `layout.tsx`

### Admin — `app/(admin)/`
- `admin/page.tsx` — dashboard
- `admin/posts/`, `admin/posts/new/`, `admin/posts/[id]/`
- `admin/posts/[id]/preview/`
- `admin/users/page.tsx`
- `admin/media/page.tsx`
- `admin/pending/page.tsx`
- `admin/deletion-requests/page.tsx`
- `layout.tsx`

### Public profile — `app/u/[username]/`
- `page.tsx`

### API — `app/api/`
Listed in `MEMORY.md`. Not redesign-relevant except for response shapes consumed by client components.

### Metadata
- `app/sitemap.ts`, `app/robots.ts`, `app/rss.xml/route.tsx`
- `app/not-found.tsx`

---

## 2. Component Inventory

Grouped by `components/` subfolder.

### `components/admin/`
- AdminNav.tsx, ApproveRejectButtons.tsx, DeletePostButton.tsx, DeletionRequestTable.tsx, ImageInsertDialog.tsx, MediaUploader.tsx, PendingCard.tsx, PostEditorToolbar.tsx, PostForm.tsx, PostPreview.tsx, PostTable.tsx, SaveStatusIndicator.tsx, StatCard.tsx, UserActions.tsx, UserTable.tsx

### `components/auth/`
- AuthCard.tsx, FormField.tsx

### `components/dashboard/`
- DashboardNav.tsx, PostRow.tsx, QuickAction.tsx, StatTile.tsx

### `components/home/`
- AnimatedHero.tsx, HeroEditorial.tsx, RecentGrid.tsx, TopicHubs.tsx

### `components/layout/`
- Footer.tsx, MobileNav.tsx, Navbar.tsx, NavUserArea.tsx, ProgressBar.tsx, ThemeToggle.tsx, UserMenu.tsx

### `components/post/`
- AuthorCard.tsx, Breadcrumbs.tsx, Callout.tsx, CodeBlock.tsx, mdx-components.tsx, PostCard.tsx, Prose.tsx, TOC.tsx

### `components/profile/`
- LinkEditor.tsx, ProfileHeader.tsx, ProfilePostList.tsx, social-icons.tsx, SocialLinks.tsx

### `components/settings/`
- DangerZone.tsx

### `components/shared/`
- ConfirmDialog.tsx, Container.tsx, EmptyState.tsx, JSONLD.tsx, LegalLayout.tsx, Newsletter.tsx, Pagination.tsx, Providers.tsx, RevealOnScroll.tsx, SearchInput.tsx, Section.tsx, TagPill.tsx, Toast.tsx

**Client vs server:** `[unverified]` — Phase 2 must annotate each. Known client components from prior phase logs: `ThemeToggle`, `MobileNav`, `UserMenu`, `DangerZone`, `DeletionRequestTable`, `MediaUploader`, `PostForm`, `EditProfileForm`, `SearchInput`, `Toast`.

---

## 3. Inconsistencies Found

Verified in Phase 1 investigation.

### 3.1 — Heading size jumps within `PostCard.tsx`
File: `components/post/PostCard.tsx`
Same `<h3>` element gets:
- `text-3xl font-semibold tracking-tight md:text-4xl` (when `isFeatured`)
- `text-base font-semibold tracking-tight` (when normal)

A 4-tier jump for one boolean. Fix in Phase 4 by introducing the typography scale (`text-h3` for featured, `text-h4` for normal).

### 3.2 — Duplicate heading formula across pages
Same string `text-3xl font-semibold tracking-tight md:text-4xl` appears in at least:
- `components/post/PostCard.tsx` (featured)
- `components/shared/LegalLayout.tsx:14`
- `app/(public)/topics/[slug]/page.tsx:72`

Also duplicated: the `<p className="text-sm text-muted">Kicker</p><h1>Title</h1>` block.

Fix in Phase 2/4 by introducing `PageHeader`.

### 3.3 — Card radius inconsistency
- `PostCard`: `rounded-lg`
- Per `MEMORY.md` §7, tables/modals use `rounded-xl`
- Modal pattern in `MEMORY.md` §7: `rounded-xl`

Fix in Phase 2 by adopting one card contract.

### 3.4 — Badge color inconsistency
- `components/admin/PendingCard.tsx:57` — `border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400` (raw Tailwind palette)
- Per `MEMORY.md` §7 — `border-accent/30 bg-accent/10 text-accent` (token-based)

Fix in Phase 2 by introducing `Badge` with semantic variants (`pending` → warning tokens).

### 3.5 — Body ambient gradient under every page
File: `app/globals.css` (pre-Phase-1)
`body` had `background-image: radial-gradient(...), radial-gradient(...), url(noise SVG); background-attachment: fixed;`.

Effect: every page's ambient layer sits behind translucent cards, making the whole app feel "washed out" or "transparent" — the primary complaint in the redesign spec §4.

Fix: **addressed in Phase 1.** Gradient + noise moved to `.hero-ambient` utility (Step 2 above).

### 3.6 — Only one legitimate `backdrop-blur` usage
`components/post/CodeBlock.tsx:25` — copy button uses `backdrop-blur`. This is intentional (button floats over code block). **No other glassmorphism found.** The "transparent" complaint is not caused by glassmorphism; it is caused by 3.5.

---

## 4. Duplicate Patterns to Consolidate

Recurring JSX that will be replaced by `components/ui/` primitives.

| Pattern | Current scattered locations | Primitive |
|---|---|---|
| Kicker + H1 + subtitle header | `LegalLayout.tsx`, `topics/[slug]/page.tsx`, likely others `[unverified]` | `PageHeader` |
| Primary CTA button | inline class strings across forms | `Button variant="primary"` |
| Danger delete button | `DeletePostButton.tsx`, `UserActions.tsx`, `DangerZone.tsx`, `DeletionRequestTable.tsx` | `Button variant="destructive"` |
| Status pill | `PendingCard.tsx`, `DeletionRequestTable.tsx`, table headers per `MEMORY.md` §7 | `Badge` |
| Modal wrapper | `DangerZone.tsx`, `DeletionRequestTable.tsx` | `Modal` |
| Card container | `PostCard`, `PendingCard`, `StatCard`, `StatTile` | `Card` |
| Empty state | `components/shared/EmptyState.tsx` (exists, keep) | Reuse as-is |
| Skeleton | **does not exist** | `Skeleton` (new) |

---

## 5. Responsive Problem Areas

`[unverified]` — Phase 2/8 must audit. Phase 1 search did not confirm specifics.

Known risk areas to inspect in Phase 2:
- `PostTable.tsx`, `UserTable.tsx`, `DeletionRequestTable.tsx` — likely need mobile card layout or scroll wrapper.
- `PostEditorToolbar.tsx` — likely crowded on mobile.
- `NavUserArea.tsx` / `UserMenu.tsx` — dropdown positioning on small screens.
- `PostForm.tsx` — editor width + sidebar collapse behavior.

---

## 6. Dark Mode Problem Areas

Verified raw-color usages (Phase 1 search):

- `components/admin/PendingCard.tsx` — `text-amber-600 dark:text-amber-400` (raw palette; needs `--color-warning`).

Further `[unverified]` — Phase 2 must grep for:
- `text-red-`, `bg-red-`, `border-red-`
- `text-emerald-`, `bg-emerald-`
- `text-white`, `text-black`
- `bg-white`, `bg-black`

---

## 7. Accessibility Gaps

`[unverified]` — Phase 2 must audit each file for:
- icon-only buttons missing `aria-label`
- clickable `<div>` without `role="button"` + keyboard handler
- inputs without associated `<label>`
- `<img>` without `alt`
- focus styles missing on custom interactive elements

Phase 1 verified:
- `:focus-visible` global rule exists (now tokenized).
- `CodeBlock.tsx` copy button has `aria-label="Copy code"` — good.

---

## 8. Primitive Components Needed

Confirmed list for Phase 2. New files live in `components/ui/`.

| Component | Purpose | Currently exists? |
|---|---|---|
| `Button` | All CTAs and actions | No |
| `Input` | Text/number/email fields | No |
| `Textarea` | Multi-line fields | No |
| `Select` | Native select, styled | No |
| `Card` | Content container | No (inconsistent recipes) |
| `Badge` | Status pills, tags, roles | No (3+ inline variants) |
| `Modal` | Dialogs | No (2 inline modals) |
| `Skeleton` | Loading placeholders | No |
| `PageHeader` | Standard page top block | No (duplicated) |
| `icons/` folder | Inline SVG icon set | No (inline SVGs, some emoji) |

Existing `components/shared/` components to **reuse unchanged** during redesign: `Container`, `Section`, `EmptyState`, `Toast`, `Pagination`, `ConfirmDialog`, `RevealOnScroll`.