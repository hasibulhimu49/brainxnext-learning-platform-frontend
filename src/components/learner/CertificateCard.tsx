import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { formatDate } from "@/lib/dates";
import type { CertificateRecord } from "@/types/account";

/** One certificate in the /certificates grid. */
const CertificateCard = ({ cert }: { cert: CertificateRecord }) => (
  <article className="card card-hover flex flex-col overflow-hidden rounded-[22px]!">
    <div className="h-2 bg-[linear-gradient(90deg,#1B6FD0,#0E97B0_55%,#F7C948)]" />
    <div className="flex flex-1 flex-col gap-4 p-6">
      <span className="bg-grad-gold flex h-12 w-12 items-center justify-center rounded-2xl">
        <Icon name="workspace_premium" size={24} className="text-cocoa" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="m-0 font-display text-[16.5px] font-extrabold tracking-[-0.01em] text-ink">{cert.course}</h2>
        <span className="text-[13px] font-semibold text-soft">Issued {formatDate(cert.issuedAt)}</span>
      </div>
      <span className="w-max rounded-[10px] border border-line bg-surface2 px-2.5 py-1.5 font-mono text-[12px] font-extrabold text-brand">
        {cert.id}
      </span>
      <div className="mt-auto flex gap-2.5 pt-1">
        <Link to={`/certificates/${cert.id}`} className="btn btn-primary flex-1 rounded-[13px] px-4 py-3 text-[13.5px]">
          <Icon name="visibility" size={17} />
          View
        </Link>
        <Link
          to={`/certificates/${cert.id}?print=1`}
          aria-label={`Download ${cert.course} certificate`}
          className="btn btn-outline flex-1 rounded-[13px] px-4 py-3 text-[13.5px]"
        >
          <Icon name="download" size={17} />
          Download
        </Link>
      </div>
    </div>
  </article>
);

export default CertificateCard;
