import { beforeEach, describe, expect, it } from "vitest";
import { API_ERROR_CODES } from "@/api/envelope";
import { findValidPromo, orders } from "@/api/mock/db/commerce";
import { resetMockAdmin } from "@/api/mock/db/admin";
import { authService } from "@/services/authService";
import { adminService } from "@/services/adminService";
import { useAuthStore } from "@/stores/authStore";

const loginAs = async (email: string, password: string) => useAuthStore.getState().setSession(await authService.login(email, password));
const asAdmin = () => loginAs("admin@brainxnext.com", "admin12345");
const asStudent = () => loginAs("hasibulx26@gmail.com", "password123");

beforeEach(() => resetMockAdmin());

describe("admin mock API — access control", () => {
  it.each([
    ["refund", () => adminService.refund("ORD-JS-8412", "Duplicate charge")],
    ["submission review", () => adminService.reviewSubmission("SUB-1001", "approved", "Great structure and clear tests overall.")],
    ["promos", () => adminService.promos()],
    ["counts", () => adminService.counts()],
  ])("%s: 401 for guests, 403 for students", async (_, call) => {
    await expect(call()).rejects.toMatchObject({ status: 401, code: API_ERROR_CODES.unauthorized });
    await asStudent();
    await expect(call()).rejects.toMatchObject({ status: 403, code: API_ERROR_CODES.forbidden });
  });
});

describe("admin mock API — payments", () => {
  beforeEach(asAdmin);

  it("refunds a paid order in full and records it on the timeline", async () => {
    const detail = await adminService.refund("ORD-JS-8412", "Charged twice by mistake");
    expect(detail.order.status).toBe("refunded");
    expect(detail.timeline.at(-1)).toMatchObject({
      label: expect.stringContaining("Refunded ৳4,900 by BrainXNext Admin"),
      detail: "Charged twice by mistake",
    });
    expect(orders.all().find((o) => o.id === "ORD-JS-8412")?.status).toBe("refunded");
    // already refunded → not refundable again
    await expect(adminService.refund("ORD-JS-8412", "Again please")).rejects.toMatchObject({ status: 409, code: "NOT_REFUNDABLE" });
  });

  it("approves or rejects a learner's refund request", async () => {
    await expect(adminService.rejectRefund("ORD-JS-8412", "Nothing to reject")).rejects.toMatchObject({ code: "NO_REFUND_REQUEST" });
    const rejected = await adminService.rejectRefund("ORD-UX-8342", "Course was mostly completed");
    expect(rejected.order.status).toBe("paid");
    const refunded = await adminService.refund("ORD-UX-8342", "Approved on second look");
    expect(refunded.order.status).toBe("refunded");
  });

  it("requires a reason", async () => {
    await expect(adminService.refund("ORD-JS-8412", "no")).rejects.toMatchObject({ status: 422, code: API_ERROR_CODES.validation });
  });
});

describe("admin mock API — submissions", () => {
  beforeEach(asAdmin);

  it("approves with feedback, the reviewer name and a timestamp", async () => {
    const before = (await adminService.counts()).pendingSubmissions;
    const s = await adminService.reviewSubmission("SUB-1001", "approved", "Bounds are right; the wildcard on line 42 is fine.");
    expect(s).toMatchObject({
      status: "approved",
      reviewer: "BrainXNext Admin",
      feedback: "Bounds are right; the wildcard on line 42 is fine.",
    });
    expect(s.reviewedAt).toEqual(expect.any(String));
    expect((await adminService.counts()).pendingSubmissions).toBe(before - 1);
  });

  it("requests changes, and rejects short feedback or an unknown decision", async () => {
    await expect(adminService.reviewSubmission("SUB-1002", "changes_requested", "Too short")).rejects.toMatchObject({ status: 422 });
    await expect(
      // @ts-expect-error — invalid decision on purpose
      adminService.reviewSubmission("SUB-1002", "maybe", "This is long enough feedback text.")
    ).rejects.toMatchObject({ status: 422 });
    await expect(
      adminService.reviewSubmission("SUB-1002", "changes_requested", "Add eviction tests before we approve this.")
    ).resolves.toMatchObject({
      status: "changes_requested",
    });
    await expect(adminService.reviewSubmission("SUB-404", "approved", "This is long enough feedback text.")).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe("admin mock API — promos, courses, inbox", () => {
  beforeEach(asAdmin);

  it("creates a promo that checkout then accepts, and deactivates it", async () => {
    await adminService.createPromo({ code: "SPRING25", percentOff: 25, expiresAt: null, usageLimit: 10 });
    expect(findValidPromo("spring25")?.percentOff).toBe(25);
    await expect(adminService.createPromo({ code: "SPRING25", percentOff: 10, expiresAt: null, usageLimit: null })).rejects.toMatchObject({
      status: 409,
      code: "PROMO_EXISTS",
    });
    await expect(adminService.updatePromo("SPRING25", { active: false })).resolves.toMatchObject({ status: "inactive" });
    expect(findValidPromo("SPRING25")).toBeUndefined();
  });

  it("creates, edits, unpublishes and deletes a course", async () => {
    const course = await adminService.course("java-generics");
    const { id } = await adminService.createCourse({ ...course.draft, title: "Kotlin Coroutines" }, "draft");
    expect(id).toBe("kotlin-coroutines");
    const edited = await adminService.updateCourse(id, { course: { ...course.draft, title: "Kotlin Coroutines in Depth" } });
    expect(edited).toMatchObject({ title: "Kotlin Coroutines in Depth", status: "draft" });
    await expect(adminService.updateCourse("java-generics", { status: "draft" })).resolves.toMatchObject({ status: "draft" });
    await adminService.deleteCourse(id);
    await expect(adminService.course(id)).rejects.toMatchObject({ status: 404 });
  });

  it("replies to a ticket and closes it", async () => {
    const t = await adminService.replyTicket("TCK-2041", "Yes — we invoice teams of 5 or more.");
    expect(t.status).toBe("replied");
    expect(t.replies.at(-1)).toMatchObject({ from: "admin", message: "Yes — we invoice teams of 5 or more." });
    await expect(adminService.setTicketStatus("TCK-2041", "closed")).resolves.toMatchObject({ status: "closed" });
  });
});
