import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { errorMessage } from "@/api/envelope";
import Icon from "@/components/common/Icon";
import LogoMark from "@/components/common/LogoMark";
import { ASSISTANT_GREETING, ASSISTANT_LESSON_STARTER, ASSISTANT_NAME, ASSISTANT_STARTERS } from "@/constants/assistant";
import { formatTaka } from "@/lib/utils";
import { useAskAssistant } from "@/queries/assistant";
import type { AssistantContext, AssistantReply } from "@/types/assistant";

type ChatEntry = { role: "user"; text: string } | { role: "assistant"; reply: AssistantReply };

/** /learn/:courseId/:lessonId → lesson context for the answer */
const contextFor = (path: string): AssistantContext => {
  const m = path.match(/^\/learn\/([^/]+)\/([^/]+)$/);
  return m && m[2] !== "project" ? { path, courseId: m[1], lessonId: m[2] } : { path };
};

const Bubble = ({ entry }: { entry: ChatEntry }) => {
  if (entry.role === "user") {
    return (
      <div className="ml-auto max-w-[85%] rounded-[16px] rounded-br-[5px] bg-[linear-gradient(135deg,#1B6FD0,#0E97B0)] px-3.5 py-2.5 text-[13.5px] leading-relaxed font-semibold text-white">
        {entry.text}
      </div>
    );
  }
  const { text, courses, links } = entry.reply;
  return (
    <div className="flex max-w-[92%] flex-col gap-2">
      <div className="rounded-[16px] rounded-bl-[5px] border border-line bg-surface2 px-3.5 py-2.5 text-[13.5px] leading-relaxed font-medium text-ink">
        {text}
      </div>
      {courses?.map((c) => (
        <Link
          key={c.id}
          to={`/courses/${c.id}`}
          className="flex items-center justify-between gap-3 rounded-[13px] border border-line bg-surface px-3.5 py-2.5 text-ink transition-colors hover:border-brand hover:text-ink"
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-extrabold">{c.title}</span>
            <span className="text-[11.5px] font-semibold text-soft">{c.level}</span>
          </span>
          <span className={`flex-none text-[13px] font-extrabold ${c.free ? "text-success" : "text-ink"}`}>
            {c.free ? "Free" : formatTaka(c.price)}
          </span>
        </Link>
      ))}
      {links && links.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {links.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              className="rounded-full border border-brand/30 bg-chip px-3 py-1.5 text-[12px] font-extrabold text-brand hover:border-brand"
            >
              {l.label} →
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Floating "Next AI" circle (F-005) on every page except /admin. Opens a chat panel; answers come
 * from POST /assistant/chat — demo answers from the mock until the backend connects a real AI model.
 * The conversation is UI state that lives while the app is open (it survives page changes).
 */
const AssistantWidget = () => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [draft, setDraft] = useState("");
  const ask = useAskAssistant();
  const panelId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const context = contextFor(pathname);

  // newest message in view; focus the input when the panel opens
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [entries, ask.isPending]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  // Escape closes and returns focus to the circle
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname.startsWith("/admin")) return null;

  const send = (text: string) => {
    const message = text.trim();
    if (!message || ask.isPending) return;
    setEntries((e) => [...e, { role: "user", text: message }]);
    setDraft("");
    ask.mutate(
      { message, context },
      {
        onSuccess: (reply) => setEntries((e) => [...e, { role: "assistant", reply }]),
        onError: (err) =>
          setEntries((e) => [...e, { role: "assistant", reply: { text: errorMessage(err, "Something went wrong — try again.") } }]),
      }
    );
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };
  const starters = context.lessonId ? [ASSISTANT_LESSON_STARTER, ...ASSISTANT_STARTERS.slice(0, 3)] : ASSISTANT_STARTERS;

  return (
    <>
      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-label={`${ASSISTANT_NAME} chat`}
          className="fixed inset-x-3 bottom-[calc(84px+var(--bx-bottom-bar,0px))] z-[75] flex h-[min(560px,calc(100dvh-110px-var(--bx-bottom-bar,0px)))] flex-col overflow-hidden rounded-[22px] border border-line bg-surface shadow-pop sm:inset-x-auto sm:right-5 sm:w-[380px]"
        >
          <header className="flex items-center gap-3 bg-[linear-gradient(135deg,#0A1B33,#123B6B)] px-4 py-3.5 text-white">
            <LogoMark size={36} className="shadow-none!" />
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="font-display text-[15px] font-extrabold">{ASSISTANT_NAME}</span>
              <span className="text-[11.5px] font-semibold text-[#A9BFD8]">Demo answers · real AI coming soon</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-white/10 text-white hover:bg-white/20"
            >
              <Icon name="close" size={19} />
            </button>
          </header>

          <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
            <Bubble entry={{ role: "assistant", reply: { text: ASSISTANT_GREETING } }} />
            {entries.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12.5px] font-bold text-ink hover:border-brand hover:text-brand"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {entries.map((entry, i) => (
              <Bubble key={i} entry={entry} />
            ))}
            {ask.isPending && (
              <div role="status" className="flex w-max items-center gap-1 rounded-[16px] border border-line bg-surface2 px-4 py-3">
                <span className="sr-only">{ASSISTANT_NAME} is typing</span>
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-soft"
                    style={{ animationDelay: `${d * 150}ms` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-line px-3 py-3">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={1000}
              placeholder="Ask Next AI…"
              aria-label={`Message ${ASSISTANT_NAME}`}
              className="field min-w-0 flex-1 rounded-full! py-2.5!"
            />
            <button
              type="submit"
              disabled={!draft.trim() || ask.isPending}
              aria-label="Send"
              className="flex h-10.5 w-10.5 flex-none items-center justify-center rounded-full border-0 bg-[linear-gradient(135deg,#1B6FD0,#0E97B0)] text-white disabled:opacity-45"
            >
              <Icon name="send" size={19} />
            </button>
          </form>
        </section>
      )}

      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? `Close ${ASSISTANT_NAME}` : `Ask ${ASSISTANT_NAME}`}
        title={`Ask ${ASSISTANT_NAME}`}
        className="group fixed right-4 bottom-[calc(16px+var(--bx-bottom-bar,0px))] z-[75] flex h-15 w-15 items-center justify-center rounded-full border-0 bg-[#050b1a] p-0 shadow-[0_10px_30px_rgba(27,111,208,.45)] ring-2 ring-[#6FB7FF]/60 transition-transform hover:scale-105 sm:right-5 sm:bottom-[calc(20px+var(--bx-bottom-bar,0px))]"
      >
        {!open && <span className="absolute inset-0 animate-ping rounded-full bg-[#1B6FD0]/25" aria-hidden="true" />}
        {open ? <Icon name="close" size={26} className="relative text-white" /> : <LogoMark size={54} className="relative shadow-none!" />}
        {!open && (
          <span className="absolute -top-1 -left-1 rounded-full bg-[linear-gradient(135deg,#F7C948,#E9A21B)] px-1.5 py-0.5 text-[9.5px] font-extrabold text-cocoa shadow">
            AI
          </span>
        )}
      </button>
    </>
  );
};

export default AssistantWidget;
