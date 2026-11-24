# Feature documentation

One folder per feature, named `F-<number>-<short-name>` (three-digit number, kebab-case name):

```
docs/features/F-011-voucher-coupon/
├── feature.md               what and why: user stories, screens, rules, API dependencies
├── implementation-plan.md   how: files, state, routes, validation — approved before coding
├── testing.md               what is tested and how (unit, component, e2e, manual)
├── review.md                review checklist and findings before merge
└── changelog.md             short log of what shipped and when
```

## Workflow

1. Copy `_template/` to a new folder and fill in `feature.md`.
2. Write `implementation-plan.md` (follow "Before Coding" in `CLAUDE.md`), then **stop for approval**.
3. Implement. Keep `testing.md` in sync with the tests you write.
4. Fill in `review.md` before merging.
5. Add a line to `changelog.md` when it ships.

## Rules

- Backend API documentation is the source of truth. `feature.md` links to the endpoints it depends on; it does not invent or redefine them. Unknowns go under "Open questions".
- Keep docs short and current — update them in the same change as the code.
- Use the next free number. Numbers are never reused.

## Index

| ID  | Feature | Status |
| --- | ------- | ------ |
| [F-001](F-001-bdt-currency/feature.md) | Prices in Bangladeshi Taka (৳) | Done |
| [F-002](F-002-final-polish/feature.md) | Final polish: missing screens and broken flows | Done (phases 1–4) — 2026-11-25 |
| [F-003](F-003-mobile-responsive/feature.md) | Mobile responsiveness pass | Done — 2026-11-25 |
