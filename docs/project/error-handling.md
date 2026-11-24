# Error handling

- All request failures surface as `ApiError` (`src/api/envelope.ts`) with `code`, `message`, `status`, `details`.
  - Failure envelope → the server's `code` and `message`.
  - Not an envelope → `INVALID_ENVELOPE`; payload fails its Zod schema → `INVALID_RESPONSE`.
  - No response → `NETWORK_ERROR`.
- **Queries**: `<QueryStatus>` renders a message with a "Try again" button. 404s for a course redirect to the 404 page.
- **Mutations**: show `errorMessage(mutation.error)` in an `Alert`; reset the mutation when the user edits the form.
- **401**: the response interceptor calls `expireSession()`; if a session existed, `RequireAuth` redirects to `/login?next=…&reason=expired` and the login page shows "Your session expired — please log in again."
- **403**: `RequireRole` renders the 403 page (`src/pages/Forbidden.tsx`, also at `/403`) for signed-in users without the role. API `FORBIDDEN` / `NOT_ENROLLED` errors show an `Alert`.
- **Render crashes**: `AppErrorBoundary` (`src/components/common/AppErrorBoundary.tsx`) wraps all routes and shows the 500 page (`src/pages/ServerError.tsx`: "Something broke on our side", Try again / Back home). It resets when the path changes.
- **Domain codes** the UI branches on: `EMAIL_NOT_VERIFIED` (login → verify link), `INVALID_RESET_TOKEN` (reset → "Request a new link"), `PAYMENT_REQUIRED`, `ALREADY_ENROLLED`, `NOT_FOUND` (course pages → `/404`).
- **Success feedback**: toasts via `sonner` (logout, enrolment); form successes still replace the form inside the same card.
- **Retries**: none for 4xx; up to two for other query failures; never for mutations.
