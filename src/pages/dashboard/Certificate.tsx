import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { API_ERROR_CODES, isApiError } from "@/api/envelope";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import { ErrorState, LoadingState } from "@/components/common/QueryStatus";
import CertificateView from "@/components/learner/CertificateView";
import usePageTitle from "@/hooks/usePageTitle";
import AuthLayout from "@/layouts/AuthLayout";
import { useMyCertificate } from "@/queries/account";
import type { CertificateRecord } from "@/types/account";

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.74v20.51C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.74C24 .78 23.2 0 22.22 0z" />
  </svg>
);

/** Public verification link for a certificate on the current origin. */
const verifyUrl = (id: string) => `${window.location.origin}/verify/${encodeURIComponent(id)}`;

const ShareCard = ({ cert }: { cert: CertificateRecord }) => {
  const [copied, setCopied] = useState(false);
  const url = verifyUrl(cert.id);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copyLink = () => {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
  };

  return (
    <div className="card flex flex-col gap-2.75 rounded-3xl! p-6.5 print:hidden">
      <h2 className="mt-0 mb-1 font-display text-base font-extrabold text-ink">Share &amp; download</h2>
      <button type="button" onClick={() => window.print()} className="btn btn-primary rounded-[13px] px-4.5 py-3.5">
        <Icon name="download" size={18} />
        Download PDF
      </button>
      <button type="button" onClick={copyLink} className="btn btn-outline rounded-[13px] px-4.5 py-3.25">
        <Icon name={copied ? "check" : "content_copy"} size={18} />
        {copied ? "Link copied!" : "Copy public link"}
      </button>
      <a
        href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.course)}&certId=${encodeURIComponent(cert.id)}&certUrl=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noreferrer"
        className="btn btn-outline rounded-[13px] px-4.5 py-3.25"
      >
        <LinkedInIcon />
        Add to LinkedIn
      </a>
    </div>
  );
};

const CertificateDetail = ({ cert }: { cert: CertificateRecord }) => {
  // /certificates/:id?print=1 (the list's Download button) opens the print / save-as-PDF dialog
  const [params] = useSearchParams();
  const print = params.get("print") === "1";
  useEffect(() => {
    if (!print) return undefined;
    const t = setTimeout(() => window.print(), 300);
    return () => clearTimeout(t);
  }, [print]);
  return (
    <div className="grid w-full max-w-260 grid-cols-1 items-start gap-6 min-[901px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <CertificateView cert={cert} />
      <div className="flex flex-col gap-4.5">
        <ShareCard cert={cert} />
        <div className="card flex flex-col gap-2.5 rounded-3xl! p-6.5 print:hidden">
          <h2 className="m-0 font-display text-base font-extrabold text-ink">Verify a certificate</h2>
          <p className="m-0 text-[13px] leading-[1.55] font-medium text-muted">
            Anyone can confirm this certificate is genuine on its public page — no account needed.
          </p>
          <Link to={`/verify/${cert.id}`} className="inline-flex items-center gap-1.5 text-[13.5px] font-extrabold text-brand">
            Open the verification page
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>
        <div className="flex items-start gap-2.75 rounded-[20px] border border-line bg-surface2 px-5 py-4.5 print:hidden">
          <Icon name="link" size={18} className="mt-px text-brand" />
          <span className="text-[12.5px] leading-relaxed font-semibold text-muted">
            Every certificate links to the holder&apos;s public portfolio with the projects they actually built — recruiters can see the
            work, not just the paper.
          </span>
        </div>
      </div>
    </div>
  );
};

const CertificateNotFound = () => (
  <AuthCard>
    <AuthHeader icon="workspace_premium" title="Certificate not found">
      This certificate doesn&apos;t exist or isn&apos;t in your account. To check someone else&apos;s, use the public verification page.
    </AuthHeader>
    <Link to="/certificates" className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
      My certificates
    </Link>
    <Link to="/verify" className="text-center text-[13.5px] font-extrabold text-brand">
      Verify a certificate
    </Link>
  </AuthCard>
);

/** /certificates/:certId — one of the signed-in user's certificates. */
const Certificate = () => {
  const { certId = "" } = useParams();
  usePageTitle("Certificate");
  const cert = useMyCertificate(certId);
  const notFound = isApiError(cert.error) && cert.error.code === API_ERROR_CODES.notFound;

  return (
    <AuthLayout
      closeTo="/certificates"
      mainClassName="items-start pt-6 pb-16"
      headerExtra={
        <span className="hidden items-center gap-1.75 rounded-full border border-line bg-surface px-4 py-2.25 text-[12.5px] font-bold text-muted min-[520px]:inline-flex">
          <Icon name="verified" size={16} className="text-success" />
          Verified certificate
        </span>
      }
      footer={
        <span className="text-[13.5px] print:hidden">
          Earn another —{" "}
          <Link to="/courses" className="font-extrabold text-brand">
            browse courses
          </Link>{" "}
          or{" "}
          <Link to="/dashboard" className="font-extrabold text-brand">
            go to your dashboard
          </Link>
        </span>
      }
    >
      {cert.isPending ? (
        <LoadingState />
      ) : notFound ? (
        <CertificateNotFound />
      ) : cert.isError ? (
        <ErrorState error={cert.error} onRetry={() => void cert.refetch()} />
      ) : (
        <CertificateDetail cert={cert.data} />
      )}
    </AuthLayout>
  );
};

export default Certificate;
