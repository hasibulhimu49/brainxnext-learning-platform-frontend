import Icon from "@/components/common/Icon";
import LogoMark from "@/components/common/LogoMark";
import { CERTIFICATE_SIGNATORY } from "@/constants/certificate";
import { formatDate } from "@/lib/dates";
import type { CertificateRecord } from "@/types/account";

/*
 * Landscape A4 certificate (297 × 210). Sizes use container units (cqw), so it scales like a
 * printed document at any width and prints as one page (see `.certificate` in index.css).
 * Colours are fixed "paper" colours, not theme tokens: a certificate stays light in dark mode.
 */

const SERIF = { fontFamily: 'Georgia, "Times New Roman", serif' };

const Signature = ({ name, title }: { name: string; title: string }) => (
  <div className="flex w-[27cqw] flex-col items-center gap-[0.6cqw] text-center">
    <span className="text-[2.4cqw] leading-none whitespace-nowrap text-[#0A1B33] italic" style={SERIF}>
      {name}
    </span>
    <span className="h-px w-full bg-[#0A1B33]/35" />
    <span className="text-[1.15cqw] font-bold tracking-[0.08em] text-[#5B6B80] uppercase">{title}</span>
  </div>
);

/** Gold seal with the certificate badge. */
const Seal = () => (
  <div
    className="relative flex aspect-square w-[12cqw] flex-none items-center justify-center rounded-full shadow-[0_0.6cqw_1.6cqw_rgba(184,134,43,.35)]"
    style={{ background: "radial-gradient(circle at 35% 30%, #FBE7A1, #E9B949 45%, #B8862B 100%)" }}
    aria-hidden="true"
  >
    <span className="absolute inset-[0.8cqw] rounded-full border-[0.2cqw] border-dashed border-white/70" />
    <span className="flex flex-col items-center leading-none text-[#5C3D0A]">
      <Icon name="workspace_premium" className="text-[4.6cqw]!" />
      <span className="mt-[0.3cqw] text-[0.95cqw] font-extrabold tracking-[0.14em]">VERIFIED</span>
    </span>
  </div>
);

/** The certificate itself. Used by /certificates/:id (print / PDF) and the public /verify/:id page. */
const CertificateView = ({ cert }: { cert: CertificateRecord }) => {
  const verifyUrl = `${typeof window === "undefined" ? "" : window.location.host}/verify/${cert.id}`;
  return (
    <article
      aria-label={`Certificate of completion for ${cert.holder}`}
      className="certificate @container relative aspect-[297/210] w-full overflow-hidden rounded-[18px] bg-[#FFFDF7] text-[#0A1B33] shadow-pop print:rounded-none print:shadow-none"
    >
      {/* fine background pattern + soft brand glows */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[.5]"
        style={{
          background:
            "radial-gradient(60% 50% at 0% 0%, rgba(27,111,208,.08), transparent 70%), radial-gradient(50% 45% at 100% 100%, rgba(233,162,27,.12), transparent 70%), repeating-linear-gradient(45deg, rgba(10,27,51,.025) 0 1px, transparent 1px 12px)",
        }}
      />
      {/* double frame */}
      <div className="pointer-events-none absolute inset-[1.6cqw] rounded-[1cqw] border-[0.35cqw] border-[#C9A24A]" />
      <div className="pointer-events-none absolute inset-[2.5cqw] rounded-[0.6cqw] border-[0.12cqw] border-[#C9A24A]/60" />

      <div className="relative flex h-full flex-col items-center justify-between px-[7cqw] pt-[5.2cqw] pb-[4.4cqw] text-center">
        <div className="flex flex-col items-center gap-[1cqw]">
          <span className="flex items-center gap-[1cqw]">
            <span className="block w-[4.4cqw]">
              <LogoMark size={44} className="h-auto! w-full! shadow-none!" />
            </span>
            <span className="font-display text-[2.3cqw] font-extrabold tracking-[-0.01em]">
              BrainX<span className="text-[#1B6FD0]">Next</span>
            </span>
          </span>
          <span className="mt-[0.8cqw] font-display text-[4.6cqw] leading-none font-extrabold tracking-[0.22em]">CERTIFICATE</span>
          <span className="flex items-center gap-[1.2cqw] text-[1.35cqw] font-extrabold tracking-[0.32em] text-[#B8862B]">
            <span className="h-px w-[5cqw] bg-[#C9A24A]" />
            OF COMPLETION
            <span className="h-px w-[5cqw] bg-[#C9A24A]" />
          </span>
        </div>

        <div className="flex flex-col items-center gap-[1.1cqw]">
          <span className="text-[1.5cqw] font-semibold text-[#5B6B80]">This is to certify that</span>
          <span className="text-[5.4cqw] leading-[1.05] text-[#0A1B33] italic" style={SERIF}>
            {cert.holder}
          </span>
          <span className="h-[0.15cqw] w-[38cqw] bg-[linear-gradient(90deg,transparent,#C9A24A,transparent)]" />
          <span className="max-w-[62cqw] text-[1.5cqw] leading-normal font-semibold text-[#5B6B80]">
            has successfully completed all {cert.lessons} lessons and the mentor-reviewed final project of
          </span>
          <span className="font-display text-[2.9cqw] leading-tight font-extrabold tracking-[-0.01em] text-[#1B6FD0]">{cert.course}</span>
        </div>

        <div className="flex w-full items-end justify-between">
          <Signature name={cert.mentor} title="Course mentor" />
          <Seal />
          <Signature name={CERTIFICATE_SIGNATORY.name} title={CERTIFICATE_SIGNATORY.title} />
        </div>

        <div className="flex w-full flex-wrap items-center justify-center gap-x-[2.4cqw] gap-y-[0.4cqw] text-[1.1cqw] font-bold text-[#5B6B80]">
          <span>
            Issued <span className="text-[#0A1B33]">{formatDate(cert.issuedAt)}</span>
          </span>
          <span>
            ID <span className="font-mono text-[#0A1B33]">{cert.id}</span>
          </span>
          <span>
            Verify at <span className="text-[#1B6FD0]">{verifyUrl}</span>
          </span>
        </div>
      </div>
    </article>
  );
};

export default CertificateView;
