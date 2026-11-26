import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Link } from "react-router-dom";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import { AuthCard, OrDivider } from "@/components/auth/AuthCard";
import { Alert, FieldError, SubmitButton } from "@/components/common/FormFeedback";
import { AuthInput, PasswordInput, PasswordStrength, SocialButtons } from "@/components/auth/AuthInputs";
import AuthLayout from "@/layouts/AuthLayout";
import { useRegister } from "@/queries/auth";
import { emailField, registerSchema, type RegisterValues } from "@/schemas/auth";
import usePageTitle from "@/hooks/usePageTitle";

const Register = () => {
  usePageTitle("Create your account");
  const signUp = useRegister();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", password: "" } });

  const values = useWatch({ control });
  const ready = registerSchema.safeParse(values).success;
  // the design flags a malformed email as you type
  const emailLooksWrong = !!values.email && !emailField.safeParse(values.email).success;
  const emailTaken = isApiError(signUp.error) && signUp.error.code === API_ERROR_CODES.emailTaken;
  const clearServerState = () => signUp.reset();

  const onSubmit = handleSubmit((v) => signUp.mutate(v));

  return (
    <AuthLayout
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-extrabold text-brand hover:text-teal">
            Log in
          </Link>
        </>
      }
    >
      <AuthCard>
        <div className="mb-0.5 flex flex-col gap-2 text-center">
          <h1 className="m-0 font-display text-[25px] font-extrabold tracking-[-0.02em] text-ink">Create your account</h1>
          <p className="m-0 text-sm font-medium text-muted">Start free — 12 courses, no card needed</p>
        </div>

        <SocialButtons />
        <OrDivider />

        <form className="flex flex-col gap-3.25" onSubmit={onSubmit} noValidate>
          <AuthInput
            autoComplete="name"
            placeholder="Full name"
            aria-label="Full name"
            invalid={!!errors.name}
            {...register("name", { onChange: clearServerState })}
          />
          <FieldError message={errors.name?.message} />
          <AuthInput
            type="email"
            autoComplete="email"
            placeholder="Email address"
            aria-label="Email address"
            invalid={emailLooksWrong || !!errors.email}
            {...register("email", { onChange: clearServerState })}
          />
          <FieldError message={errors.email?.message} />
          <PasswordInput
            autoComplete="new-password"
            placeholder="Password (8+ characters)"
            aria-label="Password"
            invalid={!!errors.password}
            {...register("password", { onChange: clearServerState })}
          />
          <PasswordStrength password={values.password ?? ""} />
          <FieldError message={errors.password?.message} />

          <SubmitButton dimmed={!ready} pending={signUp.isPending}>
            {signUp.isSuccess ? "Account created ✓" : "Create free account"}
          </SubmitButton>

          {emailTaken && (
            <Alert>
              An account with this email already exists.{" "}
              <Link to="/login" className="font-extrabold underline">
                Log in instead
              </Link>
            </Alert>
          )}
          {signUp.isError && !emailTaken && <Alert>{errorMessage(signUp.error)}</Alert>}
          {signUp.isSuccess && (
            <Alert tone="success">
              Account created!{" "}
              <Link to="/verify-otp" className="font-extrabold underline">
                Enter the code
              </Link>{" "}
              we emailed you.
            </Alert>
          )}
        </form>

        <p className="m-0 text-center text-xs leading-normal font-medium text-soft">
          By signing up you agree to our{" "}
          <Link to="/terms" className="font-bold text-muted">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="font-bold text-muted">
            Privacy Policy
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default Register;
