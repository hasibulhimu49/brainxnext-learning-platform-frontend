import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { useIsSignedIn } from "@/stores/authStore";
import { queryKeys } from "./keys";

/** The bell's list (derived on the server from submissions, certificates and orders). */
export const useNotifications = () =>
  useQuery({ queryKey: queryKeys.me.notifications, queryFn: notificationService.list, enabled: useIsSignedIn(), staleTime: 30_000 });

/** Mark some (or, with no ids, all) notifications read; the response replaces the cached list. */
export const useMarkNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => notificationService.markRead(ids),
    onSuccess: (list) => qc.setQueryData(queryKeys.me.notifications, list),
  });
};
