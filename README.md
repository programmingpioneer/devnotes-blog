<div align="center">

# ⚡ DEVNOTES — Engineering Notes & Technical Writing Platform

### *Markdown-first • MDX-powered • Built for developers*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TiDB](https://img.shields.io/badge/TiDB-Cloud-ff69b4?style=for-the-badge&logo=tidb&logoColor=white)](https://tidbcloud.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Brevo](https://img.shields.io/badge/Brevo-Email-0B69FF?style=for-the-badge&logo=brevo&logoColor=white)](https://www.brevo.com/)
[![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare_R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://www.cloudflare.com/)

> **Executive Summary:** DevNotes is a production-grade blog and technical writing platform engineered with the Next.js 15 App Router, Prisma ORM, and a distributed cloud stack. It combines a rich Markdown editing experience with MDX rendering, autosave, image uploads, draft/publish workflows, and a complete admin panel — all backed by enterprise-grade identity, transactional email, and object storage infrastructure.

</div>

---

## 🎯 Project Overview & Objectives

Traditional blogging platforms force a choice between rich editing and developer-grade tooling. **DevNotes** solves this by building on a modern, type-safe, full-stack foundation:

- **Markdown-First Workflow:** Live preview, file import, inline image insertion, and a formatting toolbar — all synchronized with server-side autosave every 30 seconds.
- **MDX Rendering Pipeline:** Public posts render as MDX with GitHub-Flavored Markdown support, syntax-highlighted code blocks, callouts, and an auto-generated table of contents.
- **Enterprise-Grade Infrastructure:** Distributed TiDB Cloud storage, Cloudflare R2 object storage, and Brevo transactional email — deployed on a serverless-first architecture.

---

## 🛠️ Core Engineering Systems

| Subsystem | Technology Used | Implementation Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router, Turbopack) | Server components, streaming, file-based routing, SSR/ISR. |
| **UI Layer** | React 19, Tailwind CSS 4, @tailwindcss/typography | Component-driven UI with a coherent design system and prose styling. |
| **Language** | TypeScript 5.7 | End-to-end type safety across routes, components, and data access. |
| **Primary Database** | TiDB Serverless (MySQL-compatible) | Distributed relational storage with auto-scaling capabilities. |
| **ORM & Migrations** | Prisma 6 | Type-safe queries, schema-as-code, and versioned migrations. |
| **Authentication** | Auth.js (NextAuth v5 beta) + Prisma Adapter | Session management with database-backed user records. |
| **Password Security** | bcryptjs | One-way password hashing for credentials. |
| **Validation** | Zod 4 | Runtime schema validation at API boundaries. |
| **Markdown / MDX** | next-mdx-remote, react-markdown, remark-gfm, rehype-slug, github-slugger | Renders both live preview and published MDX with identical GFM semantics. |
| **Asset Storage** | Cloudflare R2 (S3-compatible, AWS SDK v3) | High-speed, zero-egress image storage. |
| **Transactional Email** | Brevo API | Verification, password reset, welcome, and account lifecycle emails. |

---

## 🚀 Feature Breakdown

Every feature below has been shipped in the current codebase.

### 📝 Content Authoring & Editor

- **Markdown File Import** – Upload `.md` / `.markdown` files (500 KB cap) directly into the editor with confirmation before overwriting existing content.
- **Live Preview** – Real-time rendered preview alongside the editor using `react-markdown` + `remark-gfm`.
- **Editor Toolbar** – Insert formatting (headings, bold, links, code, quotes) via a synced toolbar with cursor-aware insertion.
- **Image Insert Dialog** – Upload images inline and inject the Markdown image syntax at the current cursor position.
- **Autosave** – Debounced 30-second autosave with `savingRef` guards preventing duplicate requests and a live status indicator.
- **Draft / Publish Split** – Save-as-draft and publish flows are fully separated at the API level.
- **Cover Image URL** – Optional cover with inline preview and error handling.
- **Topic & Tag Management** – Posts organized by topic (pillar) with comma-separated tags auto-normalized to lowercase.

### 🌐 Public Blog Experience

- **Home Page** – Editorial hero, featured topic hubs, and a recent-posts grid.
- **Post Detail Pages** – MDX-rendered articles with breadcrumbs, author card, reading time, cover image, and an IntersectionObserver-driven table of contents.
- **Topic Hubs** – Dedicated landing pages per topic at `/topics/[slug]`.
- **Tag Pages** – Auto-generated tag archives at `/tags/[tag]`.
- **Full-Text Search** – Search page with a dedicated `/api/search` route.
- **RSS, Sitemap, Robots** – Programmatic `rss.xml`, `sitemap.ts`, and `robots.ts` for search engines.

### 🔐 Identity & Security

- **Email + Password Registration** – Credentials validated with Zod; passwords hashed with bcryptjs.
- **Email Verification** – Time-limited verification codes sent via Brevo with attempt tracking.
- **Login & Session Management** – Auth.js (NextAuth v5) with Prisma adapter and database-backed sessions.
- **Forgot Password Flow** – Six-digit code verification followed by a secure reset link.
- **Resend Verification Code** – Rate-limited re-dispatch of verification codes.
- **Change Password** – Authenticated password rotation from the dashboard.
- **Account Deletion Request** – 15-day grace period with coded confirmation, admin visibility, and account restoration on login within the window.

### 👤 User Profile & Dashboard

- **Public Profiles** – Every user has a public profile at `/u/[username]` with posts, bio, and social links.
- **Profile Editor** – Bio, username (with uniqueness check), social URLs.
- **Social Links** – Multiple platforms with dedicated icons.
- **Dashboard** – Personal authoring space with post list and profile shortcuts.
- **Settings & Danger Zone** – Password change and account deletion entry point.

### 👑 Admin Panel & Moderation

- **Admin Dashboard** – Stat cards for posts, users, and moderation queues.
- **Post Management** – Full CRUD with status filters and per-row actions.
- **User Management** – Admin actions on user accounts (`UserActions`, `UserTable`).
- **Media Library** – Dedicated `/admin/media` page for uploaded assets.
- **Deletion Requests** – `/admin/deletion-requests` with `DeletionRequestTable` for reviewing and processing pending account deletions.

### 📧 Email & Automation

- **Brevo Transactional Emails** – Centralized in `lib/email/brevo.ts` with typed templates.
- **Template Suite** – Welcome, verify email, password reset, account restored, deletion code, deletion scheduled, and admin deletion notification.
- **Account Lifecycle Automation** – Emails fire on verification, password reset, deletion request, deletion cancellation, and restoration.

### 🔎 SEO & Discoverability

- **Metadata API** – Per-page metadata via `lib/seo/metadata.ts`.
- **JSON-LD Structured Data** – Article and breadcrumb schemas via `lib/seo/jsonld.ts`.
- **Dynamic OG Images** – `/api/og` route for social share cards.
- **Sitemap & RSS** – Auto-generated from the live post set.
- **Robots Directives** – Programmatic `robots.ts`.

---

## 📈 Feature Implementation Summary

| Category | Implemented Features |
| :--- | ---: |
| 📝 Content Authoring & Editor | 8 |
| 🌐 Public Blog Experience | 6 |
| 🔐 Identity & Security | 7 |
| 👤 User Profile & Dashboard | 5 |
| 👑 Admin Panel & Moderation | 5 |
| 📧 Email & Automation | 3 |
| 🔎 SEO & Discoverability | 5 |
| **🚀 Total Implemented** | **39** |

---

## 🧠 System Workflow & Logic

1. **Authoring:** User opens the admin composer → title, excerpt, and Markdown content are captured in a controlled form with a live preview pane.
2. **Autosave:** After 30 seconds of inactivity on a valid form, a background PATCH/POST persists the draft and updates the save-status indicator. A `savingRef` guard prevents overlapping requests.
3. **Media:** Images are uploaded through the image insert dialog → stored in Cloudflare R2 → the Markdown image reference is injected at the cursor position.
4. **Publishing:** Save Draft vs Publish are distinct submit actions → Draft keeps the post hidden from public queries while Publish flips status to `PUBLISHED`.
5. **Public Rendering:** `/posts/[slug]` fetches the post via Prisma → renders the MDX body with `next-mdx-remote` using the same GFM plugins as the editor preview → builds the table of contents from extracted headings using `github-slugger` for slug parity.
6. **Identity:** Registration → verification code via Brevo → login through Auth.js → session persisted via Prisma adapter.
7. **Account Lifecycle:** Deletion request creates an `AccountDeletionRequest` → admin reviews via `/admin/deletion-requests` → user can cancel by logging in before the scheduled date, triggering a restoration email.

---

## 🗺️ Project Roadmap

DevNotes will continue evolving from a technical writing platform into a complete developer knowledge ecosystem.

**✍️ Writing → 📚 Knowledge Base → 🧪 Playgrounds → 👥 Community → 🤖 AI Assist → 🌍 Global**

### ✅ Completed

- [x] Markdown file import with confirmation
- [x] Live preview with GFM support
- [x] Editor formatting toolbar
- [x] Image insert dialog with cursor-aware insertion
- [x] Debounced autosave (30s) with status indicator
- [x] Draft / Publish workflow
- [x] Cover image preview
- [x] Topic and tag management
- [x] Public post pages with MDX rendering
- [x] Table of contents with scroll-linked active state
- [x] Reading time and author card
- [x] Topic hubs, tag pages, and search
- [x] RSS, sitemap, and robots generation
- [x] JSON-LD structured data
- [x] Dynamic OG images
- [x] User registration with email verification
- [x] Login and session management (Auth.js)
- [x] Forgot password flow with code verification
- [x] Change password from dashboard
- [x] Public user profiles at `/u/[username]`
- [x] Profile editor with social links
- [x] Account deletion request with grace period
- [x] Account restoration on login
- [x] Admin dashboard with stat cards
- [x] Post management (CRUD)
- [x] User management
- [x] Media library
- [x] Deletion request review panel
- [x] Brevo transactional email integration
- [x] Typed email template suite
- [x] Cloudflare R2 object storage
- [x] TiDB Cloud + Prisma ORM
- [x] Tailwind CSS 4 design system
- [x] Accessible prose rendering

### 🚧 Planned & Future Features

- [ ] **Full-Text Search Engine** – Upgrade `/api/search` to a dedicated index (e.g., Meilisearch or TiDB full-text) for fuzzy and ranked search.
- [ ] **Version History & Rollback** – Per-post revision history with the ability to restore prior drafts.
- [ ] **Scheduled Publishing** – Auto-publish posts at a chosen future timestamp.
- [ ] **Comments & Discussions** – Threaded discussion on posts with moderation hooks.
- [ ] **Advanced Analytics Dashboard** – Views, reading time, referrers, and top-performing posts.
- [ ] **Editorial Workflow** – Multi-author review pipeline with approval states.
- [ ] **Multi-Language Content** – Localized routing and translated post variants.
- [ ] **AI Writing Assistant** – Suggestions for titles, excerpts, and headings powered by an LLM.
- [ ] **Related Posts Recommendations** – Content-based similarity using embeddings.
- [ ] **Advanced Newsletter Integration** – Subscriber list, digests, and campaign stats.
- [ ] **Public API for Posts** – Read-only JSON API for external integrations.
- [ ] **Webhooks** – Fire events on publish, update, and deletion for integrations.
- [ ] **Series & Collections** – Group related posts into ordered learning paths.
- [ ] **Syntax Highlighting Themes** – User-selectable code block themes.
- [ ] **Content Export** – One-click export to Markdown, PDF, or static site bundles.

---

## 🤝 Contributing

Contributions that improve the platform are welcome:

1. **Fork** the repository.

2. **Create a feature branch:**

   ```bash
   git checkout -b feature/amazing-feature