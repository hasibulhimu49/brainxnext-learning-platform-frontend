import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_ERROR_CODES, errorMessage, isApiError } from "@/api/envelope";
import { AuthCard, OrDivider } from "@/components/auth/AuthCard";
import { Alert, FieldError, SubmitButton } from "@/components/common/FormFeedback";
import { AuthInput, PasswordInput, SocialButtons } from "@/components/auth/AuthInputs";
import AuthLayout from "@/layouts/AuthLayout";
import { useLogin } from "@/queries/auth";
import { homeFor, safeNext } from "@/routes/redirects";
import { loginSchema, type LoginValues } from "@/schemas/auth";
import usePageTitle from "@/hooks/usePageTitle";

/** Why the user is on the login page, from ?reason= / ?next= */
const noticeFor = (expired: boolean, next: string | null) => {
  if (expired) return "Your session expired — please log in again.";
  if (next?.startsWith("/checkout")) return "Log in to finish your purchase — we'll take you straight back to checkout.";
  if (next) return "Log in to continue — we'll take you right back.";
  return null;
};

const Login = () => {
  usePageTitle("Log in");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const notice = noticeFor(params.get("reason") === "expired", next);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "", remember: true } });

  const values = useWatch({ control });
  const ready = loginSchema.safeParse(values).success;
  const unverified = isApiError(login.error) && login.error.code === API_ERROR_CODES.emailNotVerified;
  // our own copy: the reset link sits above the button, whatever the server message says
  const wrongPassword = isApiError(login.error) && login.error.code === API_ERROR_CODES.wrongPassword;
  // editing a field clears the previous server error, like the design
  const clearServerState = () => login.reset();

  const onSubmit = handleSubmit(({ email, password, remember }) =>
    login.mutate({ email, password, remember }, { onSuccess: ({ user }) => navigate(next ?? homeFor(user.role), { replace: true }) })
  );

  return (
    <AuthLayout
      footer={
        <>
          New to BrainXNext?{" "}
          <Link to="/register" className="font-extrabold text-brand hover:text-teal">
            Sign up free
          </Link>
        </>
      }
    >
      <AuthCard>
        <div className="mb-0.5 flex flex-col gap-2 text-center">
          <h1 className="m-0 font-display text-[25px] font-extrabold tracking-[-0.02em] text-ink">Welcome back</h1>
          <p className="m-0 text-sm font-medium text-muted">Log in to continue learning</p>
        </div>

        {notice && <Alert tone="info">{notice}</Alert>}

        <SocialButtons />
        <OrDivider />

        <form className="flex flex-col gap-3.25" onSubmit={onSubmit} noValidate>
          <AuthInput
            type="email"
            autoComplete="email"
            placeholder="Email address"
            aria-label="Email address"
            invalid={!!errors.email}
            {...register("email", { onChange: clearServerState })}
          />
          <FieldError message={errors.email?.message} />
          <PasswordInput
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Password"
            invalid={!!errors.password}
            {...register("password", { onChange: clearServerState })}
          />
          <FieldError message={errors.password?.message} />

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="m-0 h-3.75 w-3.75 accent-brand" {...register("remember")} />
              <span className="text-[13px] font-semibold text-muted">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-[13px] font-bold text-brand hover:text-teal">
              Forgot password?
            </Link>
          </div>

          <SubmitButton dimmed={!ready} pending={login.isPending}>
            {login.isSuccess ? "Logged in ✓" : "Log in"}
          </SubmitButton>

          {unverified && (
            <Alert>
              Please verify your email first.{" "}
              <Link to="/verify-otp" className="font-extrabold underline">
                Enter your code
              </Link>
            </Alert>
          )}
          {wrongPassword && <Alert>Wrong password. Try again, or use “Forgot password?” above.</Alert>}
          {login.isError && !unverified && !wrongPassword && <Alert>{errorMessage(login.error)}</Alert>}
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
