import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { passwordStrength } from "@/schemas/auth";
import Icon from "../common/Icon";

type AuthInputProps = Omit<ComponentProps<typeof Input>, "size"> & { invalid?: boolean };

/** Text / email input on auth cards. `invalid` shows the red border. */
export const AuthInput = ({ invalid, ...rest }: AuthInputProps) => <Input size="lg" aria-invalid={invalid || undefined} {...rest} />;

type PasswordInputProps = Omit<AuthInputProps, "type"> & {
  /** control visibility from the parent (e.g. to share it with a confirm field) */
  show?: boolean;
  onToggleShow?: () => void;
};

/** Password input with a show/hide eye button */
export const PasswordInput = ({ invalid, show: showProp, onToggleShow, className, ...rest }: PasswordInputProps) => {
  const [showLocal, setShowLocal] = useState(false);
  const show = showProp ?? showLocal;
  const toggle = onToggleShow ?? (() => setShowLocal((x) => !x));
  return (
    <span className="relative block">
      <AuthInput type={show ? "text" : "password"} invalid={invalid} className={`pr-12 ${className ?? ""}`} {...rest} />
      <button
        type="button"
        onClick={toggle}
        title="Show / hide password"
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-1.75 flex h-8.5 w-8.5 -translate-y-1/2 items-center justify-center rounded-[10px] border-0 bg-transparent text-soft hover:text-brand"
      >
        <Icon name={show ? "visibility_off" : "visibility"} size={19} />
      </button>
    </span>
  );
};

const STRENGTH_COLORS = ["var(--line)", "#D9302C", "#E9A21B", "#3FA457"] as const;
const STRENGTH_LABELS = ["Too short", "Okay", "Good", "Strong"] as const;

/** Three-segment strength meter */
export const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  const s = passwordStrength(password);
  const color = STRENGTH_COLORS[s];
  return (
    <span className="flex items-center gap-1.25" aria-live="polite">
      {[1, 2, 3].map((n) => (
        <span key={n} className="h-0.75 flex-1 rounded-full" style={{ background: s >= n ? color : "var(--line)" }} />
      ))}
      <span className="ml-1.5 text-[11.5px] font-bold whitespace-nowrap text-soft">{STRENGTH_LABELS[s]}</span>
    </span>
  );
};

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
    />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const GitHubIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.02 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12v3.14c0 .3.2.67.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const socialBtn =
  "inline-flex items-center justify-center gap-2 rounded-[13px] border border-line bg-surface2 px-3.5 py-3 text-[13.5px] font-bold text-ink transition-all hover:border-brand";

/** Google + GitHub sign-in buttons */
export const SocialButtons = () => (
  <div className="grid grid-cols-2 gap-2.5">
    <button type="button" className={socialBtn}>
      <GoogleIcon />
      Google
    </button>
    <button type="button" className={socialBtn}>
      <GitHubIcon />
      GitHub
    </button>
  </div>
);
