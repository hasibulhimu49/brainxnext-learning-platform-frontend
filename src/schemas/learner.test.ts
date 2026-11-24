import { describe, expect, it } from "vitest";
import { changePasswordSchema, deleteAccountSchema, emailChangeSchema, profileSchema } from "./account";
import { preferencesSchema, projectSubmissionSchema, refundRequestSchema } from "./learner";

describe("learner schemas (F-002 Phase 2)", () => {
  it("validates a project submission", () => {
    const ok = { title: "Typed cache", repoUrl: "https://github.com/me/cache", notes: "" };
    expect(projectSubmissionSchema.safeParse(ok).success).toBe(true);
    expect(projectSubmissionSchema.safeParse({ ...ok, title: "ab" }).success).toBe(false);
    expect(projectSubmissionSchema.safeParse({ ...ok, repoUrl: "github.com/me" }).success).toBe(false);
    expect(projectSubmissionSchema.safeParse({ ...ok, repoUrl: "ftp://x.com/a" }).success).toBe(false);
    expect(projectSubmissionSchema.safeParse({ ...ok, notes: "x".repeat(1001) }).success).toBe(false);
  });

  it("needs a real refund reason", () => {
    expect(refundRequestSchema.safeParse({ reason: "too short" }).success).toBe(false);
    expect(refundRequestSchema.safeParse({ reason: "   The level was too basic   " }).data?.reason).toBe("The level was too basic");
  });

  it("accepts partial preference patches only with known values", () => {
    expect(preferencesSchema.safeParse({ digest: "Daily" }).success).toBe(true);
    expect(preferencesSchema.safeParse({ digest: "Hourly" }).success).toBe(false);
    expect(preferencesSchema.safeParse({ community: "yes" }).success).toBe(false);
  });
});

describe("account schemas (F-002 Phase 2)", () => {
  it("requires the new password twice", () => {
    expect(changePasswordSchema.safeParse({ current: "a", next: "password123", confirm: "password123" }).success).toBe(true);
    const mismatch = changePasswordSchema.safeParse({ current: "a", next: "password123", confirm: "password124" });
    expect(mismatch.error?.issues[0]).toMatchObject({ path: ["confirm"], message: "Passwords don't match" });
  });

  it("only deletes the account after typing DELETE", () => {
    expect(deleteAccountSchema.safeParse({ confirm: "DELETE" }).success).toBe(true);
    expect(deleteAccountSchema.safeParse({ confirm: "delete" }).success).toBe(false);
  });

  it("asks for a valid new email and the password", () => {
    expect(emailChangeSchema.safeParse({ newEmail: "a@b.co", password: "x" }).success).toBe(true);
    expect(emailChangeSchema.safeParse({ newEmail: "nope", password: "x" }).success).toBe(false);
    expect(emailChangeSchema.safeParse({ newEmail: "a@b.co", password: "" }).success).toBe(false);
  });

  it("no longer edits the email through the profile", () => {
    const parsed = profileSchema.parse({ name: "A", email: "x@y.z", bio: "", portfolio: "", goal: "" });
    expect(parsed).not.toHaveProperty("email");
  });
});
