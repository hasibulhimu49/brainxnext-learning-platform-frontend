import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ServerError from "@/pages/errors/ServerError";

interface BoundaryProps {
  /** changing this (the current path) clears a caught error */
  resetKey: string;
  children: ReactNode;
}

interface BoundaryState {
  error: unknown;
  key: string;
}

class Boundary extends Component<BoundaryProps, BoundaryState> {
  override state: BoundaryState = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { error };
  }

  static getDerivedStateFromProps(props: BoundaryProps, state: BoundaryState): Partial<BoundaryState> | null {
    // navigating away from a crashed screen shows the new screen again
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Unhandled UI error", error, info.componentStack);
  }

  override render() {
    if (this.state.error) return <ServerError onRetry={() => this.setState({ error: null })} />;
    return this.props.children;
  }
}

/** Catches render errors in any route, shows the 500 page and resets when the URL changes. */
const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return <Boundary resetKey={pathname}>{children}</Boundary>;
};

export default AppErrorBoundary;
