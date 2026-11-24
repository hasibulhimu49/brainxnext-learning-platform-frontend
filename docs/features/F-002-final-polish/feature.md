# F-002 — Final polish: missing screens and broken flows

**Status:** In progress — Phase 1 (Foundation) done 2026-11-25
**Owner:** Mohammad Hasibul Hasan
**Design:** existing Figma exports; every new screen reuses their components and tokens (`docs/project/ui-guidelines.md`)
**Backend API docs:** not available. New endpoints in the mock are provisional placeholders (see CLAUDE.md §3)

## Summary

Five read-only audits (2026-11-24) walked the app as a learner, an admin, a security tester, a paying customer and a first-time visitor. The screens look finished, but most flows are **not connected**:

- **One course per page.** `/learn`, `/checkout` and `/certificate` always show the same hard-coded course (Java Generics, Modern JavaScript and SQL respectively).
- **Nothing is saved.** Enrolment, lesson progress, purchases and notification settings are lost on reload.
- **No access control.** Signed-out visitors and students can open `/dashboard`, `/learn` and `/admin`.
- **Admin is read-only.** Only "Create course" works; Edit, Refund, Reply, Review, Export and Import do nothing.
- **Money flow is incomplete.** "Go Pro" sells a single course, and there is no subscription, receipt, order history or refund.
- **Dead links.** Privacy, Terms and Refunds point to `/`. The handbook download goes in a loop and never downloads a file.

## Findings by area

### A. Access and security (High)
| # | Gap | Where |
| --- | --- | --- |
| A1 | No route guards (guest/student can open admin); mock `/me/dashboard` and admin endpoints skip auth/role | `AppRoutes.tsx:53-78`, `routes.ts:120,201-219` |
| A2 | Login ignores the page you came from; admins land on the student dashboard; signed-in users can still open `/login` and `/register` | `Login.tsx:29` |
| A3 | Password reset has no token, so anyone can reset any account | `ResetPassword.tsx:17`, `routes.ts:86-94`, `ForgotPassword.tsx:63` |
| A4 | Unverified accounts can log in; OTP verify trusts the email in the request | `routes.ts:42-45,66-70` |
| A5 | A 401 logs the user out silently, with no "session expired" message | `client.ts:27` |
| A6 | Navbar ignores the session: guests see an avatar and logout, signed-in users see Login/Sign up; fallback name is the real owner's name | `Navbar.tsx:60,111`, `Dashboard.tsx:10`, `Certificate.tsx:26` |
| A7 | Logout incomplete: admin "Exit to site" doesn't log out; no logout in the player; `admin` queries survive logout | `Sidebar.tsx:45`, `queries/auth.ts:51` |
| A8 | Remember-me checkbox does nothing | `Login.tsx:28` |

### B. Learner journey
| # | Missing screen / fix | Proposed route | Priority |
| --- | --- | --- | --- |
| B1 | Player per course and lesson, with prev/next and locked lessons for non-buyers | `/learn/:courseId/:lessonId?` | High |
| B2 | Enrolment and lesson progress saved through the API | — | High |
| B3 | Course-complete screen → certificate earned | in player | High |
| B4 | Certificates list + certificate per id | `/certificates`, `/certificates/:id` | High |
| B5 | Public certificate verification (LinkedIn link points here) | `/verify/:id` | High |
| B6 | Project submission + mentor feedback (promised on Home, Pricing, About) | `/learn/:courseId/project`, `/dashboard/reviews` | High |
| B7 | Notifications dropdown (bell does nothing) | dropdown | Med |
| B8 | My courses list with filters (in progress / completed) | `/dashboard/courses` | Low |
| B9 | Empty states: new user with no courses or certificates | dashboard | Med |
| B10 | Real downloads: player resources, handbook after donation | — | Med |

