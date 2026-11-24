import Icon from "@/components/common/Icon";
import LogoMark from "@/components/common/LogoMark";
import { formatDate } from "@/lib/dates";
import type { CertificateRecord } from "@/types/account";

/** The certificate itself (holder, course, issued, mentor, id). Used by /certificates/:id and /verify/:id. */
const CertificateView = ({ cert }: { cert: CertificateRecord }) => {
  const meta = [
    { label: "ISSUED", value: formatDate(cert.issuedAt) },
    { label: "MENTOR", value: cert.mentor },
    { label: "CERTIFICATE ID", value: cert.id, mono: true },
  ];
  return (
    <article className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-pop">
      <div className="h-2.5 bg-[linear-gradient(90deg,#1B6FD0,#0E97B0_55%,#F7C948)]" />
      <div className="relative flex flex-col gap-6.5 px-5.5 py-8 sm:px-12 sm:py-11">
        <Icon name="workspace_premium" size={170} className="pointer-events-none absolute top-9 right-11 text-ink opacity-[.07]" />
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          <span className="flex items-center gap-2.5">
            <LogoMark size={40} className="shadow-none!" />
            <span className="font-display text-[17px] font-extrabold text-ink">BrainXNext</span>
          </span>
          <span className="text-[11px] font-extrabold tracking-[0.14em] text-soft">CERTIFICATE OF COMPLETION</span>
        </div>
        <div className="flex flex-col gap-3.5">
          <span className="text-[13.5px] font-semibold text-muted">This certifies that</span>
          <span className="w-max max-w-full border-b-2 border-line pb-3.5 font-display text-[clamp(28px,4vw,40px)] font-extrabold tracking-[-0.02em] text-ink">
            {cert.holder}
          </span>
          <span className="text-[13.5px] font-semibold text-muted">
            has successfully completed all {cert.lessons} lessons and the final project of
          </span>
          <span className="text-grad font-display text-[clamp(19px,2.6vw,25px)] font-extrabold tracking-[-0.01em]">{cert.course}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-line pt-5.5 sm:grid-cols-3">
          {meta.map((m) => (
            <span key={m.label} className="flex min-w-0 flex-col gap-1">
              <span className="text-[10.5px] font-extrabold tracking-widest text-soft">{m.label}</span>
              <span className={`text-[13.5px] font-extrabold wrap-break-word ${m.mono ? "font-mono text-brand" : "text-ink"}`}>
                {m.value}
              </span>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default CertificateView;
