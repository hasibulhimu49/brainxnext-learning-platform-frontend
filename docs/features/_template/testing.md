# F-XXX — Testing

## Automated

| Level | File | What it covers |
| ----- | ---- | -------------- |
| Unit (Vitest) | `src/schemas/….test.ts` | |
| Component (RTL) | `src/pages/….test.tsx` | |
| End-to-end (Playwright) | `e2e/….spec.ts` | |

## Scenarios

- [ ] Happy path
- [ ] Validation errors
- [ ] Each backend error code the UI handles
- [ ] Loading and empty states
- [ ] Light and dark theme
- [ ] Mobile (≤640px) and desktop layouts

## Manual checks

- Matches the Figma design (spacing, breakpoints).

## Results

| Date | Command | Result |
| ---- | ------- | ------ |
| | `npm run typecheck && npm run lint && npm test` | |
| | `npm run test:e2e` | |
