import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Icon from "@/components/common/Icon";
import { PLACEHOLDER_PDF } from "@/constants/downloads";
import type { FlatLesson } from "@/lib/lessons";

/*
 * Placeholder lesson content. The designs show Class 11 of Generics in Java ("? super"), which is
 * kept as is; every other class gets a short overview and resources built from its own title.
 */
const TABS = ["Overview", "Resources", "Discussion"] as const;
type Tab = (typeof TABS)[number];

/** The class from the designs */
const isDesignLesson = (courseId: string, lesson: FlatLesson) => courseId === "java-generics" && lesson.id === "3-3";

/** Placeholder files: every resource downloads the sample PDF under its own name (see src/constants/downloads.ts). */
const DESIGN_RESOURCES = [
  { icon: "folder_zip", color: "#1B6FD0", title: "Class 11 source code", meta: "4 KB", file: "class-11-source-code.pdf" },
  { icon: "picture_as_pdf", color: "#D0491B", title: "PECS cheat sheet", meta: "2 pages", file: "pecs-cheat-sheet.pdf" },
  { icon: "quiz", color: "#3FA457", title: "Practice problems — module 3", meta: "6 problems", file: "practice-problems-module-3.pdf" },
];

interface Comment {
  id: string;
  initial: string;
  grad: string;
  name: string;
  when: string;
  text: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const topicOf = (lesson: FlatLesson) => lesson.lesson.title.replace(/^Class \d+ — /, "");

const resourcesFor = (courseId: string, lesson: FlatLesson) =>
  isDesignLesson(courseId, lesson)
    ? DESIGN_RESOURCES
    : [
        {
          icon: "folder_zip",
          color: "#1B6FD0",
          title: `Class ${lesson.number} source & files`,
          meta: "4 KB",
          file: `class-${lesson.number}-files.pdf`,
        },
        {
          icon: "picture_as_pdf",
          color: "#D0491B",
          title: `${lesson.module.title} notes`,
          meta: "2 pages",
          file: `${slug(lesson.module.title)}-notes.pdf`,
        },
        {
          icon: "quiz",
          color: "#3FA457",
          title: `Practice problems — module ${lesson.moduleIndex + 1}`,
          meta: "6 problems",
          file: `practice-problems-module-${lesson.moduleIndex + 1}.pdf`,
        },
      ];

const DESIGN_COMMENTS: Comment[] = [
  {
    id: "c1",
    initial: "R",
    grad: "linear-gradient(135deg,#1B6FD0,#3E92E8)",
    name: "Rifat H.",
    when: "2 days ago",
    text: "The Collections.copy example at 14:20 finally made super click for me. Watch that part twice.",
  },
  {
    id: "c2",
    initial: "S",
    grad: "linear-gradient(135deg,#0E97B0,#2FB8CF)",
    name: "Sumaiya A.",
    when: "5 days ago",
    text: "Question: why can't I read a T out of List<? super T>? Answered in the last 3 minutes — great class.",
  },
];

interface LessonTabsProps {
  courseId: string;
  lesson: FlatLesson;
  /** signed-in name, "" for guests */
  author: string;
}

/**
 * Overview / Resources / Discussion tabs under the video. There is no discussion endpoint yet, so
 * questions you post stay in this component for the current class only (the player keys it by
 * lesson) — the tab says so, and they are gone after a reload.
 */
const LessonTabs = ({ courseId, lesson, author }: LessonTabsProps) => {
  const design = isDesignLesson(courseId, lesson);
  const [tab, setTab] = useState<Tab>("Overview");
  const [comments, setComments] = useState(design ? DESIGN_COMMENTS : []);
  const [draft, setDraft] = useState("");

  const post = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((list) => [
      ...list,
      {
        id: `local-${list.length}`,
        initial: author[0]?.toUpperCase() ?? "?",
        grad: "linear-gradient(135deg,#E9A21B,#F2BC4B)",
        name: author || "You",
        when: "just now",
        text,
      },
    ]);
    setDraft("");
    toast("Question added", { description: "It's only shown on this page for now — it isn't saved yet." });
  };
  return (
    <>
      {/* Tabs */}
      <div className="card overflow-hidden rounded-[20px]!">
        <div className="flex border-b border-line" role="tablist">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`-mb-px border-0 border-b-[2.5px] bg-transparent px-5.5 py-3.75 text-[13.5px] font-extrabold transition-all ${
                tab === t ? "border-brand text-brand" : "border-transparent text-soft hover:text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === "Overview" && !design && (
            <div className="flex flex-col gap-3.5 text-[14.5px] leading-[1.7] font-medium text-muted">
              <p className="m-0">
                Class {lesson.number} of the <span className="font-extrabold text-ink">{lesson.module.title}</span> module:{" "}
                {topicOf(lesson)}. Follow along with the video, then try the practice problems in Resources before moving on.
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {[lesson.module.title, `Module ${lesson.moduleIndex + 1}`].map((t) => (
                  <span key={t} className="pill bg-chip px-3.25 py-1.5 text-[11.5px] tracking-normal text-brand">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {tab === "Overview" && design && (
            <div className="flex flex-col gap-3.5 text-[14.5px] leading-[1.7] font-medium text-muted">
              <p className="m-0">
                The consumer side of PECS. Where <code className="inline-code">? extends</code> lets a structure produce values safely,{" "}
                <code className="inline-code">? super</code> lets it consume them. This class builds the intuition with a Collections.copy
                walkthrough.
              </p>
              <p className="m-0">
                You&apos;ll write a flexible <code className="inline-code">{"addNumbers(List<? super Integer>)"}</code> and see exactly
                which calls compile, which don&apos;t, and why the compiler is right every time.
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {["lower bounds", "PECS", "Collections.copy"].map((t) => (
                  <span key={t} className="pill bg-chip px-3.25 py-1.5 text-[11.5px] tracking-normal text-brand">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {tab === "Resources" && (
            <div className="flex flex-col gap-2.5">
              {resourcesFor(courseId, lesson).map((r) => (
                <a
                  key={r.title}
                  href={PLACEHOLDER_PDF}
                  download={r.file}
                  className="flex items-center gap-3 rounded-[13px] border border-line bg-surface2 px-3.75 py-3.25 text-ink transition-colors hover:border-brand"
                >
                  <Icon name={r.icon} style={{ color: r.color }} />
                  <span className="flex-1 text-[13.5px] font-extrabold">{r.title}</span>
                  <span className="text-[11.5px] font-bold text-soft">{r.meta}</span>
                </a>
              ))}
            </div>
          )}
          {tab === "Discussion" && (
            <div className="flex flex-col gap-4">
              <p className="m-0 flex items-start gap-2 rounded-[13px] border border-line bg-surface2 px-3.75 py-3 text-[12.5px] leading-normal font-semibold text-muted">
                <Icon name="info" size={17} className="mt-px text-brand" />
                The discussion board isn&apos;t connected yet: questions you post here are only visible to you, on this page, until you
                reload.
              </p>
              {comments.length === 0 && <p className="m-0 text-[13.5px] font-medium text-soft">No questions about this class yet.</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <span
                    className="flex h-9.5 w-9.5 flex-none items-center justify-center rounded-full font-display text-[13px] font-extrabold text-white"
                    style={{ background: c.grad }}
                  >
                    {c.initial}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1.25">
                    <span className="text-[13px] font-extrabold text-ink">
                      {c.name} <span className="text-xs font-semibold text-soft">· {c.when}</span>
                    </span>
                    <span className="text-[13.5px] leading-relaxed font-medium text-muted">{c.text}</span>
                  </div>
                </div>
              ))}
              <form className="mt-0.5 flex gap-2.5" onSubmit={post}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  aria-label="Ask a question"
                  placeholder="Ask a question about this class…"
                  className="field min-w-0 flex-1 text-[13.5px]!"
                />
                <button type="submit" className="btn btn-primary rounded-[13px] px-5 shadow-none!">
                  Post
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LessonTabs;
