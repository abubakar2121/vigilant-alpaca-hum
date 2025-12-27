import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // This will now redirect
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage"; // New
import OnboardingPage from "./pages/OnboardingPage"; // New
import DiagnosticPage from "./pages/DiagnosticPage"; // New
import ReportPage from "./pages/ReportPage"; // New
import { ThemeProvider } from "next-themes"; // Import ThemeProvider

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem> {/* Add ThemeProvider */}
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} /> {/* Set LandingPage as default */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/diagnostic" element={<DiagnosticPage />} />
            <Route path="/report" element={<ReportPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;