### C. Money and business
| # | Missing screen / fix | Proposed route | Priority |
| --- | --- | --- | --- |
| C1 | Course checkout for the chosen course | `/checkout/:courseId` | High |
| C2 | Plan checkout (Pro monthly/yearly) | `/checkout/plan/:plan?cycle=` | High |
| C3 | Order confirmation / receipt | `/orders/:orderId` | High |
| C4 | bKash/Nagad "approve on your phone" pending screen + failed/retry | in checkout | High |
| C5 | Order history + invoice detail (Invoice buttons are dead) | `/settings/billing` | High |
| C6 | Manage subscription: change plan, cycle, cancel ("active until…") | `/settings/billing` | High |
| C7 | Refund request (30-day guarantee promised 4×) | dialog in billing | Med |
| C8 | Donation payment step (amount, method, processing) before thank-you; validate `?amount=` | `/support` | Med |
| C9 | Paywall / upgrade prompt for paid lessons | in player | High |
| C10 | "Already enrolled / already Pro" states | checkout | Med |
| C11 | Price/plan inconsistencies (Settings shows $12, Pricing $19; "12 free / 48 courses" vs mock 8/16) — fixed together with **F-001** (Taka) | — | Med |

### D. Admin
| # | Missing screen / fix | Proposed route | Priority |
| --- | --- | --- | --- |
| D1 | Row ids, row actions, pagination, sorting | all tables | High |
| D2 | Course detail (stats, lessons, unpublish/delete) + edit (reuse new-course form) | `/admin/courses/:id`, `/admin/courses/:id/edit` | High |
| D3 | Student detail (enrolments, orders, certificates, suspend, grant course) | `/admin/students/:id` | High |
| D4 | Transaction detail + refund + CSV export | `/admin/payments/:id` | High |
| D5 | Submission review queue + review screen (feedback, approve / request changes) — pairs with B6 | `/admin/submissions`, `/admin/submissions/:id` | High |
| D6 | Promo codes (code, % off, expiry, limit) | `/admin/promos` | High |
| D7 | Support inbox for contact-form tickets | `/admin/inbox`, `/admin/inbox/:id` | High |
| D8 | Reply / hide learner reviews; handbook create / upload version | dialogs | Med |
| D9 | Confirmation dialog + success toast primitives; unsaved-changes warning in course editor | shared | High |
| D10 | Sidebar shows the signed-in admin + real logout | `Sidebar.tsx` | High |

### E. Public site, legal, polish
| # | Missing page / fix | Proposed route | Priority |
| --- | --- | --- | --- |
| E1 | Privacy, Terms, Refund policy | `/privacy`, `/terms`, `/refunds` | High |
| E2 | Help / FAQ | `/help` | Med |
| E3 | "Apply as a mentor" / "Talk to us" preselect the contact topic | `/contact?topic=` | Med |
| E4 | Per-route page titles + meta/OG tags | all | Med |
| E5 | Stable navbar/footer link sets (Pricing/About reachable everywhere) | shared | Med |
| E6 | 403, 500 and error boundary pages; route-level error element | `/403`, boundary | Med |
| E7 | Accessibility: focus ring, reduced motion, skip link, mobile menu Escape/focus | shared | Med |
| E8 | Real Discord/YouTube URLs; local handbook logos instead of CDN | — | Low |
| E9 | Delete-account dialog, email change re-verification, notification prefs saved, confirm-password field | Settings | Med |

## Deliberately deferred (not in this feature)
- Quizzes / practice problems, public portfolio `/u/:handle`, mentor profiles, mentor/plan/certificate admin CRUD, admin roles and audit log, scholarships, blog, avatar upload.
- Real Google/GitHub OAuth and real payment gateways (need the backend).

## Open questions
1. **Backend API docs.** Every new endpoint (enrol, progress, orders, subscriptions, refunds, submissions, promos, inbox, notifications) will be a provisional mock until they arrive. Do you have them?
2. **Scope.** Approve all four phases, or only some? (See `implementation-plan.md`.)
3. **Handbook files.** Do you have real PDFs, or should the download use placeholder files for now?
4. **Legal text.** I can draft Privacy, Terms and Refund pages from the promises already on the site, but they need your own (or a lawyer's) review.
5. **Social links.** The real Discord and YouTube URLs?
6. **Free vs Pro rules.** What exactly do Pro users unlock? Proposal: all courses, mentor review and certificates. Free users get free courses only, with no certificate.
