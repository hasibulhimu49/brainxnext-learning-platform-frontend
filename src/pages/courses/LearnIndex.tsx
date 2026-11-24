import { Navigate } from "react-router-dom";
import { LoadingState } from "@/components/common/QueryStatus";
import { useEnrollments } from "@/queries/learning";

/** /learn — resume the most recently active enrolment, or browse the catalog when there is none. */
const LearnIndex = () => {
  const enrollments = useEnrollments();
  if (enrollments.isPending) return <LoadingState className="min-h-screen bg-page" />;
  const latest = enrollments.data?.[0];
  if (!latest) return <Navigate to="/courses" replace />;
  return <Navigate to={`/learn/${latest.courseId}${latest.lastLessonId ? `/${latest.lastLessonId}` : ""}`} replace />;
};

export default LearnIndex;
