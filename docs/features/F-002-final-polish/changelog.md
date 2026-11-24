# F-002 — Changelog

Newest first. One line per change that shipped.

| Date | Change | PR / commit |
| ---- | ------ | ----------- |
| 2026-11-25 | **Phase 2 (Learner and money screens)** — player course-complete card, real resource downloads, local Discussion posts + toast, "Submit project"; certificates list / detail by id / public `/verify/:certId?` (auto-issued for entitled learners); project submission + `/dashboard/reviews`; notifications bell (Navbar + player) with mark-all-read; checkout writes every order to `orders`, validates promos via `findValidPromo`, bKash/Nagad pending → approve / decline / cancel / timeout, receipt `/orders/:orderId`; Pro plan checkout + subscriptions (`db/billing.ts`); Billing tab (real plan, change cycle, cancel/resume, order history, refund request); donation payment step + handbook download (placeholder PDF); `/dashboard/courses`; Settings: OTP email change, delete account, saved preferences, confirm-password; page titles on every learner/auth/public page; stable public nav + Escape; reduced-motion scroll. | uncommitted |
| 2026-11-25 | **Phase 3 (Admin operations)** — admin tables split into `src/components/admin/*` (DataTable with sorting + 10/page pagination + row actions, KpiStrip/StatStrip, Pill, Filters, EmptyState, PageHeader); stable row ids; working Import (CSV header preview), Export (client-side CSV), Filter, Add student, Create note, Upload new version; `/admin/courses/:id` (KPIs, curriculum, recent enrolments, publish/unpublish, type-to-confirm delete) + edit mode in the course editor (Save changes, unsaved-changes guard, new courses open their detail page); `/admin/students/:id` (grant course, suspend/reactivate, password reset); payments from the shared `orders` + `/admin/payments/:id` (timeline, refund / approve / reject request, CSV); `/admin/submissions(/:id)` (48 h SLA pills, approve / request changes); `/admin/promos` (create / edit / deactivate / delete, used by checkout); `/admin/inbox(/:id)` (reply, close / reopen); review Reply + Hide; sidebar Submissions / Promos / Inbox with live badges; `usePageTitle` + toasts + ConfirmDialog on every admin action. | uncommitted |
| 2026-11-25 | **Phase 4 (Public site and polish)** — `/privacy`, `/terms`, `/refunds` (draft copy, shared `LegalPage`), `/help` (search + category chips + `FaqItem`), `/contact?topic=` preselect, Discord/YouTube constants, consistent footer link sets, Register legal links, `usePageTitle`, meta/OG tags + `robots.txt`, focus ring, reduced motion, skip links, local handbook logos, `/thank-you` amount validation. | uncommitted |
| 2026-11-25 | **Phase 1 (Foundation)** — route guards (`RequireAuth`, `RequireRole`, `GuestOnly`), login `next` / role home / session-expired notice / remember-me storage, token-based password reset with demo link, verified-only login + OTP bound to a pending sign-up, admin-only mock endpoints, enrolment + progress mock (`bxn-mock-learning`) with dashboard built from enrolments and an empty state, `/learn/:courseId/:lessonId?` player (prev/next, persisted completion, paywall for paid lessons), `/learn` resume redirect, `/checkout/:courseId` (enrols the buyer, already-owned state), `/checkout/plan/:plan` placeholder, session-aware Navbar/Sidebar/Player with real logout (clears all queries, toast), 403 / 500 pages + `AppErrorBoundary`, mock routes split into modules, shadcn `dialog` + `sonner` (Toaster, `ConfirmDialog`). F-001 Taka migration shipped alongside. | uncommitted |

## Phase 1 notes

- **Lesson ids** are 1-based `"<module>-<lesson>"` positions (`src/lib/lessons.ts`), used in URLs and progress payloads. Every mock course reuses the Java Generics curriculum (17 classes), so progress % is out of 17.
- Demo student progress is derived from completed lessons, so Java Generics shows **59 %** (10 of 17) instead of the old hard-coded 62 %; Python 35 % (6), Code Smells 6 % (1), SQL and Git 100 %.
- Free courses can be watched in the player before enrolling ("Enroll to track progress"); paid courses show only `preview` lessons plus a paywall card.
- Logout navigates to `/` first and clears the session in `useLogoutListener` once that navigation commits (router navigations are transitions; clearing immediately let the guard redirect to `/login?next=`).
- `GuestOnly` checks the session only when a screen opens, so login and OTP can show their own success state.
- New provisional endpoints and error codes are listed in `docs/project/api-guidelines.md`.
- Not done here (later phases): plan checkout beyond the placeholder, certificates list/verify, receipts, admin detail pages, legal pages, C11 course-count copy ("12 free / 48 courses").

