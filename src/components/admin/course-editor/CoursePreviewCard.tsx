import Icon from "@/components/common/Icon";
import { formatTaka, plural } from "@/lib/utils";

interface CoursePreviewCardProps {
  status: "published" | "draft";
  thumb: string | null;
  track?: string;
  title?: string;
  blurb?: string;
  level: string;
  lang?: string;
  lessonCount: number;
  isPaid: boolean;
  price?: string;
  discount?: string;
}

/** Live "CARD PREVIEW" of the course as it will appear in the catalog. */
const CoursePreviewCard = ({
  status,
  thumb,
  track,
  title,
  blurb,
  level,
  lang,
  lessonCount,
  isPaid,
  price,
  discount,
}: CoursePreviewCardProps) => {
  const badge = isPaid ? (discount ? `${discount}% OFF` : level.toUpperCase()) : "FREE";
  const badgeCls = isPaid ? (discount ? "bg-[#EC3013] text-white" : "bg-white/20 text-white") : "bg-white text-brand";
  return (
    <div className="card overflow-hidden shadow-card-lg">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <span className="font-display text-[13px] font-extrabold tracking-[0.08em] text-soft">CARD PREVIEW</span>
        <span
          className={`pill px-2.5 py-1 text-[10.5px] ${status === "published" ? "bg-success/14 text-success" : "bg-amber/16 text-[#B57708]"}`}
        >
          {status === "published" ? "PUBLISHED" : "DRAFT"}
        </span>
      </div>
      <div className="p-4.5">
        <div className="overflow-hidden rounded-[18px] border border-line bg-surface">
          <div
            className="bg-grad-brand flex h-27.5 flex-col justify-between px-4 py-3.5"
            style={thumb ? { background: `url("${thumb}") center/cover` } : undefined}
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-extrabold tracking-[0.12em] text-white/90">{(track ?? "").toUpperCase()}</span>
              <span className={`pill px-2.25 py-1 text-[10px] ${badgeCls}`}>{badge}</span>
            </div>
            {!thumb && <Icon name="school" size={34} className="text-white/85" />}
          </div>
          <div className="flex flex-col gap-2 p-4">
            <span className="font-display text-[15px] leading-tight font-bold text-ink">{title?.trim() || "Untitled course"}</span>
            <span className="text-xs leading-normal text-muted">{blurb?.trim() || "Short description will appear here."}</span>
            <span className="flex gap-3 text-[11px] font-bold text-soft">
              <span>{level}</span>
              <span>{plural(lessonCount, "class", "es")}</span>
              <span>{lang}</span>
            </span>
            <span className="mt-0.5 flex items-center justify-between border-t border-line pt-2.75">
              <span className="text-[11.5px] font-bold text-muted">BrainXNext</span>
              <span className={`font-display text-[15px] font-extrabold ${isPaid ? "text-ink" : "text-success"}`}>
                {isPaid ? formatTaka(Number(price || 0)) : "Free"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewCard;
