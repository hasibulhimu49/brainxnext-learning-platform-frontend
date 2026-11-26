import { useMutation } from "@tanstack/react-query";
import { assistantService } from "@/services/assistantService";
import type { AssistantContext } from "@/types/assistant";

/** One question to Next AI; the conversation itself is local UI state in the widget. */
export const useAskAssistant = () =>
  useMutation({
    mutationFn: ({ message, context }: { message: string; context: AssistantContext }) => assistantService.ask(message, context),
  });
