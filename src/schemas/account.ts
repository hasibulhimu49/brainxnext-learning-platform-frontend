import { z } from "zod";
import { emailField, newPasswordField, otpSchema } from "./auth";

/** Settings → Profile. The email is not editable here — it changes through the OTP-verified email change. */
export const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your full name"),
  bio: z.string().max(280, "Keep your bio under 280 characters"),
  portfolio: z.string().trim(),
  goal: z.string().trim(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: newPasswordField,
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/** Step 1 of the email change: the new address + the current password. */
export const emailChangeSchema = z.object({
  newEmail: emailField,
  password: z.string().min(1, "Enter your current password"),
});
export type EmailChangeValues = z.infer<typeof emailChangeSchema>;

/** Step 2: the 6-digit code sent to the new address. */
export const emailChangeCodeSchema = otpSchema;

export const DELETE_CONFIRM_WORD = "DELETE";

export const deleteAccountSchema = z.object({
  confirm: z.string().refine((v) => v.trim() === DELETE_CONFIRM_WORD, `Type ${DELETE_CONFIRM_WORD} to confirm`),
});
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;

export const CONTACT_TOPICS = ["Course question", "Billing", "Teams", "Teach with us", "Other"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email: emailField,
  topic: z.enum(CONTACT_TOPICS),
  message: z.string().trim().min(1, "Tell us what's on your mind"),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const CERT_ID_EXAMPLE = "BXN-2026-SQ-08412";

export const certificateLookupSchema = z.object({
  certId: z.string().trim().min(1, "Enter a certificate ID").toUpperCase(),
});
export type CertificateLookupValues = z.infer<typeof certificateLookupSchema>;
