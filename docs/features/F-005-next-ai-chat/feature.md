# F-005 — Next AI chat

**Status:** Done (demo answers) — 2026-11-26

## Goal

A floating "Next AI" circle on every page except `/admin` opens a chat that answers learner questions:
which course to start, Pro, prices, the promo code, refunds, certificates, and help with the open lesson.

## Decisions (approved)

- **Demo answers now, real AI later.** There is no backend, and an AI provider's API key must never ship in
  frontend code. The mock endpoint `POST /assistant/chat` answers from site content (catalog, plans, Help Center).
  When the backend adds an AI chat endpoint, only `src/api/mock/routes/assistant.ts` goes away — the widget,
  service and types stay. The backend should validate input, rate-limit, and keep the key server-side.
- **Placement:** every page except the admin panel; in the player it knows the open lesson.

## Pieces

`components/assistant/AssistantWidget.tsx` (circle + panel, Escape closes, focus handling, `aria-live` messages),
`services/assistantService.ts`, `queries/assistant.ts` (`useAskAssistant`), `types/assistant.ts`,
`constants/assistant.ts`, mock `routes/assistant.ts`. The conversation is widget UI state (lives while the app is open).
The course page's mobile enrol bar sets `--bx-bottom-bar` so the circle sits above it.

## Tests

`src/api/mock/routes/assistant.test.ts`, `src/components/assistant/AssistantWidget.test.tsx`.
