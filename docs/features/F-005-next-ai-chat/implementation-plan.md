# F-005 — Implementation plan

**Status:** Done — 2026-11-26. The approved decisions are in `feature.md`; this plan was written down after the fact in F-009 from the shipped code.

## Approach

- Endpoint `POST /assistant/chat` (provisional) in the mock (`routes/assistant.ts`) answers from site content: catalog, `constants/plans.ts`, `constants/help.ts` and the open lesson's curriculum.
- `services/assistantService.ts` → `queries/assistant.ts` (`useAskAssistant` mutation) → `components/assistant/AssistantWidget.tsx`.
- State: the conversation is widget-local UI state; no store. Context (`path`, `courseId`, `lessonId`) is read from the route.
- Not shown under `/admin`. No AI key in the frontend — the backend will own the model call.

## Testing

See `testing.md`.
