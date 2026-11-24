import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/api/envelope";

/** Don't retry client errors (4xx) — they won't fix themselves. */
const shouldRetry = (failureCount: number, error: unknown) => {
  if (isApiError(error) && error.status !== undefined && error.status < 500) return false;
  return failureCount < 2;
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: shouldRetry, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
