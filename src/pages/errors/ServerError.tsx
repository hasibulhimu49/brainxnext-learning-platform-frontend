import { Link } from "react-router-dom";
import ErrorCode from "@/components/common/ErrorCode";
import Icon from "@/components/common/Icon";
import AuthLayout from "@/layouts/AuthLayout";
import usePageTitle from "@/hooks/usePageTitle";

/** 500 — rendered by AppErrorBoundary when a screen crashes. */
const ServerError = ({ onRetry }: { onRetry?: () => void }) => {
  usePageTitle("Something went wrong");
  return (
    <AuthLayout
      mainClassName="items-center pt-6 pb-16"
      footer={<span className="text-[12.5px] text-soft">Error code: 500 · Something went wrong</span>}
    >
      <div className="flex w-full flex-col items-center gap-6.5 text-center">
        <ErrorCode code="500" topIcon="build" bottomIcon="cloud_off" />

        <div className="flex max-w-120 flex-col gap-3">
          <h1 className="m-0 font-display text-[clamp(22px,3.4vw,30px)] font-extrabold tracking-[-0.02em] text-ink">
            Something broke on our side
          </h1>
          <p className="m-0 text-[15px] leading-[1.65] font-medium text-muted">
            It&apos;s not you — this page hit an unexpected error. Try again, and if it keeps happening, let us know.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onRetry ?? (() => window.location.reload())}
            className="btn btn-primary px-7 py-3.75 text-[14.5px]"
          >
            <Icon name="refresh" size={18} />
            Try again
          </button>
          <Link to="/" className="btn btn-outline px-6.5 py-3.5 text-[14.5px]">
            <Icon name="home" size={18} />
            Back home
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ServerError;
