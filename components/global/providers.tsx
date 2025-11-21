import { BrowserRouter as Router, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="w-full h-full bg-transparent">
          <Routes>{children}</Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};
