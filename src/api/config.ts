export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

/** The mock API stays on unless explicitly disabled — there is no backend yet. */
export const USE_MOCK_API: boolean = import.meta.env.VITE_USE_MOCK_API !== "false";
