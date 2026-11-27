# F-005 — Testing

## Automated

| Level | File | What it covers |
| ----- | ---- | -------------- |
| Unit (Vitest) | `src/api/mock/routes/assistant.test.ts` | topic recommendations (free first), Pro price / promo / refunds, open-lesson help, Help + Contact fallback, empty message → `400` |
| Component (RTL) | `src/components/assistant/AssistantWidget.test.tsx` | open → starter question → course suggestions, typed question, Escape closes; modal dialog with focus trap; hidden in the admin panel |
| End-to-end (Playwright) | `e2e/smoke.spec.ts`, `e2e/responsive.spec.ts` | the widget doesn't break any route or widen the page at 360px |

## Results

| Date | Command | Result |
| ---- | ------ | ------ |
| 2026-11-27 | `npm test` (F-009 final run) | 50 files, 246 tests pass |
