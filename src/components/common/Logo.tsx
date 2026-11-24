import { Link } from "react-router-dom";
import LogoMark from "./LogoMark";

type LogoSize = "sm" | "footer" | "md" | "lg";

/**
 * BrainXNext brand mark: round emblem + wordmark.
 * - size: "sm" | "footer" | "md" | "lg"
 * - tagline: show "LEARN • BUILD • GROW" under the name
 * - markOnly: just the emblem
 * - onDark: plain white wordmark for dark footers
 */
const sizes: Record<LogoSize, { mark: number; name: string; gap?: string }> = {
  sm: { mark: 30, name: "text-[16px]" },
  footer: { mark: 34, name: "text-[17px]" },
  md: { mark: 36, name: "text-[17px]" },
  lg: { mark: 40, name: "text-[18px]", gap: "gap-2.75" },
};

interface LogoProps {
  to?: string;
  size?: LogoSize;
  tagline?: boolean;
  markOnly?: boolean;
  onDark?: boolean;
  className?: string;
}

const Logo = ({ to = "/", size = "md", tagline = false, markOnly = false, onDark = false, className = "" }: LogoProps) => {
  const s = sizes[size];
  return (
    <Link to={to} className={`flex items-center ${s.gap ?? "gap-2.5"} text-ink ${className}`} aria-label="BrainXNext home">
      <LogoMark size={s.mark} className={onDark ? "shadow-none!" : ""} />
      {!markOnly && (
        <span className="flex flex-col leading-[1.1]">
          <span className={`font-display font-extrabold ${s.name} ${onDark ? "text-white" : "text-ink"}`}>
            {onDark ? (
              "BrainXNext"
            ) : (
              <>
                BrainX<span className="text-grad">Next</span>
              </>
            )}
          </span>
          {tagline && (
            <span className="hidden text-[9.5px] font-bold tracking-[0.16em] whitespace-nowrap text-soft sm:inline">
              LEARN • BUILD • GROW
            </span>
          )}
        </span>
      )}
    </Link>
  );
};

export default Logo;
