import Icon from "./Icon";

interface SectionHeadingProps {
  icon?: string;
  eyebrow?: string;
  title: string;
  highlight?: string;
  lead?: string;
  align?: "center" | "left";
  className?: string;
}

/**
 * Eyebrow chip + big Sora heading + optional lead paragraph.
 * <SectionHeading icon="route" eyebrow="WHY BRAINXNEXT" title="Built different," highlight="on purpose." />
 */
const SectionHeading = ({ icon, eyebrow, title, highlight, lead, align = "center", className = "" }: SectionHeadingProps) => (
  <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-170 ${className}`}>
    {eyebrow && (
      <div className={`eyebrow ${align === "center" ? "mx-auto" : ""}`}>
        {icon && <Icon name={icon} size={16} />}
        {eyebrow}
      </div>
    )}
    <h2 className="mt-4.5 mb-3 font-display text-[clamp(30px,4vw,46px)] leading-[1.1] font-extrabold tracking-[-0.02em] text-ink">
      {title} {highlight && <span className="text-grad">{highlight}</span>}
    </h2>
    {lead && <p className="m-0 text-base leading-relaxed text-muted">{lead}</p>}
  </div>
);

export default SectionHeading;
