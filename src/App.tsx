import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlarmProvider } from "@/hooks/AlarmContext";
import { BottomTabBar } from "@/components/BottomTabBar";
import Index from "./pages/Index.tsx";
import AlarmActive from "./pages/AlarmActive.tsx";
import AlarmEdit from "./pages/AlarmEdit.tsx";
import SettingsPage from "./pages/Settings.tsx";
import WorldClock from "./pages/WorldClock.tsx";
import Timer from "./pages/Timer.tsx";
import Stopwatch from "./pages/Stopwatch.tsx";
import NotFound from "./pages/NotFound.tsx";

const TABBED = ["/", "/world-clock", "/timer", "/stopwatch"];

function Layout() {
  const location = useLocation();
  const showTabs = TABBED.includes(location.pathname);
  return (
    <>
      <div className={showTabs ? "pb-16" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/world-clock" element={<WorldClock />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/stopwatch" element={<Stopwatch />} />
          <Route path="/alarm-active/:id" element={<AlarmActive />} />
          <Route path="/alarm/:id/edit" element={<AlarmEdit />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {showTabs && <BottomTabBar />}
    </>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AlarmProvider>
          <Layout />
        </AlarmProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
