import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate } from "react-router-dom";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import { Alert, AuthCard, AuthHeader, SubmitButton, SuccessState } from "@/components/auth/AuthCard";
import Icon from "@/components/common/Icon";
import AuthLayout from "@/layouts/AuthLayout";
import { useResendOtp, useVerifyOtp } from "@/queries/auth";
import { OTP_LENGTH, otpSchema, type OtpValues } from "@/schemas/auth";
import { useAuthStore } from "@/stores/authStore";
import usePageTitle from "@/hooks/usePageTitle";

const RESEND_COOLDOWN_S = 30;
const emptyDigits = () => Array<string>(OTP_LENGTH).fill("");

const VerifyOtp = () => {
  usePageTitle("Verify your email");
  const verify = useVerifyOtp();
  const resendOtp = useResendOtp();
  const pendingEmail = useAuthStore((s) => s.pendingEmail) ?? "";
  const [digits, setDigits] = useState(emptyDigits);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { handleSubmit, setValue } = useForm<OtpValues>({ resolver: zodResolver(otpSchema), defaultValues: { code: "" } });

  const full = digits.every(Boolean);
  const wrong = isApiError(verify.error) && verify.error.code === API_ERROR_CODES.invalidCode;

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // the boxes are the UI; the form holds the joined code that gets validated and submitted
  const commit = (next: string[]) => {
    setDigits(next);
    setValue("code", next.join(""));
    verify.reset();
  };

  const handleChange = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    commit(digits.map((x, j) => (j === i ? v : x)));
    if (v) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      commit(digits.map((x, j) => (j === i - 1 ? "" : x)));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    commit(emptyDigits().map((_, j) => text[j] ?? ""));
    inputs.current[Math.min(text.length, OTP_LENGTH - 1)]?.focus();
  };

  const onSubmit = handleSubmit(({ code }) => verify.mutate({ email: pendingEmail, code }));

  const resend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN_S);
    commit(emptyDigits());
    resendOtp.mutate(pendingEmail);
  };

  // nothing to verify without a pending sign-up
  if (!pendingEmail && !verify.isSuccess) return <Navigate to="/register" replace />;

  return (
    <AuthLayout
      footer={
        <>
          Wrong email?{" "}
          <Link to="/register" className="font-extrabold text-brand hover:text-teal">
            Sign up again
          </Link>
        </>
      }
    >
      <AuthCard width={430} className="gap-5.5!">
        {verify.isSuccess ? (
          <SuccessState
            icon="verified"
            title="You're verified!"
            action={
              <Link to="/dashboard" className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
                Start learning
                <Icon name="arrow_forward" size={17} />
              </Link>
            }
          >
            Your email has been confirmed.
            <br />
            Welcome to BrainXNext.
          </SuccessState>
        ) : (
          <form className="flex flex-col gap-5.5" onSubmit={onSubmit} noValidate>
            <AuthHeader icon="pin" title="Enter verification code">
              We sent a 6-digit code to
              <br />
              <span className="font-extrabold text-ink">{pendingEmail}</span>
            </AuthHeader>

            <div className="flex justify-center gap-2.25">
              {digits.map((val, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${i + 1}`}
                  value={val}
                  onChange={handleChange(i)}
                  onKeyDown={handleKeyDown(i)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  className={`h-15 w-[clamp(40px,12vw,52px)] rounded-[14px] border-[1.5px] bg-surface2 text-center font-display text-2xl font-extrabold text-ink transition-all outline-none focus:border-brand focus:shadow-[0_0_0_3px_rgba(27,111,208,.15)] ${
                    wrong ? "border-danger" : val ? "border-brand" : "border-line"
                  }`}
                />
              ))}
            </div>

            {wrong && (
              <div role="alert" className="-mt-1.5 flex items-center justify-center gap-2 text-[13px] font-bold text-danger">
                <Icon name="error" size={16} />
                That code didn&apos;t match. Try again.
              </div>
            )}
            {verify.isError && !wrong && <Alert>{errorMessage(verify.error)}</Alert>}

            <SubmitButton dimmed={!full} pending={verify.isPending}>
              Verify code
            </SubmitButton>

            <p className="m-0 text-center text-[13px] font-semibold text-soft">
              {cooldown > 0 ? `Didn't get it? Resend in ${cooldown}s —` : "Didn't get it?"}{" "}
              <button
                type="button"
                onClick={resend}
                disabled={cooldown > 0}
                className={`border-0 bg-transparent p-0 text-[13px] font-extrabold ${cooldown > 0 ? "cursor-default text-soft" : "text-brand"}`}
              >
                Resend code
              </button>
            </p>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default VerifyOtp;
