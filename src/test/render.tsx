import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Stub from "./Stub";

interface Options extends Omit<RenderOptions, "wrapper"> {
  /** initial URL, e.g. "/courses/java-generics" */
  route?: string;
  /** route pattern the element is mounted at, e.g. "/courses/:courseId" */
  path?: string;
  /** extra paths that render a "Stub: <path> <url>" marker, to assert where a redirect went */
  stubs?: string[];
}

/** Render a page with a fresh QueryClient (no retries) and a router. */
export function renderWithProviders(ui: ReactElement, { route = "/", path = "*", stubs = [], ...options }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={children} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
          {stubs.map((s) => (
            <Route key={s} path={s} element={<Stub name={s} />} />
          ))}
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
