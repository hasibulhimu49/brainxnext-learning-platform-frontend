import { Link } from "react-router-dom";
import Icon from "@/components/common/Icon";
import { QueryStatus } from "@/components/common/QueryStatus";
import CertificateCard from "@/components/learner/CertificateCard";
import LearnerPage, { EmptyCard } from "@/components/learner/LearnerPage";
import usePageTitle from "@/hooks/usePageTitle";
import { plural } from "@/lib/utils";
import { useCertificates, useIsPro } from "@/queries/account";
import type { CertificateRecord } from "@/types/account";

const CertificatesView = ({ certs, isPro }: { certs: CertificateRecord[]; isPro: boolean }) =>
  certs.length === 0 ? (
    <EmptyCard
      icon="workspace_premium"
      title="No certificates yet"
      action={
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link to="/dashboard/courses" className="btn btn-primary px-6.5 py-3.5 text-[14.5px]">
            <Icon name="play_arrow" size={18} />
            Continue a course
          </Link>
          {!isPro && (
            <Link to="/checkout/plan/pro" className="btn btn-outline px-6.5 py-3.5 text-[14.5px]">
              Go Pro
            </Link>
          )}
        </div>
      }
    >
      Finish every lesson of a course to earn its certificate.
      {!isPro && " Certificates come with Pro, or with any course you buy."}
    </EmptyCard>
  ) : (
    <div className="grid grid-cols-1 gap-5 min-[1001px]:grid-cols-3 sm:grid-cols-2">
      {certs.map((c) => (
        <CertificateCard key={c.id} cert={c} />
      ))}
    </div>
  );

/** /certificates — every certificate the signed-in learner has earned. */
const Certificates = () => {
  usePageTitle("My certificates");
  const certs = useCertificates();
  const isPro = useIsPro() ?? false;
  return (
    <LearnerPage
      title="My certificates"
      subtitle={certs.data ? `${plural(certs.data.length, "certificate")} earned` : undefined}
      actions={
        <Link to="/verify" className="btn btn-outline px-5 py-3 text-[13.5px]">
          <Icon name="verified" size={17} />
          Verify a certificate
        </Link>
      }
    >
      <QueryStatus query={certs}>{(list) => <CertificatesView certs={list} isPro={isPro} />}</QueryStatus>
    </LearnerPage>
  );
};

export default Certificates;
