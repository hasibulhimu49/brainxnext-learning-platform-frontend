import { DELETE_CONFIRM_WORD, emailChangeSchema } from "@/schemas/account";
import { otpSchema } from "@/schemas/auth";
import { preferencesSchema } from "@/schemas/learner";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { removeSubscriber, renameSubscriber } from "../db/billing";
import { orders, submissions } from "../db/commerce";
import { removeLearner, renameLearner } from "../db/learning";
import { findUser, issueToken, preferencesOf, removeUser, toSessionUser, updateUser } from "../db/users";
import { bodyOf, fail, ok, str, type MockRoute } from "../http";
import { forbidden, invalid, requireUser, unauthorized } from "./shared";

/** Account settings: notification preferences, OTP-verified email change, account deletion. PROVISIONAL. */

/** "000000" simulates a wrong code, like the sign-up OTP. */
const BAD_OTP = "000000";

export const accountRoutes: MockRoute[] = [
  {
    method: "GET",
    path: "/me/preferences",
    handler: (req) => {
      const user = requireUser(req);
      return user ? ok(preferencesOf(user.email)) : unauthorized();
    },
  },
  {
    method: "PATCH",
    path: "/me/preferences",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const parsed = preferencesSchema.safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      updateUser(user.email, { prefs: { ...preferencesOf(user.email), ...parsed.data } });
      return ok(preferencesOf(user.email), 200, "Preferences saved");
    },
  },
  {
    method: "POST",
    path: "/me/email",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const parsed = emailChangeSchema.safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      if (parsed.data.password !== user.password) return fail(400, CODES.wrongPassword, "Your current password is incorrect.");
      const next = parsed.data.newEmail.toLowerCase();
      if (next === user.email.toLowerCase()) return invalid([{ path: ["newEmail"], message: "That's already your email" }]);
      if (findUser(next)) return fail(409, CODES.emailTaken, "An account with this email already exists.");
      updateUser(user.email, { pendingEmail: next });
      return ok({ sentTo: next });
    },
  },
  {
    method: "POST",
    path: "/me/email/verify",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      const parsed = otpSchema.safeParse(req.body);
      if (!parsed.success) return invalid(parsed.error.issues);
      const next = user.pendingEmail;
      if (!next) return fail(400, CODES.invalidCode, "Start the email change again — no new address is waiting.");
      if (findUser(next)) return fail(409, CODES.emailTaken, "An account with this email already exists.");
      if (parsed.data.code === BAD_OTP) return fail(400, CODES.invalidCode, "That code didn't match. Try again.");
      const from = user.email;
      updateUser(from, { email: next, pendingEmail: null });
      renameLearner(from, next);
      renameSubscriber(from, next);
      orders.update(
        (o) => o.userEmail === from,
        (o) => ({ ...o, userEmail: next })
      );
      submissions.update(
        (s) => s.userEmail === from,
        (s) => ({ ...s, userEmail: next })
      );
      const updated = findUser(next);
      // the old token encoded the old email, so the client gets a fresh session
      return updated ? ok({ token: issueToken(updated.email), user: toSessionUser(updated) }) : unauthorized();
    },
  },
  {
    method: "DELETE",
    path: "/me",
    handler: (req) => {
      const user = requireUser(req);
      if (!user) return unauthorized();
      if (user.role === "admin") return forbidden("Admin accounts can't be deleted here.");
      if (str(bodyOf(req).confirm) !== DELETE_CONFIRM_WORD) {
        return invalid([{ path: ["confirm"], message: `Type ${DELETE_CONFIRM_WORD} to confirm` }]);
      }
      removeLearner(user.email);
      removeSubscriber(user.email);
      removeUser(user.email);
      // orders stay: they are financial records the admin still needs
      return ok({ deleted: true });
    },
  },
];
