import { z } from "zod";

export const emailField = z.string().trim().min(1, "Enter your email address").pipe(z.email("Enter a valid email address"));

export const newPasswordField = z.string().min(8, "Use at least 8 characters");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Enter your full name"),
  email: emailField,
  password: newPasswordField,
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: emailField });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: newPasswordField,
    confirm: z.string().min(1, "Confirm your new password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const OTP_LENGTH = 6;

export const otpSchema = z.object({
  code: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter all ${OTP_LENGTH} digits`),
});
export type OtpValues = z.infer<typeof otpSchema>;

/** 0 = too short … 3 = strong */
export const passwordStrength = (pw: string): 0 | 1 | 2 | 3 => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) s++;
  if (pw.length >= 12 && /[^A-Za-z0-9]/.test(pw)) s++;
  return s as 0 | 1 | 2 | 3;
};
