import { useState, useEffect, useRef, useCallback } from "react";
import { Flag, RotateCcw } from "lucide-react";

interface Lap {
  index: number;
  elapsed: number;
  split: number;
}

function formatTime(ms: number, compact = false): string {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const sec = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const min = totalMin % 60;
  const hr = Math.floor(totalMin / 60);

  if (compact) {
    if (hr > 0) return `${hr}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  if (hr > 0) {
    return `${hr}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  }
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

export default function Stopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [laps, setLaps] = useState<Lap[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const elapsedAtPauseRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    if (startTimeRef.current !== null) {
      setElapsed(elapsedAtPauseRef.current + (Date.now() - startTimeRef.current));
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (startTimeRef.current !== null) {
        elapsedAtPauseRef.current += Date.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, tick]);

  const handleStartStop = () => setRunning((r) => !r);

  const handleLap = () => {
    const lastLapElapsed = laps[0]?.elapsed ?? 0;
    setLaps((prev) => [
      {
        index: prev.length + 1,
        elapsed,
        split: elapsed - lastLapElapsed,
      },
      ...prev,
    ]);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setLaps([]);
    elapsedAtPauseRef.current = 0;
    startTimeRef.current = null;
  };

  const displayStr = formatTime(elapsed);
  const [mainPart, csPart] = displayStr.includes(".")
    ? displayStr.split(".")
    : [displayStr, "00"];

  const fastestLap = laps.length > 1 ? Math.min(...laps.map((l) => l.split)) : null;
  const slowestLap = laps.length > 1 ? Math.max(...laps.map((l) => l.split)) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      <div className="px-4 pt-10 pb-4 text-center">
        <h1 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-8">
          Stopwatch
        </h1>

        <div className="mb-10 flex items-baseline justify-center gap-1">
          <span className="font-mono-display text-7xl font-light tracking-tight text-foreground">
            {mainPart}
          </span>
          <span className="font-mono-display text-3xl font-light text-muted-foreground w-12 text-left">
            .{csPart}
          </span>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button
            onClick={running ? handleLap : handleReset}
            data-testid="stopwatch-lap-reset"
            disabled={!running && elapsed === 0}
            className={`h-16 w-16 rounded-full border-2 flex items-center justify-center transition-all ${
              !running && elapsed === 0
                ? "border-border text-muted-foreground/30 cursor-not-allowed"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {running ? (
              <Flag className="h-5 w-5" />
            ) : (
              <RotateCcw className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={handleStartStop}
            data-testid="stopwatch-start-stop"
            className={`h-20 w-20 rounded-full flex items-center justify-center text-sm font-semibold transition-all shadow-lg ${
              running
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {running ? "Stop" : elapsed > 0 ? "Resume" : "Start"}
          </button>

          <div className="h-16 w-16" />
        </div>
      </div>

      {laps.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 mt-2">
          <div className="border-t border-border/50 pt-3 space-y-0.5">
            {laps.map((lap) => {
              const isFastest = fastestLap !== null && lap.split === fastestLap;
              const isSlowest = slowestLap !== null && lap.split === slowestLap;
              return (
                <div
                  key={lap.index}
                  className="flex items-center justify-between py-2.5 border-b border-border/30"
                >
                  <span
                    className={`text-sm font-medium ${
                      isFastest
                        ? "text-primary"
                        : isSlowest
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    Lap {lap.index}
                  </span>
                  <div className="flex gap-6">
                    <span className={`font-mono-display text-sm ${isFastest ? "text-primary" : isSlowest ? "text-destructive" : "text-muted-foreground"}`}>
                      {formatTime(lap.split, false)}
                    </span>
                    <span className="font-mono-display text-sm text-foreground w-24 text-right">
                      {formatTime(lap.elapsed, false)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
