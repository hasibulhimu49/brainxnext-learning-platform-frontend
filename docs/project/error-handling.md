# Error handling

- All request failures surface as `ApiError` (`src/api/envelope.ts`) with `code`, `message`, `status`, `details`.
  - Failure envelope → the server's `code` and `message`.
  - Not an envelope → `INVALID_ENVELOPE`; payload fails its Zod schema → `INVALID_RESPONSE`.
  - No response → `NETWORK_ERROR`.
- **Queries**: `<QueryStatus>` renders a message with a "Try again" button. 404s for a course redirect to the 404 page.
- **Mutations**: show `errorMessage(mutation.error)` in an `Alert`; reset the mutation when the user edits the form.
- **401**: the response interceptor calls `expireSession()`; if a session existed, `RequireAuth` redirects to `/login?next=…&reason=expired` and the login page shows "Your session expired — please log in again."
- **403**: `RequireRole` renders the 403 page (`src/pages/errors/Forbidden.tsx`, also at `/403`) for signed-in users without the role. API `FORBIDDEN` / `NOT_ENROLLED` errors show an `Alert`.
- **Render crashes**: `AppErrorBoundary` (`src/components/common/AppErrorBoundary.tsx`) wraps all routes and shows the 500 page (`src/pages/errors/ServerError.tsx`: "Something broke on our side", Try again / Back home). It resets when the path changes.
- **Domain codes** the UI branches on: `EMAIL_NOT_VERIFIED` (login → verify link), `WRONG_PASSWORD` (login → forgot-password hint), `EMAIL_TAKEN` (register → log-in link), `INVALID_CODE` (OTP), `INVALID_RESET_TOKEN` (reset → "Request a new link"), `NOT_ENROLLED` (quiz → enrol card), `NOT_FOUND` (course, player, checkout, quiz and project pages → `/404`). Other codes are shown through `errorMessage()`. The full list is in `api-guidelines.md`; every code the mock returns is in `API_ERROR_CODES`, including `INTERNAL_ERROR` for unexpected mock failures.
- **Success feedback**: toasts via `sonner` (logout, enrolment); form successes still replace the form inside the same card.
- **Retries**: none for 4xx; up to two for other query failures; never for mutations.
