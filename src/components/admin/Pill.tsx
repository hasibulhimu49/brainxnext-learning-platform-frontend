import { PILL_TONE, STATUS_META, type PillTone } from "@/constants/admin";

/** Status pill. Pass a known status (`paid`, `draft`, …) or an explicit label + tone. */
const Pill = ({ status, label, tone }: { status?: string; label?: string; tone?: PillTone }) => {
  const meta = status ? STATUS_META[status] : undefined;
  return (
    <span
      className={`inline-block rounded-full px-2 py-1.25 text-[9px] leading-none font-black whitespace-nowrap ${PILL_TONE[tone ?? meta?.tone ?? "neutral"]}`}
    >
      {label ?? meta?.label ?? status}
    </span>
  );
};

export default Pill;
