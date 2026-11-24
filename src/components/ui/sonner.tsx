import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import Icon from "@/components/common/Icon";
import useTheme from "@/hooks/useTheme";

/**
 * shadcn/ui Toaster (sonner), themed with the BrainXNext tokens and the app's own theme store
 * (instead of next-themes). Mounted once in App.tsx; call `toast("…")` from "sonner" anywhere.
 */
const Toaster = (props: ToasterProps) => {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme}
      position="bottom-center"
      icons={{
        success: <Icon name="check_circle" size={18} className="text-success" />,
        info: <Icon name="info" size={18} className="text-brand" />,
        warning: <Icon name="warning" size={18} className="text-amber" />,
        error: <Icon name="error" size={18} className="text-danger" />,
        loading: <Icon name="progress_activity" size={18} className="animate-spin text-brand" />,
      }}
      toastOptions={{ className: "font-sans! text-[13.5px]! font-bold! shadow-card-lg!" }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--text)",
          "--normal-border": "var(--line)",
          "--border-radius": "16px",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
