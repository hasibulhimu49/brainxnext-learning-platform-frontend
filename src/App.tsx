import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";
import LogoutListener from "@/components/common/LogoutListener";
import ScrollToTop from "@/components/common/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";
import { createQueryClient } from "@/lib/queryClient";
import AppRoutes from "@/routes/AppRoutes";
import "@/stores/uiStore"; // applies the persisted theme before the first render

const App = () => {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <LogoutListener />
        <AppErrorBoundary>
          <AppRoutes />
        </AppErrorBoundary>
        <Toaster />
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="bottom-left" />}
    </QueryClientProvider>
  );
};

export default App;
