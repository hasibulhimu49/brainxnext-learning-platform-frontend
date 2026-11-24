import { api } from "@/api/client";
import type { AddStudentValues, NoteValues, PromoInput } from "@/schemas/admin";
import type { CourseDraftValues } from "@/schemas/course";
import type {
  AdminCounts,
  AdminCourseDetail,
  AdminCoursePatch,
  AdminCourseRow,
  AdminCourseStatus,
  AdminList,
  AdminNote,
  AdminNoteList,
  AdminOverview,
  AdminPaymentDetail,
  AdminPromo,
  AdminReview,
  AdminReviewList,
  AdminStudentDetail,
  AdminStudentRow,
  AdminStudentStatus,
  SubmissionDecision,
} from "@/types/admin";
import type { OrderRecord, Submission, Ticket } from "@/types/commerce";

/** Admin endpoints (provisional — see docs/project/api-guidelines.md, "Admin (Phase 3)"). */
export const adminService = {
  overview: () => api.get<AdminOverview>("/admin/overview"),
  counts: () => api.get<AdminCounts>("/admin/counts"),

  courses: () => api.get<AdminList<AdminCourseRow>>("/admin/courses"),
  course: (id: string) => api.get<AdminCourseDetail>(`/admin/courses/${encodeURIComponent(id)}`),
  createCourse: (course: CourseDraftValues, status: AdminCourseStatus) =>
    api.post<{ id: string; status: AdminCourseStatus }>("/admin/courses", { course, status }),
  updateCourse: (id: string, patch: AdminCoursePatch) => api.patch<AdminCourseDetail>(`/admin/courses/${encodeURIComponent(id)}`, patch),
  deleteCourse: (id: string) => api.delete<{ id: string; deleted: true }>(`/admin/courses/${encodeURIComponent(id)}`),

  students: () => api.get<AdminList<AdminStudentRow>>("/admin/students"),
  student: (id: string) => api.get<AdminStudentDetail>(`/admin/students/${encodeURIComponent(id)}`),
  addStudent: (values: AddStudentValues) => api.post<AdminStudentRow>("/admin/students", values),
  setStudentStatus: (id: string, status: AdminStudentStatus) =>
    api.patch<AdminStudentDetail>(`/admin/students/${encodeURIComponent(id)}`, { status }),
  grantCourse: (id: string, courseId: string) =>
    api.post<AdminStudentDetail>(`/admin/students/${encodeURIComponent(id)}/grants`, { courseId }),
  sendPasswordReset: (id: string) => api.post<{ sentTo: string }>(`/admin/students/${encodeURIComponent(id)}/password-reset`),

  reviews: () => api.get<AdminReviewList>("/admin/reviews"),
  updateReview: (id: string, patch: { reply?: string; hidden?: boolean }) =>
    api.patch<AdminReview>(`/admin/reviews/${encodeURIComponent(id)}`, patch),

  notes: () => api.get<AdminNoteList>("/admin/notes"),
  createNote: (values: NoteValues) => api.post<AdminNote>("/admin/notes", values),
  uploadNoteVersion: (id: string, file: { fileName: string; fileSize: number }) =>
    api.post<AdminNote>(`/admin/notes/${encodeURIComponent(id)}/versions`, file),

  payments: () => api.get<AdminList<OrderRecord>>("/admin/payments"),
  payment: (id: string) => api.get<AdminPaymentDetail>(`/admin/payments/${encodeURIComponent(id)}`),
  refund: (id: string, reason: string) => api.post<AdminPaymentDetail>(`/admin/payments/${encodeURIComponent(id)}/refund`, { reason }),
  rejectRefund: (id: string, reason: string) =>
    api.post<AdminPaymentDetail>(`/admin/payments/${encodeURIComponent(id)}/refund/reject`, { reason }),

  submissions: () => api.get<Submission[]>("/admin/submissions"),
  submission: (id: string) => api.get<Submission>(`/admin/submissions/${encodeURIComponent(id)}`),
  reviewSubmission: (id: string, decision: SubmissionDecision, feedback: string) =>
    api.post<Submission>(`/admin/submissions/${encodeURIComponent(id)}/review`, { decision, feedback }),

  promos: () => api.get<AdminPromo[]>("/admin/promos"),
  createPromo: (input: PromoInput) => api.post<AdminPromo>("/admin/promos", input),
  updatePromo: (code: string, patch: Partial<Omit<PromoInput, "code">> & { active?: boolean }) =>
    api.patch<AdminPromo>(`/admin/promos/${encodeURIComponent(code)}`, patch),
  deletePromo: (code: string) => api.delete<{ code: string; deleted: true }>(`/admin/promos/${encodeURIComponent(code)}`),

  tickets: () => api.get<Ticket[]>("/admin/tickets"),
  ticket: (id: string) => api.get<Ticket>(`/admin/tickets/${encodeURIComponent(id)}`),
  replyTicket: (id: string, message: string) => api.post<Ticket>(`/admin/tickets/${encodeURIComponent(id)}/replies`, { message }),
  setTicketStatus: (id: string, status: "open" | "closed") => api.patch<Ticket>(`/admin/tickets/${encodeURIComponent(id)}`, { status }),
};
