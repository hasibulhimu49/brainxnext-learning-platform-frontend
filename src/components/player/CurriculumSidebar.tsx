import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import type { FlatLesson } from "@/lib/lessons";
import type { CourseModule } from "@/types/course";
import type { QuizScore } from "@/types/quiz";

interface CurriculumSidebarProps {
  curriculum: CourseModule[];
  lessons: FlatLesson[];
  currentId: string;
  done: ReadonlySet<string>;
  isLocked: (lesson: FlatLesson) => boolean;
  onSelect: (id: string) => void;
  /** tag free preview lessons (when the course is not owned) */
  showPreview: boolean;
  /** F-007: link each module's quiz (enrolled learners only) with the best score */
  quizzes?: { courseId: string; scores: QuizScore[] };
}

/** The module quiz row at the end of a module (F-007). */
const QuizLink = ({ courseId, module, score }: { courseId: string; module: number; score?: QuizScore }) => (
  <Link
    to={`/learn/${courseId}/quiz/${module + 1}`}
    className="mx-2.5 flex items-center gap-2.75 rounded-xl px-3 py-2.5 text-ink transition-colors hover:bg-surface2 hover:text-ink"
  >
    <Icon name="quiz" size={18} className={score?.passed ? "text-success" : "text-brand"} />
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[12.5px] leading-[1.35] font-extrabold">Module quiz</span>
      <span className="text-[11px] font-bold text-soft">
        {score ? `Best ${score.best}/${score.total}${score.passed ? " · Passed" : ""}` : "Practice · 4 questions"}
      </span>
    </span>
    {score?.passed && <Icon name="check_circle" size={17} className="text-success" />}
  </Link>
);

/** "Course content" accordion: one module open at a time, lessons with done / current / locked state. */
const CurriculumSidebar = ({ curriculum, lessons, currentId, done, isLocked, onSelect, showPreview, quizzes }: CurriculumSidebarProps) => {
  const currentModule = lessons.find((l) => l.id === currentId)?.moduleIndex ?? 0;
  const [openModule, setOpenModule] = useState(currentModule);

  return (
    <aside className="card flex flex-col rounded-[20px]! min-[1081px]:sticky min-[1081px]:top-19 min-[1081px]:max-h-[calc(100vh-96px)] min-[1081px]:overflow-y-auto">
      <div className="sticky top-0 z-2 flex items-center justify-between rounded-t-[20px] border-b border-line bg-surface px-5 py-4.5">
        <span className="font-display text-[15px] font-extrabold text-ink">Course content</span>
        <span className="text-xs font-bold text-soft">{lessons.length} classes · 6h</span>
      </div>
      {curriculum.map((m, mi) => {
        const open = openModule === mi;
        const moduleLessons = lessons.filter((l) => l.moduleIndex === mi);
        const dcount = moduleLessons.filter((l) => done.has(l.id)).length;
        return (
          <div key={m.title} className="border-b border-line last:border-b-0">
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenModule(open ? -1 : mi)}
              className="flex w-full items-center justify-between gap-2.5 border-0 bg-transparent px-5 py-3.5 text-left text-ink"
            >
              <span className="flex min-w-0 flex-col gap-0.75">
                <span className="text-[13.5px] font-extrabold">
                  0{mi + 1} · {m.title}
                </span>
                <span className="text-[11.5px] font-bold text-soft">
                  {dcount}/{m.lessons.length} done
                </span>
              </span>
              <Icon name={open ? "expand_less" : "expand_more"} size={19} className="text-soft" />
            </button>
            {open && (
              <div className="flex flex-col pb-2">
                {moduleLessons.map((l) => {
                  const isCurrent = l.id === currentId;
                  const isDone = done.has(l.id);
                  const locked = isLocked(l);
                  const icon = isCurrent ? "play_circle" : locked ? "lock" : isDone ? "check_circle" : "radio_button_unchecked";
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onSelect(l.id)}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`mx-2.5 flex items-center gap-2.75 rounded-xl border-0 px-3 py-2.5 text-left text-ink transition-colors hover:bg-surface2 ${isCurrent ? "bg-chip" : "bg-transparent"}`}
                    >
                      <Icon name={icon} size={18} className={isCurrent ? "text-brand" : isDone && !locked ? "text-success" : "text-soft"} />
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className={`text-[12.5px] leading-[1.35] ${isCurrent ? "font-extrabold" : "font-semibold"}`}>
                          {l.lesson.title}
                        </span>
                        <span className="text-[11px] font-bold text-soft">
                          {l.lesson.dur}
                          {l.lesson.preview && showPreview ? " · Preview" : ""}
                        </span>
                      </span>
                      {isCurrent && (
                        <span className="bg-grad-gold flex-none rounded-full px-2 py-0.75 text-[9.5px] font-extrabold tracking-[0.08em] text-cocoa">
                          NOW
                        </span>
                      )}
                    </button>
                  );
                })}
                {quizzes && <QuizLink courseId={quizzes.courseId} module={mi} score={quizzes.scores.find((s) => s.module === mi)} />}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
};

export default CurriculumSidebar;
