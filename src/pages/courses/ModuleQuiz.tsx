import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import { Alert } from "@/components/common/FormFeedback";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";
import AuthLayout from "@/layouts/AuthLayout";
import { useQuiz, useSubmitQuiz } from "@/queries/quizzes";
import type { Quiz, QuizResult } from "@/types/quiz";
import { plural } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D", "E"];

const optionClass = (state: "idle" | "chosen" | "correct" | "wrong") =>
  ({
    idle: "border-line bg-surface hover:border-brand",
    chosen: "border-brand bg-chip",
    correct: "border-success bg-success/10",
    wrong: "border-danger bg-danger/10",
  })[state];

/** One question: radio options while answering, colored with the explanation once graded. */
const QuestionCard = ({
  index,
  q,
  chosen,
  onChoose,
  graded,
}: {
  index: number;
  q: Quiz["questions"][number];
  chosen: number | undefined;
  onChoose: (i: number) => void;
  graded?: QuizResult["results"][number];
}) => (
  <fieldset className="m-0 flex flex-col gap-2.5 rounded-2xl border border-line p-4.5">
    <legend className="px-1 text-[14.5px] leading-snug font-extrabold text-ink">
      {index + 1}. {q.prompt}
    </legend>
    {q.code && (
      <code className="block overflow-x-auto rounded-xl bg-[#0A1B33] px-3.5 py-2.5 font-mono text-[12.5px] text-[#CFE0F2]">{q.code}</code>
    )}
    <div role="radiogroup" aria-label={`Question ${index + 1}`} className="flex flex-col gap-2">
      {q.options.map((opt, i) => {
        const state = graded
          ? i === graded.correctIndex
            ? "correct"
            : i === graded.chosen
              ? "wrong"
              : "idle"
          : chosen === i
            ? "chosen"
            : "idle";
        return (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={chosen === i}
            disabled={!!graded}
            onClick={() => onChoose(i)}
            className={`flex items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-2.75 text-left text-[13.5px] font-semibold text-ink transition-colors disabled:cursor-default ${optionClass(state)}`}
          >
            <span className="flex h-6.5 w-6.5 flex-none items-center justify-center rounded-full bg-surface2 text-[12px] font-extrabold text-muted">
              {state === "correct" ? (
                <Icon name="check" size={16} className="text-success" />
              ) : state === "wrong" ? (
                <Icon name="close" size={16} className="text-danger" />
              ) : (
                LETTERS[i]
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
    {graded && (
      <p
        className={`m-0 rounded-xl px-3.5 py-2.5 text-[12.5px] leading-relaxed font-semibold ${graded.correct ? "bg-success/10 text-success" : "bg-surface2 text-muted"}`}
      >
        <span className="font-extrabold">{graded.correct ? "Correct. " : "Not quite. "}</span>
        {graded.explanation}
      </p>
    )}
  </fieldset>
);

const QuizView = ({ quiz, courseId }: { quiz: Quiz; courseId: string }) => {
  const submit = useSubmitQuiz(courseId, quiz.module);
  const [answers, setAnswers] = useState<(number | undefined)[]>(() => quiz.questions.map(() => undefined));
  const result = submit.data;
  const answered = answers.filter((a) => a !== undefined).length;
  const nextModule = quiz.module + 2; // 1-based number of the next module
  const hasNext = nextModule <= quiz.moduleCount;
  const retry = () => {
    submit.reset();
    setAnswers(quiz.questions.map(() => undefined));
    window.scrollTo({ top: 0 });
  };

  return (
    <AuthCard width={640}>
      <AuthHeader icon="quiz" title={`Module ${quiz.module + 1} quiz`}>
        <span className="font-extrabold text-ink">{quiz.moduleTitle}</span> · {plural(quiz.questions.length, "question")} · {quiz.passPct}%
        to pass. Practice only — it doesn&apos;t affect your certificate.
      </AuthHeader>

      {result && (
        <div
          role="status"
          className={`flex items-center gap-3.5 rounded-2xl border px-4.5 py-4 ${result.passed ? "border-success/40 bg-success/10" : "border-amber/40 bg-amber/10"}`}
        >
          <Icon name={result.passed ? "emoji_events" : "replay"} size={30} className={result.passed ? "text-success" : "text-amber"} />
          <span className="flex flex-col">
            <span className="font-display text-[18px] font-extrabold text-ink">
              {result.score}/{result.total} — {result.passed ? "Passed!" : "Not passed yet"}
            </span>
            <span className="text-[12.5px] font-semibold text-muted">
              {result.passed
                ? "Nice work. Review the explanations below, then keep going."
                : `You need ${quiz.passPct}% to pass — read the explanations and try again.`}
              {result.best > result.score && ` Your best is ${result.best}/${result.total}.`}
            </span>
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3.5">
        {quiz.questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            index={i}
            q={q}
            chosen={answers[i]}
            graded={result?.results[i]}
            onChoose={(choice) => setAnswers((a) => a.map((v, j) => (j === i ? choice : v)))}
          />
        ))}
      </div>

      {submit.isError && <Alert>{errorMessage(submit.error)}</Alert>}

      {result ? (
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button type="button" variant="outline" size="none" onClick={retry} className="flex-1 px-5 py-3.5 text-[14px]">
            <Icon name="replay" size={18} />
            Try again
          </Button>
          <Link
            to={hasNext ? `/learn/${courseId}/${nextModule}-1` : `/learn/${courseId}`}
            className="btn btn-primary flex-1 rounded-[13px] px-5 py-3.5 text-[14px]"
          >
            {hasNext ? `Start module ${nextModule}` : "Back to the course"}
            <Icon name="arrow_forward" size={18} />
          </Link>
        </div>
      ) : (
        <Button
          type="button"
          variant="primary"
          size="none"
          disabled={submit.isPending}
          aria-disabled={answered < quiz.questions.length || undefined}
          onClick={() => {
            if (answered === quiz.questions.length) submit.mutate(answers as number[], { onSuccess: () => window.scrollTo({ top: 0 }) });
          }}
          className={`px-5 py-3.75 text-[15px] ${answered < quiz.questions.length ? "opacity-55" : ""}`}
        >
          {answered < quiz.questions.length ? `Answer all questions (${answered}/${quiz.questions.length})` : "Submit answers"}
        </Button>
      )}
      <Link to={`/learn/${courseId}`} className="text-center text-[13.5px] font-extrabold text-brand">
        Back to the course
      </Link>
    </AuthCard>
  );
};

const NotEnrolled = ({ courseId }: { courseId: string }) => (
  <AuthCard>
    <AuthHeader icon="lock" title="Enrol to take this quiz">
      Module quizzes are for learners enrolled in the course.
    </AuthHeader>
    <Link to={`/courses/${courseId}`} className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
      View the course
    </Link>
  </AuthCard>
);

/** /learn/:courseId/quiz/:module — module quiz (F-007); `module` is 1-based in the URL. */
const ModuleQuiz = () => {
  const { courseId = "", module = "" } = useParams();
  const index = Number(module) - 1;
  const valid = /^\d+$/.test(module) && index >= 0;
  usePageTitle(`Module ${module} quiz`);
  const quiz = useQuiz(courseId, index, valid);
  if (!valid) return <Navigate to={`/learn/${courseId}`} replace />;
  if (isApiError(quiz.error) && quiz.error.code === API_ERROR_CODES.notFound) return <Navigate to="/404" replace />;
  const notEnrolled = isApiError(quiz.error) && quiz.error.code === API_ERROR_CODES.notEnrolled;
  return (
    <AuthLayout closeTo={`/learn/${courseId}`} mainClassName="items-start pt-6 pb-16">
      {notEnrolled ? (
        <NotEnrolled courseId={courseId} />
      ) : (
        <QueryStatus query={quiz}>{(q) => <QuizView key={q.module} quiz={q} courseId={courseId} />}</QueryStatus>
      )}
    </AuthLayout>
  );
};

export default ModuleQuiz;
