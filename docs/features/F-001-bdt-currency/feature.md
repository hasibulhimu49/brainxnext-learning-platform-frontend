# F-001 — Prices in Bangladeshi Taka (৳)

**Status:** Done (2026-11-25, shipped with F-002 Phase 1)
**Owner:** Mohammad Hasibul Hasan
**Design:** Figma exports — the support/donation and admin screens already use ৳; the course, pricing and checkout screens use $
**Backend API docs:** not available yet (prices currently come from the mock API)

## Summary

Show every price in the app in Bangladeshi Taka (৳) instead of a mix of $ and ৳. The interface stays English-only. The **course** language label ("Bangla" or "English") is course content information, not UI language, so it stays.

## User stories

- As a learner in Bangladesh, I want to see prices in Taka so that I know exactly what I will pay with bKash, Nagad or a card.
- As an admin, I want to set course prices in Taka so that the catalog, checkout and reports use one currency.

## Screens and states

| Screen / route | What changes |
| --- | --- |
| `/` (pricing section), `/pricing` | plan prices, yearly note, FAQ price range |
| `/courses`, `/courses/:courseId`, course cards | course price and struck-through old price |
| `/checkout/:courseId` | course price, promo discount, total ("VAT included" instead of a tax line), the "Pay ৳…" button |
| `/dashboard` | "Recommended for you" price line |
| `/settings/billing` | current plan and billing history amounts |
| `/admin/courses/new` | price field label "Price (BDT)", card preview |
| `/admin/*` | already ৳; make the mock rows consistent |
| `/support`, `/thank-you` | already ৳, no change |

## Business rules

- Amounts are whole Taka with no decimals: `৳4,900`, not `৳4,900.00`.
- The ৳ sign comes before the number with no space.
- Free courses still show "Free", not "৳0".
- Promo `LEARN20` still gives 20% off, rounded to the nearest Taka.
- South-Asian (lakh) grouping: `৳1,24,000` (`Intl.NumberFormat("en-IN")`).
- Prices are VAT-inclusive; checkout says "VAT included" instead of a tax line.

## Backend API dependencies

None documented yet. Until the backend docs arrive, the mock API returns prices as whole-Taka integers. When the docs arrive, they decide the field names and units (for example Taka vs poisha) and the mock follows them.

## Out of scope

- Multi-currency support or currency switching.
- Bangla (or any other) UI translation. The app is English-only by decision.
- Real payment gateway integration.

## Open questions (resolved 2026-11-24)

1. **Price list:** approved as proposed (×100): courses ৳3,900–৳8,900, Pro ৳1,900/mo or ৳1,400/mo billed yearly (৳16,800/yr, save ৳6,000), Teams ৳1,400 / ৳1,000 per seat.
2. **Number grouping:** South-Asian lakh grouping (`৳1,24,000`).
3. **Tax/VAT:** prices are VAT-inclusive; checkout shows "VAT included".
