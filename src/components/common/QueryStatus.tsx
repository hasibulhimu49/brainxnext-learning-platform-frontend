import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { errorMessage } from "@/api/envelope";
import { Button } from "@/components/ui/button";
import Icon from "./Icon";

export const LoadingState = ({ label = "Loading…", className = "" }: { label?: string; className?: string }) => (
  <div
    role="status"
    aria-live="polite"
    className={`flex items-center justify-center gap-2.5 py-16 text-[13.5px] font-bold text-soft ${className}`}
  >
    <Icon name="progress_activity" size={20} className="animate-spin text-brand" />
    {label}
  </div>
);

export const ErrorState = ({ error, onRetry, className = "" }: { error: unknown; onRetry?: () => void; className?: string }) => (
  <div role="alert" className={`flex flex-col items-center gap-3 py-14 text-center ${className}`}>
    <Icon name="cloud_off" size={34} className="text-soft" />
    <span className="text-[14px] font-bold text-muted">{errorMessage(error)}</span>
    {onRetry && (
      <Button variant="outline" size="md" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

interface QueryStatusProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  loading?: ReactNode;
  className?: string;
}

/** Render loading / error / data for a TanStack query in one place. */
export function QueryStatus<T>({ query, children, loading, className }: QueryStatusProps<T>) {
  if (query.isPending) return <>{loading ?? <LoadingState className={className} />}</>;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} className={className} />;
  return <>{children(query.data)}</>;
}
