import { OPEN_ADMIN } from "../../config";
import { API_ERROR_CODES as CODES } from "../../envelope";
import { userFromToken } from "../db/users";
import { fail, type MockRequest, type MockResult } from "../http";

/** Helpers shared by every mock route module. */

export const invalid = (issues: unknown) => fail(422, CODES.validation, "Some fields need attention.", issues);

export const unauthorized = () => fail(401, CODES.unauthorized, "Please log in again.");

export const forbidden = (message = "You don't have access to this.") => fail(403, CODES.forbidden, message);

/** The signed-in user behind the bearer token, if any. */
export const requireUser = (req: MockRequest) => userFromToken(req.token);

/** null when the caller is a signed-in admin; otherwise the 401 / 403 response to return. */
export const requireAdmin = (req: MockRequest): MockResult | null => {
  if (OPEN_ADMIN) return null; // demo mode, see OPEN_ADMIN in src/api/config.ts
  const user = requireUser(req);
  if (!user) return unauthorized();
  return user.role === "admin" ? null : forbidden("This area is for admins.");
};
