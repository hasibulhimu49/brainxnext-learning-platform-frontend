import { SUBMISSION_SLA_HOURS } from "@/constants/admin";
import type { Submission } from "@/types/commerce";
import { slaHoursLeft } from "./format";
import Pill from "./Pill";

/** "Due in 12 h" / "Overdue by 3 h" for pending work (submittedAt + 48 h); a dash once reviewed. */
const SlaPill = ({ submission }: { submission: Submission }) => {
  if (submission.status !== "pending") return <span className="text-soft">—</span>;
  const left = slaHoursLeft(submission.submittedAt, SUBMISSION_SLA_HOURS);
  if (left < 0) return <Pill label={`Overdue by ${-left} h`} tone="danger" />;
  return <Pill label={`Due in ${left} h`} tone={left <= 12 ? "warn" : "info"} />;
};

export default SlaPill;
