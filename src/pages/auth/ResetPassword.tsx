import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import { Alert, AuthCard, AuthHeader, FieldError, SubmitButton, SuccessState } from "@/components/auth/AuthCard";
import { AuthInput, PasswordInput, PasswordStrength } from "@/components/auth/AuthInputs";
import Icon from "@/components/common/Icon";
import AuthLayout from "@/layouts/AuthLayout";
import { useResetPassword } from "@/queries/auth";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/auth";
import usePageTitle from "@/hooks/usePageTitle";

/** Missing, used or expired reset token */
const InvalidLink = () => (
  <div className="flex flex-col gap-5">
    <AuthHeader icon="link_off" title="This reset link isn't valid">
      Reset links work once and expire after 30 minutes. Request a new one and we&apos;ll email it right away.
    </AuthHeader>
    <Link to="/forgot-password" className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
      Request a new link
      <Icon name="arrow_forward" size={17} />
    </Link>
  </div>
);

const ResetPassword = () => {
  usePageTitle("Reset password");
  const reset = useResetPassword();
  const [show, setShow] = useState(false);
  const token = useSearchParams()[0].get("token") ?? "";
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: "", confirm: "" } });

  const values = useWatch({ control });
  const ready = resetPasswordSchema.safeParse(values).success;
  // the design flags a mismatch as soon as you type in the confirm field
  const mismatch = !!values.confirm && values.password !== values.confirm;

  const badToken = !token || (isApiError(reset.error) && reset.error.code === API_ERROR_CODES.invalidResetToken);

  const onSubmit = handleSubmit(({ password }) => reset.mutate({ token, password }));

  return (
    <AuthLayout
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-extrabold text-brand hover:text-teal">
            Back to login
          </Link>
        </>
      }
    >
      <AuthCard>
        {badToken ? (
          <InvalidLink />
        ) : reset.isSuccess ? (
          <SuccessState
            icon="lock_reset"
            title="Password updated!"
            action={
              <Link to="/login" className="btn btn-primary w-full rounded-[13px] px-5 py-3.75 text-[14.5px]">
                Log in
                <Icon name="arrow_forward" size={17} />
              </Link>
            }
          >
            Your password has been changed and all other sessions were signed out. Log in with your new password.
          </SuccessState>
        ) : (
          <div className="flex flex-col gap-5">
            <AuthHeader icon="key" title="Set a new password">
              Choose a new password for your BrainXNext account.
            </AuthHeader>

            <form className="flex flex-col gap-3.25" onSubmit={onSubmit} noValidate>
              <PasswordInput
                autoComplete="new-password"
                placeholder="New password (8+ characters)"
                aria-label="New password"
                show={show}
                onToggleShow={() => setShow((x) => !x)}
                invalid={!!errors.password}
                {...register("password")}
              />
              <PasswordStrength password={values.password ?? ""} />
              <FieldError message={errors.password?.message} />
              <AuthInput
                type={show ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Confirm new password"
                aria-label="Confirm new password"
                invalid={mismatch || !!errors.confirm}
                {...register("confirm")}
              />
              <FieldError message={mismatch ? "Passwords don't match" : errors.confirm?.message} />
              <SubmitButton dimmed={!ready} pending={reset.isPending}>
                Reset password
              </SubmitButton>
              {reset.isError && <Alert>{errorMessage(reset.error)}</Alert>}
            </form>

            <div className="flex items-start gap-2.25 rounded-[13px] border border-line bg-surface2 px-3.75 py-3">
              <Icon name="timer" size={16} className="mt-px text-amber" />
              <span className="text-xs leading-[1.55] font-semibold text-muted">
                This reset link expires in 30 minutes and can be used once. Not you?{" "}
                <Link to="/contact" className="font-extrabold text-brand">
                  Contact us.
                </Link>
              </span>
            </div>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ResetPassword;
