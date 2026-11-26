export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

/** The mock API stays on unless explicitly disabled — there is no backend yet. */
export const USE_MOCK_API: boolean = import.meta.env.VITE_USE_MOCK_API !== "false";

/**
 * Until the backend exists, anyone (even signed out) can open /admin to try the admin panel.
 * Locks again automatically when the mock API is turned off; set VITE_OPEN_ADMIN=false to lock it sooner.
 */
export const OPEN_ADMIN: boolean = USE_MOCK_API && import.meta.env.VITE_OPEN_ADMIN !== "false";
