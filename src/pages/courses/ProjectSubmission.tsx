import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, Navigate, useParams } from "react-router-dom";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import { Alert, AuthCard, AuthHeader, SubmitButton, SuccessState } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import { LoadingState, QueryStatus } from "@/components/common/QueryStatus";
import UpgradeCard from "@/components/learner/UpgradeCard";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import usePageTitle from "@/hooks/usePageTitle";
import AuthLayout from "@/layouts/AuthLayout";
import { useCourseExtras } from "@/queries/account";
import { useCourse } from "@/queries/courses";
import { useIsEnrolled, useSubmitProject } from "@/queries/learning";
import { projectSubmissionSchema, type ProjectSubmissionValues } from "@/schemas/learner";
import type { CourseDetail } from "@/types/course";

const SubmissionForm = ({ course }: { course: CourseDetail }) => {
  const submit = useSubmitProject(course.id);
  const form = useForm<ProjectSubmissionValues>({
    resolver: zodResolver(projectSubmissionSchema),
    defaultValues: { title: "", repoUrl: "", notes: "" },
  });

  if (submit.isSuccess) {
    return (
      <AuthCard width={460}>
        <SuccessState
          icon="rate_review"
          title="Submitted for review"
          action={
            <Link to="/dashboard/reviews" className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
              See my reviews
            </Link>
          }
        >
          A mentor will read <span className="font-extrabold text-ink">{submit.data.title}</span> and reply with feedback within 48 hours.
          We&apos;ll notify you here when it&apos;s reviewed.
        </SuccessState>
        <Link to={`/learn/${course.id}`} className="text-center text-[13.5px] font-extrabold text-brand">
          Back to the course
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard width={520}>
      <AuthHeader icon="rate_review" title="Submit your project">
        Share the final project for <span className="font-extrabold text-ink">{course.title}</span>. A mentor reviews it line by line.
      </AuthHeader>
      <Form {...form}>
        <form className="flex flex-col gap-4.5" onSubmit={form.handleSubmit((v) => submit.mutate(v))} noValidate>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Typed cache with LRU eviction" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="repoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repository URL</FormLabel>
                <FormControl>
                  <Input type="url" inputMode="url" placeholder="https://github.com/you/project" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes for your mentor (optional)</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="What should the mentor look at? Anything you're unsure about?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {submit.isError && <Alert>{errorMessage(submit.error)}</Alert>}
          <SubmitButton pending={submit.isPending}>
            <Icon name="send" size={18} />
            Submit for review
          </SubmitButton>
        </form>
      </Form>
    </AuthCard>
  );
};

/** Decides between the form, the "enrol first" card and the upgrade card. */
const SubmissionGate = ({ course }: { course: CourseDetail }) => {
  const enrolled = useIsEnrolled(course.id);
  const extras = useCourseExtras(course.id);
  if (enrolled === undefined || extras === undefined) return <LoadingState />;
  if (!enrolled) {
    return (
      <AuthCard>
        <AuthHeader icon="school" title="Enrol first">
          Projects are reviewed for learners enrolled in <span className="font-extrabold text-ink">{course.title}</span>.
        </AuthHeader>
        <Link to={`/courses/${course.id}`} className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
          Go to the course page
        </Link>
      </AuthCard>
    );
  }
  if (!extras) {
    return (
      <UpgradeCard title="Mentor review is part of Pro" course={course}>
        Pro gets every project reviewed by a working practitioner within 48 hours. Buying a course includes reviews for that course.
      </UpgradeCard>
    );
  }
  return <SubmissionForm course={course} />;
};

/** /learn/:courseId/project — submit the course project for mentor review. */
const ProjectSubmission = () => {
  const { courseId = "" } = useParams();
  usePageTitle("Submit project");
  const course = useCourse(courseId);
  if (isApiError(course.error) && course.error.code === API_ERROR_CODES.notFound) return <Navigate to="/404" replace />;
  return (
    <AuthLayout closeTo={`/learn/${courseId}`} mainClassName="items-start pt-6 pb-16">
      <QueryStatus query={course}>{(c) => <SubmissionGate course={c} />}</QueryStatus>
    </AuthLayout>
  );
};

export default ProjectSubmission;
