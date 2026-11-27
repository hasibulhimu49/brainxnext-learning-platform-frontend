import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { timeAgo } from "@/lib/dates";
import { useMarkNotificationsRead, useNotifications } from "@/queries/notifications";
import type { NotificationItem, NotificationKind } from "@/types/account";

const KIND: Record<NotificationKind, { icon: string; cls: string }> = {
  submission: { icon: "rate_review", cls: "bg-chip text-brand" },
  certificate: { icon: "workspace_premium", cls: "bg-amber/16 text-amber" },
  order: { icon: "receipt_long", cls: "bg-success/14 text-success" },
};

const Item = ({ n, onOpen }: { n: NotificationItem; onOpen: () => void }) => (
  <li>
    <Link
      to={n.to}
      onClick={onOpen}
      className="flex items-start gap-3 rounded-[14px] px-3 py-2.5 text-ink transition-colors hover:bg-surface2 hover:text-ink"
    >
      <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-[11px] ${KIND[n.kind].cls}`}>
        <Icon name={KIND[n.kind].icon} size={18} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={`text-[13px] ${n.read ? "font-bold" : "font-extrabold"}`}>{n.title}</span>
        <span className="truncate text-[12.5px] font-semibold text-muted">{n.body}</span>
        <span className="text-[11.5px] font-semibold text-soft">{timeAgo(n.at)}</span>
      </span>
      {!n.read && (
        <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-brand">
          {/* a bare span's aria-label is not announced, so the dot carries real (visually hidden) text */}
          <span className="sr-only">Unread</span>
        </span>
      )}
    </Link>
  </li>
);

/** Navbar / player bell: unread dot + dropdown of derived notifications, with "Mark all read". */
const NotificationsMenu = ({ className = "" }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const { data: items = [] } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openItem = (n: NotificationItem) => {
    if (!n.read) markRead.mutate([n.id]);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        title="Notifications"
        aria-label={unread ? `Notifications (${unread} unread)` : "Notifications"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={`icon-btn relative ${className}`}
      >
        <Icon name="notifications" size={20} />
        {unread > 0 && <span className="absolute top-2.25 right-2.5 h-1.75 w-1.75 rounded-full bg-[#EC3013]" />}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute top-[calc(100%+10px)] right-0 z-70 flex w-85 max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[20px] border border-line bg-surface shadow-pop max-[420px]:-right-12"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
            <span className="font-display text-[15px] font-extrabold text-ink">Notifications</span>
            <button
              type="button"
              disabled={unread === 0 || markRead.isPending}
              onClick={() => markRead.mutate(undefined)}
              className="text-[12.5px] font-extrabold text-brand disabled:text-soft"
            >
              Mark all read
            </button>
          </div>
          {items.length === 0 ? (
            <p className="m-0 px-4 py-8 text-center text-[13px] font-semibold text-soft">You&apos;re all caught up.</p>
          ) : (
            <ul className="m-0 flex max-h-[min(420px,70vh)] list-none flex-col gap-0.5 overflow-y-auto p-1.5">
              {items.map((n) => (
                <Item key={n.id} n={n} onOpen={() => openItem(n)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
