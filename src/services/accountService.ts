import { api } from "@/api/client";
import type { ChangePasswordValues, ContactValues, EmailChangeValues, ProfileValues } from "@/schemas/account";
import type { PreferencesPatch } from "@/schemas/learner";
import type { CertificateRecord, NotificationPreferences, Profile, Subscription } from "@/types/account";
import type { AuthSession } from "@/types/auth";
import type { BillingCycle, OrderRecord } from "@/types/commerce";
import type { DashboardData } from "@/types/dashboard";

const enc = encodeURIComponent;

export const accountService = {
  dashboard: () => api.get<DashboardData>("/me/dashboard"),
  profile: () => api.get<Profile>("/me/profile"),
  updateProfile: (values: ProfileValues) => api.patch<Profile>("/me/profile", values),
  changePassword: (values: ChangePasswordValues) => api.post<{ changed: boolean }>("/me/password", values),
  /** public lookup (no auth) */
  verifyCertificate: (id: string) => api.get<CertificateRecord>(`/certificates/${enc(id)}`),
  sendContactMessage: (values: ContactValues) => api.post<{ ticketId: string }>("/contact", values),

  /* ---- PROVISIONAL (F-002 Phase 2) ---- */
  certificates: () => api.get<CertificateRecord[]>("/me/certificates"),
  certificate: (id: string) => api.get<CertificateRecord>(`/me/certificates/${enc(id)}`),

  subscription: () => api.get<Subscription>("/me/subscription"),
  changeCycle: (cycle: BillingCycle) => api.patch<Subscription>("/me/subscription", { cycle }),
  cancelSubscription: () => api.post<Subscription>("/me/subscription/cancel"),
  resumeSubscription: () => api.post<Subscription>("/me/subscription/resume"),

  orders: () => api.get<OrderRecord[]>("/me/orders"),
  order: (id: string) => api.get<OrderRecord>(`/me/orders/${enc(id)}`),
  requestRefund: (id: string, reason: string) => api.post<OrderRecord>(`/me/orders/${enc(id)}/refund`, { reason }),

  preferences: () => api.get<NotificationPreferences>("/me/preferences"),
  updatePreferences: (patch: PreferencesPatch) => api.patch<NotificationPreferences>("/me/preferences", patch),

  startEmailChange: (values: EmailChangeValues) => api.post<{ sentTo: string }>("/me/email", values),
  /** returns a fresh session: the old token belonged to the old email */
  confirmEmailChange: (code: string) => api.post<AuthSession>("/me/email/verify", { code }),
  deleteAccount: (confirm: string) => api.delete<{ deleted: boolean }>("/me", { data: { confirm } }),
};
