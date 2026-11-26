import { api } from "@/api/client";
import type { AssistantContext, AssistantReply } from "@/types/assistant";

/** Next AI chat (F-005). Provisional endpoint — the mock answers from site content until the backend adds a real AI. */
export const assistantService = {
  ask: (message: string, context: AssistantContext) => api.post<AssistantReply>("/assistant/chat", { message, context }),
};
