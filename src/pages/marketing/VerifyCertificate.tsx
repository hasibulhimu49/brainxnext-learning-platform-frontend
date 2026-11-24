import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import { FieldError } from "@/components/auth/AuthCard";
import HeroBand from "@/components/common/HeroBand";
import Icon from "@/components/common/Icon";
import { LoadingState } from "@/components/common/QueryStatus";
import CertificateView from "@/components/learner/CertificateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import usePageTitle from "@/hooks/usePageTitle";
import { formatDate } from "@/lib/dates";
import { usePublicCertificate } from "@/queries/account";
import { CERT_ID_EXAMPLE, certificateLookupSchema, type CertificateLookupValues } from "@/schemas/account";
import type { CertificateRecord } from "@/types/account";

const ValidResult = ({ cert }: { cert: CertificateRecord }) => (
  <div className="flex flex-col gap-5">
    <div role="status" className="card flex items-start gap-3.5 rounded-3xl! border-success/35 p-5.5">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-success/35 bg-success/12">
        <Icon name="verified" size={24} className="text-success" />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-[17px] font-extrabold text-ink">Valid certificate</span>
        <span className="text-[13.5px] leading-relaxed font-semibold text-muted">
          Issued by BrainXNext to <span className="font-extrabold text-ink">{cert.holder}</span> for{" "}
          <span className="font-extrabold text-ink">{cert.course}</span> on {formatDate(cert.issuedAt)}.
        </span>
      </span>
    </div>
    <CertificateView cert={cert} />
  </div>
);

const InvalidResult = ({ id, message }: { id: string; message: string }) => (
  <div role="alert" className="card flex items-start gap-3.5 rounded-3xl! border-danger/35 p-5.5">
    <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-danger/35 bg-danger/8">
      <Icon name="gpp_bad" size={24} className="text-danger" />
    </span>
    <span className="flex min-w-0 flex-col gap-1">
      <span className="font-display text-[17px] font-extrabold text-ink">No valid certificate</span>
      <span className="text-[13.5px] leading-relaxed font-semibold wrap-break-word text-muted">
        <span className="font-mono font-extrabold text-ink">{id}</span> — {message}
      </span>
    </span>
  </div>
);

/** /verify/:certId? — public certificate check (no account). The LinkedIn / share link points here. */
const VerifyCertificate = () => {
  const { certId = "" } = useParams();
  const id = certId.trim().toUpperCase();
  usePageTitle("Verify a certificate");
  const navigate = useNavigate();
  const lookup = usePublicCertificate(id);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CertificateLookupValues>({ resolver: zodResolver(certificateLookupSchema), values: { certId: id } });

  const onSubmit = handleSubmit(({ certId: next }) => navigate(`/verify/${encodeURIComponent(next)}`));
  const notFound = isApiError(lookup.error) && lookup.error.code === API_ERROR_CODES.notFound;

  return (
    <>
      <HeroBand className="pt-16 pb-14" innerClassName="max-w-190 items-center text-center gap-4!">
        <div className="eyebrow-dark">
          <Icon name="verified" size={16} className="text-gold" />
          CERTIFICATE VERIFICATION
        </div>
        <h1 className="m-0 font-display text-[clamp(30px,4.2vw,48px)] leading-[1.06] font-extrabold tracking-[-0.02em]">
          Verify a <span className="text-grad-hero">certificate</span>
        </h1>
        <p className="m-0 max-w-130 text-base leading-relaxed font-semibold text-[#C3D8EF]">
          Enter the ID printed on a BrainXNext certificate to confirm who earned it, for which course and when.
        </p>
        <form onSubmit={onSubmit} noValidate className="mt-2 flex w-full max-w-140 flex-col gap-2 text-left">
          <div className="flex gap-2.5 max-[460px]:flex-col">
            <Input
              aria-label="Certificate ID"
              placeholder={CERT_ID_EXAMPLE}
              aria-invalid={!!errors.certId || undefined}
              className="min-w-0 flex-1 rounded-full! border-white/20! bg-surface! px-5! py-3.75! font-mono text-[14px]! font-bold! uppercase shadow-pop"
              {...register("certId")}
            />
            <Button type="submit" size="none" className="px-7 py-3.75 text-[14.5px]">
              <Icon name="search" size={18} />
              Verify
            </Button>
          </div>
          <FieldError message={errors.certId?.message} />
        </form>
      </HeroBand>

      <section className="bg-page px-4.5 pt-10 pb-22 sm:px-6">
        <div className="mx-auto max-w-205">
          {!id ? (
            <p className="m-0 text-center text-[14px] font-semibold text-soft">
              Certificate IDs look like <span className="font-mono font-extrabold text-ink">{CERT_ID_EXAMPLE}</span>.
            </p>
          ) : lookup.isPending ? (
            <LoadingState label="Checking…" />
          ) : lookup.isSuccess ? (
            <ValidResult cert={lookup.data} />
          ) : (
            <InvalidResult
              id={id}
              message={notFound ? "we have no certificate with this ID. Check it for typos." : errorMessage(lookup.error)}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default VerifyCertificate;
