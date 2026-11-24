import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import LearnerPage, { EmptyCard } from "@/components/learner/LearnerPage";
import SubmissionCard from "@/components/learner/SubmissionCard";
import usePageTitle from "@/hooks/usePageTitle";
import { useSubmissions } from "@/queries/learning";
import type { Submission } from "@/types/commerce";

const ReviewsView = ({ submissions }: { submissions: Submission[] }) =>
  submissions.length === 0 ? (
    <EmptyCard
      icon="rate_review"
      title="No project reviews yet"
      action={
        <Link to="/dashboard/courses" className="btn btn-primary px-6.5 py-3.5 text-[14.5px]">
          <Icon name="play_arrow" size={18} />
          Go to my courses
        </Link>
      }
    >
      Submit your project from the course player (&ldquo;Submit project&rdquo;) and a mentor will review your code with line-level feedback.
    </EmptyCard>
  ) : (
    <div className="flex flex-col gap-3.5">
      {submissions.map((s) => (
        <SubmissionCard key={s.id} submission={s} />
      ))}
    </div>
  );

/** /dashboard/reviews — my project submissions and the mentors' feedback. */
const MyReviews = () => {
  usePageTitle("My reviews");
  const submissions = useSubmissions();
  return (
    <LearnerPage title="My reviews" subtitle="Projects you submitted for mentor review">
      <QueryStatus query={submissions}>{(list) => <ReviewsView submissions={list} />}</QueryStatus>
    </LearnerPage>
  );
};

export default MyReviews;