## Phase 4 notes

- Legal pages are **drafts** ("Last updated: 24 November 2026 · Draft"); copy lives in `src/constants/legal.ts` for the owner to review.
- Social URLs are placeholders in `src/constants/social.ts` (TODO for the owner).
- Footer "Certificates" points to `/help#certificates` until a public `/verify` page exists; "Teams" → `/contact?topic=teams`.
- `/contact?topic=` accepts `course | billing | teams | teach | other` (case-insensitive); unknown values fall back to "Course question".
- Handbook logos are simple local glyphs in `public/logos/<slug>.svg` (slug = the handbook `logo` field), no CDN.
- `/thank-you` only accepts amounts from `SUPPORT_AMOUNTS` (`src/constants/support.ts`); anything else redirects to `/support`. The copy no longer claims a download started — the payment step is Phase 2.

## Phase 3 notes

- All new admin endpoints are **provisional** (listed under "Admin (Phase 3)" in `docs/project/api-guidelines.md`); `GET /admin/sections/:section` is gone.
- Admin course records (`bxn-mock-admin-courses`) are seeded from the catalog but are **separate** from it: editing, unpublishing or deleting a course in admin does not change the public catalog until a real backend shares one source.
- Student enrolments come from the learning store (read-only) for the demo student and from seeded data for the other directory entries. "Grant course" is stored on the admin student record (`source: granted`); the learner's own dashboard does not see it yet.
- "Send password reset" only returns `{ sentTo }`; no email or token is created. Suspending a student is shown in admin only — login is not blocked by the mock.
- Refunds are always the full amount. Refund / reject decisions are kept in `bxn-mock-admin-payment-events` so the shared `OrderRecord` shape stays unchanged; a learner's request has no timestamp on the timeline.
- Import is a **preview**: it checks the CSV header row and counts rows, nothing is saved. Note uploads store file name + size only.
- Review replies/hiding live in the admin review list (`bxn-mock-admin-reviews`), not on the public course page's reviews.
- The unsaved-changes guard uses `beforeunload` + a confirm dialog on the editor's back link (the app uses `<BrowserRouter>`, so `useBlocker` is not available).

## Phase 2 notes

- **Entitlement:** Pro unlocks every course (paid ones enrol with `source: "pro"`), mentor review and certificates. Free accounts can finish free courses but get no certificate or review; buying a course includes both for that course. Lapsed Pro keeps `pro` enrolments open (no revocation in the mock).
- The demo student starts on **Free** (their seed Pro ran Jul–Aug 2026). They keep the SQL (`BXN-2026-SQ-08412`) and Git (`BXN-2026-GI-04127`) certificates.
- Wallet demo: an account number ending in `0000` is declined; "Demo: simulate a declined payment" appears while the mock API is on. The request times out after 2 minutes.
- Handbooks and lesson resources download one placeholder file, `public/handbooks/sample.pdf`, under descriptive names (`brainxnext-<slug>-handbook.pdf`). Replace with real files.
- Donations are paid immediately (method choice + processing), no wallet approval step.
- Changing the billing cycle takes effect at the next renewal (no proration). The "Payment method" card shows the last payment's method — nothing is stored, so the dead "Update payment method" / "Invoice" buttons are gone (Receipt links open `/orders/:id`).
- The profile form no longer edits the email; it changes only through the OTP dialog (`000000` = wrong code), which moves enrolments, certificates, orders, submissions and the subscription to the new address and returns a new session.
- Deleting an account keeps its orders (financial records) for the admin.
- `Notes.tsx` (not in the Phase 2 file list) got a one-line change to pass `?handbook=<slug>` to `/support`.

## Integration (2026-11-25)

Coordinator pass after phases 2 and 3 merged:

- **Mobile admin overflow (bug):** `.sr-only` text (sidebar badge counts, the table "Actions" header) is `position: absolute`, so it escaped the horizontal scrollers and stretched admin pages to ~1,150px on phones — dialogs then opened off-centre and their buttons sat under the overlay. Fixed by making the scrollers positioning contexts (`relative` on `Sidebar` `<aside>`, `DataTable` scroll wrapper, Settings tab rail).
- **Dialogs** (`ui/dialog.tsx`) are capped at `100dvh - 32px` and scroll inside, so tall forms stay usable on short screens.
- **Course-complete card:** it appears optimistically before the certificate exists; it now shows "Preparing your certificate…" until the id arrives instead of linking to the list.
- `src/test/setup.ts` also calls `resetMockAdmin()`.
- e2e selectors tightened (`exact`, regex for the sidebar badge name); the 17-lesson certificate test gets a 90 s timeout.

Results: typecheck, lint and format clean · Vitest 21 files / 159 tests · Playwright 152/152 (desktop + mobile).
