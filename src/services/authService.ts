import { api } from "@/api/client";
import type { AuthSession, ForgotPasswordResult } from "@/types/auth";

export const authService = {
  login: (email: string, password: string) => api.post<AuthSession>("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) => api.post<{ email: string }>("/auth/register", { name, email, password }),
  verifyOtp: (email: string, code: string) => api.post<AuthSession>("/auth/verify-otp", { email, code }),
  resendOtp: (email: string) => api.post<{ sentTo: string }>("/auth/resend-otp", { email }),
  forgotPassword: (email: string) => api.post<ForgotPasswordResult>("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => api.post<{ reset: boolean }>("/auth/reset-password", { token, password }),
};
