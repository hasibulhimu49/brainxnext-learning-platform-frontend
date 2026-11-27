import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { errorMessage } from "@/api/envelope";
import { AuthCard, AuthHeader } from "@/components/auth/AuthCard";
import { Alert, FieldError, SubmitButton, SuccessState } from "@/components/common/FormFeedback";
import { AuthInput } from "@/components/auth/AuthInputs";
import Icon from "@/components/common/Icon";
import AuthLayout from "@/layouts/AuthLayout";
import { useForgotPassword } from "@/queries/auth";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/auth";
import usePageTitle from "@/hooks/usePageTitle";

const ForgotPassword = () => {
  usePageTitle("Forgot password");
  const forgot = useForgotPassword();
  const [resent, setResent] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  const email = useWatch({ control, name: "email" });
  const emailOk = forgotPasswordSchema.safeParse({ email }).success;

  const onSubmit = handleSubmit(({ email: value }) => forgot.mutate(value));
  const resend = () => forgot.mutate(getValues("email").trim(), { onSuccess: () => setResent(true) });

  return (
    <AuthLayout
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-extrabold text-brand hover:text-teal">
            Back to log in
          </Link>
        </>
      }
    >
      <AuthCard>
        {forgot.isSuccess ? (
          <SuccessState
            icon="mark_email_read"
            title="Check your inbox"
            action={
              <Link
                to="/login"
                className="btn w-full rounded-[13px] border border-line bg-surface2 px-5 py-3.5 text-ink hover:border-brand hover:text-brand"
              >
                <Icon name="arrow_back" size={17} />
                Back to log in
              </Link>
            }
          >
            <p className="m-0">
              We sent a password reset link to
              <br />
              <span className="font-extrabold text-ink">{forgot.data.sentTo}</span>
            </p>
            <p className="m-0 mt-4.5 text-[12.5px] leading-[1.55] text-soft">
              Didn&apos;t get it? Check spam or{" "}
              <button type="button" onClick={resend} className="border-0 bg-transparent p-0 text-[12.5px] font-extrabold text-brand">
                resend the email
              </button>
              {resent && " — sent again ✓"}
            </p>
            {forgot.data.devResetLink && (
              <Link
                to={forgot.data.devResetLink}
                className="mt-3.5 inline-flex items-center gap-1.5 rounded-full border border-dashed border-line px-3.5 py-2 text-[12.5px] font-extrabold text-brand hover:border-brand"
              >
                <Icon name="link" size={15} />
                Open the reset link (demo)
              </Link>
            )}
          </SuccessState>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
            <AuthHeader icon="lock_reset" title="Forgot your password?">
              <span className="inline-block max-w-[32ch]">No worries — enter your email and we&apos;ll send you a reset link.</span>
            </AuthHeader>
            <AuthInput
              type="email"
              autoComplete="email"
              placeholder="Email address"
              aria-label="Email address"
              invalid={(email !== "" && !emailOk) || !!errors.email}
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
            <SubmitButton dimmed={!emailOk} pending={forgot.isPending}>
              Send reset link
            </SubmitButton>
            {forgot.isError && <Alert>{errorMessage(forgot.error)}</Alert>}
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPassword;
