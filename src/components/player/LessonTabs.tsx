import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import Icon from "@/components/common/Icon";
import { PLACEHOLDER_PDF } from "@/constants/downloads";

/* Placeholder lesson content from the designs (the Class 11 overview, resources and discussion). */
const TABS = ["Overview", "Resources", "Discussion"] as const;
type Tab = (typeof TABS)[number];

/** Placeholder files: every resource downloads the sample PDF under its own name (see src/constants/downloads.ts). */
const RESOURCES = [
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

const COMMENTS: Comment[] = [
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

/**
 * Overview / Resources / Discussion tabs under the video. Questions you post are kept in this
 * component only (there is no discussion endpoint yet) — they show at once and disappear on reload.
 */
const LessonTabs = ({ author }: { author: string }) => {
  const [tab, setTab] = useState<Tab>("Overview");
  const [comments, setComments] = useState(COMMENTS);
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
    toast("Question posted");
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
          {tab === "Overview" && (
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
              {RESOURCES.map((r) => (
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
