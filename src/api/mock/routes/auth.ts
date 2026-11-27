import { emailField, loginSchema, newPasswordField, otpSchema, registerSchema } from "@/schemas/auth";
import type { ForgotPasswordResult } from "@/types/auth";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { addUser, consumeResetToken, findUser, issueResetToken, issueToken, toSessionUser, updateUser } from "../db/users";
import { bodyOf, fail, ok, str, type MockRoute } from "../http";
import { invalid } from "./shared";

/** "000000" simulates a wrong verification code; anything else is accepted. */
const BAD_OTP = "000000";

export const authRoutes: MockRoute[] = [
  {
    method: "POST",
    path: "/auth/login",
    handler: (req) => {
      const parsed = loginSchema.omit({ remember: true }).safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      const user = findUser(parsed.data.email);
      if (!user) return fail(404, CODES.userNotFound, "No account found with that email. Create a free account first.");
      if (user.password !== parsed.data.password)
        return fail(401, CODES.wrongPassword, "Wrong password. Try again, or use “Forgot password?” above.");
      if (!user.verified) return fail(403, CODES.emailNotVerified, "Please verify your email before logging in.");
      return ok({ token: issueToken(user.email), user: toSessionUser(user) });
    },
  },
  {
    method: "POST",
    path: "/auth/register",
    handler: (req) => {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      if (findUser(parsed.data.email)) return fail(409, CODES.emailTaken, "An account with this email already exists.");
      addUser(parsed.data);
      return ok({ email: parsed.data.email }, 201);
    },
  },
  {
    method: "POST",
    path: "/auth/verify-otp",
    handler: (req) => {
      const b = bodyOf(req);
      const parsed = otpSchema.safeParse(b);
      if (!parsed.success) return invalid(parsed.error.issues);
      // only an email with a pending (unverified) sign-up can be verified
      const user = findUser(str(b.email));
      if (!user || user.verified) {
        return fail(404, CODES.noPendingSignup, "We couldn't find a pending sign-up for that email. Register again.");
      }
      if (parsed.data.code === BAD_OTP) return fail(400, CODES.invalidCode, "That code didn't match. Try again.");
      updateUser(user.email, { verified: true });
      return ok({ token: issueToken(user.email), user: toSessionUser(user) });
    },
  },
  { method: "POST", path: "/auth/resend-otp", handler: (req) => ok({ sentTo: str(bodyOf(req).email) }) },
  {
    method: "POST",
    path: "/auth/forgot-password",
    handler: (req) => {
      const parsed = emailField.safeParse(bodyOf(req).email);
      if (!parsed.success) return invalid(parsed.error.issues);
      const user = findUser(parsed.data);
      // Always succeed so the endpoint can't be used to probe which emails exist.
      const result: ForgotPasswordResult = { sentTo: parsed.data };
      // The demo has no inbox, so it hands back the link that would have been emailed.
      if (user) result.devResetLink = `/reset-password?token=${encodeURIComponent(issueResetToken(user.email))}`;
      return ok(result);
    },
  },
  {
    method: "POST",
    path: "/auth/reset-password",
    handler: (req) => {
      const b = bodyOf(req);
      const parsed = newPasswordField.safeParse(b.password);
      if (!parsed.success) return invalid(parsed.error.issues);
      const email = consumeResetToken(str(b.token));
      if (!email || !findUser(email)) {
        return fail(400, CODES.invalidResetToken, "This reset link is invalid or has expired. Request a new one.");
      }
      updateUser(email, { password: parsed.data });
      return ok({ reset: true });
    },
  },
];
