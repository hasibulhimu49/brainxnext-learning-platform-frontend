import type { ReactNode } from "react";

/** White section card of the course editor, with an optional title row + action. */
const EditorCard = ({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <div className={`card flex flex-col gap-4 p-5 sm:p-7 ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3.5">
        <h2 className="m-0 font-display text-[17px] font-extrabold text-ink">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </div>
);

export default EditorCard;
