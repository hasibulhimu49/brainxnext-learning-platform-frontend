# F-XXX — Review

**Reviewer:**
**Date:**

## Checklist

- [ ] Matches `feature.md` and the approved `implementation-plan.md`
- [ ] Uses only documented backend endpoints and fields
- [ ] API calls go through `src/services` + TanStack Query (no axios/fetch in components)
- [ ] Response types are explicit; `success` is checked via the envelope; errors use `ApiError` / `errorMessage`
- [ ] Server state is not copied into Zustand; any new global state has a documented owner
- [ ] Forms use React Hook Form + Zod
- [ ] No `any`; typecheck, lint and Prettier clean
- [ ] Tests from `testing.md` added and passing
- [ ] Matches the Figma design in light and dark mode, desktop and mobile
- [ ] No new dependency without justification

## Findings

| # | Severity | Finding | Resolution |
| - | -------- | ------- | ---------- |
