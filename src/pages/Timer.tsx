import { useState, useEffect, useRef, useCallback } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { RotateCcw } from "lucide-react";

type Phase = "setup" | "running" | "paused" | "done";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

function NumberInput({
  value,
  max,
  label,
  onChange,
}: {
  value: number;
  max: number;
  label: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        className="p-2 text-muted-foreground hover:text-foreground"
        onClick={() => onChange((value + 1) % (max + 1))}
      >
        ▲
      </button>
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Math.max(0, Math.min(max, Number(e.target.value) || 0));
          onChange(v);
        }}
        data-testid={`timer-input-${label}`}
        className="w-20 text-center font-mono-display text-5xl font-light bg-transparent text-foreground border-b-2 border-primary/50 focus:border-primary outline-none py-1"
      />
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
      <button
        className="p-2 text-muted-foreground hover:text-foreground"
        onClick={() => onChange(value === 0 ? max : value - 1)}
      >
        ▼
      </button>
    </div>
  );
}

function ProgressRing({
  radius,
  progress,
}: {
  radius: number;
  progress: number;
}) {
  const stroke = 6;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      className="absolute top-0 left-0 -rotate-90"
    >
      <circle
        stroke="hsl(var(--border))"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="hsl(var(--primary))"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        className="transition-all duration-200"
      />
    </svg>
  );
}

function fmt2(n: number) {
  return String(n).padStart(2, "0");
}

export default function Timer() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [remaining, setRemaining] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      if (endTimeRef.current === null) return;
      const left = Math.max(0, endTimeRef.current - Date.now());
      setRemaining(left);
      if (left === 0) {
        clearTick();
        setPhase("done");
      }
    }, 200);
  }, [clearTick]);

  useEffect(() => () => clearTick(), [clearTick]);

  const handleStart = () => {
    const ms = (hours * 3600 + minutes * 60 + seconds) * 1000;
    if (ms === 0) return;
    setTotalMs(ms);
    setRemaining(ms);
    endTimeRef.current = Date.now() + ms;
    setPhase("running");
    startTick();

    LocalNotifications.schedule({
      notifications: [
        {
          id: 9000001,
          title: "CooSnoo Timer",
          body: "Timer finished!",
          schedule: { at: new Date(Date.now() + ms), allowWhileIdle: true },
          channelId: "alarm-channel",
          sound: "alarm_sound",
        },
      ],
    }).catch(() => {});
  };

  const handlePause = () => {
    clearTick();
    endTimeRef.current = null;
    setPhase("paused");
  };

  const handleResume = () => {
    endTimeRef.current = Date.now() + remaining;
    setPhase("running");
    startTick();
  };

  const handleReset = () => {
    clearTick();
    LocalNotifications.cancel({ notifications: [{ id: 9000001 }] }).catch(() => {});
    setPhase("setup");
    setRemaining(0);
    setTotalMs(0);
    endTimeRef.current = null;
  };

  const progress = totalMs > 0 ? remaining / totalMs : 0;
  const remH = Math.floor(remaining / 3600000);
  const remM = Math.floor((remaining % 3600000) / 60000);
  const remS = Math.floor((remaining % 60000) / 1000);

  const ringSize = 140;

  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-16 px-4">
        <h1 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-12">
          Timer
        </h1>
        <div className="flex items-center gap-2 mb-12">
          <NumberInput value={hours} max={23} label="HH" onChange={setHours} />
          <span className="font-mono-display text-5xl text-muted-foreground mb-6">:</span>
          <NumberInput value={minutes} max={59} label="MM" onChange={setMinutes} />
          <span className="font-mono-display text-5xl text-muted-foreground mb-6">:</span>
          <NumberInput value={seconds} max={59} label="SS" onChange={setSeconds} />
        </div>
        <button
          onClick={handleStart}
          data-testid="timer-start"
          disabled={hours === 0 && minutes === 0 && seconds === 0}
          className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-base disabled:opacity-30 shadow-lg"
        >
          Start
        </button>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-16">
        <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
          <span className="text-5xl">⏰</span>
        </div>
        <h2 className="font-mono-display text-3xl font-light text-foreground mb-2">Time's up!</h2>
        <p className="text-sm text-muted-foreground mb-10">Your timer has finished</p>
        <button
          onClick={handleReset}
          data-testid="timer-dismiss"
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center pb-16 px-4">
      <h1 className="text-sm font-medium text-muted-foreground tracking-widest uppercase mb-12">
        Timer
      </h1>

      <div className="relative mb-14" style={{ width: ringSize * 2, height: ringSize * 2 }}>
        <ProgressRing radius={ringSize} progress={progress} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-display text-5xl font-light text-foreground">
            {remH > 0 ? `${remH}:${fmt2(remM)}:${fmt2(remS)}` : `${fmt2(remM)}:${fmt2(remS)}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={handleReset}
          data-testid="timer-reset"
          className="h-16 w-16 rounded-full border-2 border-border text-muted-foreground flex items-center justify-center hover:bg-secondary"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={phase === "running" ? handlePause : handleResume}
          data-testid="timer-pause-resume"
          className="h-20 w-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold shadow-lg"
        >
          {phase === "running" ? "Pause" : "Resume"}
        </button>

        <div className="h-16 w-16" />
      </div>
    </div>
  );
}
