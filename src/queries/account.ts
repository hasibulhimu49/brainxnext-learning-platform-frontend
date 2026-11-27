import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountService } from "@/services/accountService";
import { useAuthStore, useIsSignedIn } from "@/stores/authStore";
import type { Subscription } from "@/types/account";
import { queryKeys } from "./keys";
import { useEnrollments } from "./learning";

export const useDashboard = () => useQuery({ queryKey: queryKeys.me.dashboard, queryFn: accountService.dashboard });

export const useProfile = () => useQuery({ queryKey: queryKeys.me.profile, queryFn: accountService.profile, enabled: useIsSignedIn() });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: accountService.updateProfile,
    onSuccess: (profile) => {
      qc.setQueryData(queryKeys.me.profile, profile);
      // keep the navbar avatar / greeting in sync with the new name
      updateUser({ name: profile.name });
    },
  });
};

export const useChangePassword = () => useMutation({ mutationFn: accountService.changePassword });

/** Public certificate lookup by id (the /verify/:certId deep link). */
export const usePublicCertificate = (id: string) =>
  useQuery({ queryKey: queryKeys.certificate(id), queryFn: () => accountService.verifyCertificate(id), enabled: !!id, retry: false });

export const useSendContactMessage = () => useMutation({ mutationFn: accountService.sendContactMessage });

/* ---------------- certificates ---------------- */

export const useCertificates = () =>
  useQuery({ queryKey: queryKeys.me.certificates, queryFn: accountService.certificates, enabled: useIsSignedIn() });

export const useMyCertificate = (id: string) =>
  useQuery({ queryKey: queryKeys.me.myCertificate(id), queryFn: () => accountService.certificate(id), retry: false });

/* ---------------- subscription ---------------- */

export const useSubscription = () =>
  useQuery({ queryKey: queryKeys.me.subscription, queryFn: accountService.subscription, enabled: useIsSignedIn() });

/** Pro right now? undefined while loading (or signed out). */
export const useIsPro = () => {
  const { data } = useSubscription();
  return data ? data.plan === "pro" : undefined;
};

/**
 * Certificate + mentor review for a course: Pro, or bought that course (user decision, F-002).
 * undefined while either query is still loading.
 */
export const useCourseExtras = (courseId: string) => {
  const isPro = useIsPro();
  const { data: enrollments } = useEnrollments();
  if (isPro === undefined || !enrollments) return undefined;
  return isPro || enrollments.some((e) => e.courseId === courseId && e.source === "purchase");
};

const useSubscriptionMutation = <V>(fn: (v: V) => Promise<Subscription>) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: (sub) => qc.setQueryData(queryKeys.me.subscription, sub) });
};

export const useChangeCycle = () => useSubscriptionMutation(accountService.changeCycle);
export const useCancelSubscription = () => useSubscriptionMutation(accountService.cancelSubscription);
export const useResumeSubscription = () => useSubscriptionMutation(accountService.resumeSubscription);

/* ---------------- orders ---------------- */

export const useOrders = () => useQuery({ queryKey: queryKeys.me.orders, queryFn: accountService.orders, enabled: useIsSignedIn() });

export const useOrder = (id: string) =>
  useQuery({ queryKey: queryKeys.me.order(id), queryFn: () => accountService.order(id), retry: false });

export const useRequestRefund = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => accountService.requestRefund(id, reason),
    onSuccess: (order) => {
      qc.setQueryData(queryKeys.me.order(order.id), order);
      return Promise.all([
        qc.invalidateQueries({ queryKey: queryKeys.me.orders, exact: true }),
        qc.invalidateQueries({ queryKey: queryKeys.me.notifications }),
      ]);
    },
  });
};

/* ---------------- settings ---------------- */

export const usePreferences = () =>
  useQuery({ queryKey: queryKeys.me.preferences, queryFn: accountService.preferences, enabled: useIsSignedIn() });

export const useUpdatePreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: accountService.updatePreferences,
    onSuccess: (prefs) => qc.setQueryData(queryKeys.me.preferences, prefs),
  });
};

export const useStartEmailChange = () => useMutation({ mutationFn: accountService.startEmailChange });

/** The new address is verified: swap in the new session and refetch everything user-scoped. */
export const useConfirmEmailChange = () => {
  const qc = useQueryClient();
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: accountService.confirmEmailChange,
    onSuccess: (session) => {
      setSession(session, useAuthStore.getState().remember);
      return qc.invalidateQueries({ queryKey: queryKeys.me.all });
    },
  });
};

export const useDeleteAccount = () => useMutation({ mutationFn: accountService.deleteAccount });
