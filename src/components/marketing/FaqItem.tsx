import Icon from "../common/Icon";

/** Expandable question card */
interface FaqItemProps {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}

const FaqItem = ({ q, a, open, onToggle }: FaqItemProps) => (
  <div className={`self-start overflow-hidden rounded-[18px] border bg-surface shadow-card ${open ? "border-brand" : "border-line"}`}>
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-3 border-0 bg-transparent px-5 py-4.5 text-left text-ink"
    >
      <span className="text-[14.5px] font-extrabold">{q}</span>
      <Icon name={open ? "expand_less" : "expand_more"} className="text-soft" />
    </button>
    {open && <div className="px-5 pb-4.5 text-[13.5px] leading-[1.65] font-medium text-muted">{a}</div>}
  </div>
);

export default FaqItem;
