import { useLocation, useNavigate } from "react-router-dom";
import { AlarmClock, Globe, Timer, Watch } from "lucide-react";

const TABS = [
  { path: "/", label: "Alarms", Icon: AlarmClock },
  { path: "/world-clock", label: "World", Icon: Globe },
  { path: "/timer", label: "Timer", Icon: Timer },
  { path: "/stopwatch", label: "Stopwatch", Icon: Watch },
] as const;

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-stretch justify-around h-16 max-w-md mx-auto">
        {TABS.map(({ path, label, Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              data-testid={`tab-${label.toLowerCase()}`}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 pt-1 pb-2 transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 transition-all ${active ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 h-0.5 w-10 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
