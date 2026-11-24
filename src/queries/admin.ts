import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddStudentValues, NoteValues, PromoInput } from "@/schemas/admin";
import type { CourseDraftValues } from "@/schemas/course";
import { adminService } from "@/services/adminService";
import type { AdminCoursePatch, AdminCourseStatus, AdminStudentStatus, SubmissionDecision } from "@/types/admin";
import { queryKeys } from "./keys";

const keys = queryKeys.admin;

/* ---------------- queries ---------------- */

export const useAdminOverview = () => useQuery({ queryKey: keys.overview, queryFn: adminService.overview });
/** Sidebar badges; refreshed after every admin mutation. */
export const useAdminCounts = () => useQuery({ queryKey: keys.counts, queryFn: adminService.counts });

export const useAdminCourses = () => useQuery({ queryKey: keys.section("courses"), queryFn: adminService.courses });
export const useAdminCourse = (id: string) =>
  useQuery({ queryKey: keys.detail("courses", id), queryFn: () => adminService.course(id), enabled: !!id });

export const useAdminStudents = () => useQuery({ queryKey: keys.section("students"), queryFn: adminService.students });
export const useAdminStudent = (id: string) => useQuery({ queryKey: keys.detail("students", id), queryFn: () => adminService.student(id) });

export const useAdminReviews = () => useQuery({ queryKey: keys.section("reviews"), queryFn: adminService.reviews });
export const useAdminNotes = () => useQuery({ queryKey: keys.section("notes"), queryFn: adminService.notes });

export const useAdminPayments = () => useQuery({ queryKey: keys.section("payments"), queryFn: adminService.payments });
export const useAdminPayment = (id: string) => useQuery({ queryKey: keys.detail("payments", id), queryFn: () => adminService.payment(id) });

export const useAdminSubmissions = () => useQuery({ queryKey: keys.section("submissions"), queryFn: adminService.submissions });
export const useAdminSubmission = (id: string) =>
  useQuery({ queryKey: keys.detail("submissions", id), queryFn: () => adminService.submission(id) });

export const useAdminPromos = () => useQuery({ queryKey: keys.section("promos"), queryFn: adminService.promos });

export const useAdminTickets = () => useQuery({ queryKey: keys.section("tickets"), queryFn: adminService.tickets });
export const useAdminTicket = (id: string) => useQuery({ queryKey: keys.detail("tickets", id), queryFn: () => adminService.ticket(id) });

/* ---------------- mutations ---------------- */

/**
 * Every admin mutation refreshes all admin queries (lists, details, sidebar counts). Admin data is small
 * and only the queries on screen refetch, so this stays simple without going stale.
 */
const useAdminMutation = <V, R>(mutationFn: (vars: V) => Promise<R>) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      // not awaited: callers can navigate away (e.g. after a delete) without refetching the old detail first
      void qc.invalidateQueries({ queryKey: keys.all });
    },
  });
};

export const useSaveCourse = () =>
  useAdminMutation(({ course, status }: { course: CourseDraftValues; status: AdminCourseStatus }) =>
    adminService.createCourse(course, status)
  );
export const useUpdateCourse = () =>
  useAdminMutation(({ id, patch }: { id: string; patch: AdminCoursePatch }) => adminService.updateCourse(id, patch));
export const useDeleteCourse = () => useAdminMutation((id: string) => adminService.deleteCourse(id));

export const useAddStudent = () => useAdminMutation((values: AddStudentValues) => adminService.addStudent(values));
export const useSetStudentStatus = () =>
  useAdminMutation(({ id, status }: { id: string; status: AdminStudentStatus }) => adminService.setStudentStatus(id, status));
export const useGrantCourse = () =>
  useAdminMutation(({ id, courseId }: { id: string; courseId: string }) => adminService.grantCourse(id, courseId));
export const useSendPasswordReset = () => useMutation({ mutationFn: (id: string) => adminService.sendPasswordReset(id) });

export const useUpdateReview = () =>
  useAdminMutation(({ id, ...patch }: { id: string; reply?: string; hidden?: boolean }) => adminService.updateReview(id, patch));

export const useCreateNote = () => useAdminMutation((values: NoteValues) => adminService.createNote(values));
export const useUploadNoteVersion = () =>
  useAdminMutation(({ id, fileName, fileSize }: { id: string; fileName: string; fileSize: number }) =>
    adminService.uploadNoteVersion(id, { fileName, fileSize })
  );

export const useRefund = () => useAdminMutation(({ id, reason }: { id: string; reason: string }) => adminService.refund(id, reason));
export const useRejectRefund = () =>
  useAdminMutation(({ id, reason }: { id: string; reason: string }) => adminService.rejectRefund(id, reason));

export const useReviewSubmission = () =>
  useAdminMutation(({ id, decision, feedback }: { id: string; decision: SubmissionDecision; feedback: string }) =>
    adminService.reviewSubmission(id, decision, feedback)
  );

export const useCreatePromo = () => useAdminMutation((input: PromoInput) => adminService.createPromo(input));
export const useUpdatePromo = () =>
  useAdminMutation(({ code, ...patch }: { code: string } & Partial<Omit<PromoInput, "code">> & { active?: boolean }) =>
    adminService.updatePromo(code, patch)
  );
export const useDeletePromo = () => useAdminMutation((code: string) => adminService.deletePromo(code));

export const useReplyTicket = () =>
  useAdminMutation(({ id, message }: { id: string; message: string }) => adminService.replyTicket(id, message));
export const useSetTicketStatus = () =>
  useAdminMutation(({ id, status }: { id: string; status: "open" | "closed" }) => adminService.setTicketStatus(id, status));
