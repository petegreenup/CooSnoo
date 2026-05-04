import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  hour: number;
  minute: number;
  period: "AM" | "PM";
  onChange: (hour: number, minute: number, period: "AM" | "PM") => void;
  size?: "lg" | "md";
}

type Mode = "hour" | "minute";

export function TimeInput({ hour, minute, period, onChange, size = "lg" }: TimeInputProps) {
  const [mode, setMode] = useState<Mode>("hour");
  const dialRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  const dialSize = size === "lg" ? 280 : 240;
  const center = dialSize / 2;
  const radius = center - 28;

  const getAngleFromEvent = useCallback((e: React.PointerEvent | PointerEvent) => {
    const svg = dialRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    let angle = Math.atan2(x, -y) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }, [center]);

  const snapHour = useCallback((angle: number) => {
    const h = Math.round(angle / 30) % 12;
    return h === 0 ? 12 : h;
  }, []);

  const snapMinute = useCallback((angle: number) => {
    return Math.round(angle / 6) % 60;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const angle = getAngleFromEvent(e);
    if (angle === null) return;
    if (mode === "hour") {
      onChange(snapHour(angle), minute, period);
    } else {
      onChange(hour, snapMinute(angle), period);
    }
  }, [mode, hour, minute, period, onChange, getAngleFromEvent, snapHour, snapMinute]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const angle = getAngleFromEvent(e);
    if (angle === null) return;
    if (mode === "hour") {
      onChange(snapHour(angle), minute, period);
    } else {
      onChange(hour, snapMinute(angle), period);
    }
  }, [mode, hour, minute, period, onChange, getAngleFromEvent, snapHour, snapMinute]);

  const handlePointerUp = useCallback(() => {
    if (isDragging.current && mode === "hour") {
      isDragging.current = false;
      setMode("minute");
    } else {
      isDragging.current = false;
    }
  }, [mode]);

  // Current hand angle
  const handAngle = mode === "hour"
    ? ((hour % 12) / 12) * 360
    : (minute / 60) * 360;

  const handX = center + radius * 0.78 * Math.sin((handAngle * Math.PI) / 180);
  const handY = center - radius * 0.78 * Math.cos((handAngle * Math.PI) / 180);

  // Hour numbers
  const hourNumbers = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const angle = (num / 12) * 360;
    const r = radius * 0.82;
    const x = center + r * Math.sin((angle * Math.PI) / 180);
    const y = center - r * Math.cos((angle * Math.PI) / 180);
    return { num, x, y, angle };
  });

  // Minute numbers (every 5)
  const minuteNumbers = Array.from({ length: 12 }, (_, i) => {
    const num = i * 5;
    const angle = (num / 60) * 360;
    const r = radius * 0.82;
    const x = center + r * Math.sin((angle * Math.PI) / 180);
    const y = center - r * Math.cos((angle * Math.PI) / 180);
    return { num, x, y, angle };
  });

  const numbers = mode === "hour" ? hourNumbers : minuteNumbers;
  const activeVal = mode === "hour" ? hour : minute;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Top: digital readout + AM/PM */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMode("hour")}
          className={cn(
            "font-mono-display tabular-nums transition-colors rounded-lg px-2 py-1",
            size === "lg" ? "text-5xl" : "text-4xl",
            mode === "hour"
              ? "text-primary font-semibold"
              : "text-muted-foreground font-light hover:text-foreground"
          )}
        >
          {String(hour).padStart(2, "0")}
        </button>
        <span className={cn(
          "font-mono-display text-muted-foreground select-none",
          size === "lg" ? "text-5xl" : "text-4xl"
        )}>:</span>
        <button
          type="button"
          onClick={() => setMode("minute")}
          className={cn(
            "font-mono-display tabular-nums transition-colors rounded-lg px-2 py-1",
            size === "lg" ? "text-5xl" : "text-4xl",
            mode === "minute"
              ? "text-primary font-semibold"
              : "text-muted-foreground font-light hover:text-foreground"
          )}
        >
          {String(minute).padStart(2, "0")}
        </button>

        {/* AM/PM */}
        <div className="flex flex-col gap-1 ml-2">
          <button
            type="button"
            onClick={() => onChange(hour, minute, "AM")}
            className={cn(
              "rounded-md text-xs font-bold px-2.5 py-1 transition-colors",
              period === "AM"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => onChange(hour, minute, "PM")}
            className={cn(
              "rounded-md text-xs font-bold px-2.5 py-1 transition-colors",
              period === "PM"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock face */}
      <svg
        ref={dialRef}
        width={dialSize}
        height={dialSize}
        viewBox={`0 0 ${dialSize} ${dialSize}`}
        className="touch-none select-none cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Background circle */}
        <circle cx={center} cy={center} r={center - 4} className="fill-secondary" />

        {/* Center dot */}
        <circle cx={center} cy={center} r={4} className="fill-primary" />

        {/* Hand line */}
        <line
          x1={center}
          y1={center}
          x2={handX}
          y2={handY}
          className="stroke-primary"
          strokeWidth={2}
        />

        {/* Hand endpoint dot */}
        <circle
          cx={handX}
          cy={handY}
          r={20}
          className="fill-primary opacity-90"
        />

        {/* Numbers */}
        {numbers.map(({ num, x, y }) => {
          const isActive = mode === "hour"
            ? num === activeVal
            : num === activeVal || (activeVal % 5 !== 0 && Math.abs(num - activeVal) < 3);
          const exactActive = mode === "hour" ? num === activeVal : num === activeVal;
          return (
            <text
              key={num}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              className={cn(
                "text-sm font-semibold pointer-events-none select-none",
                exactActive ? "fill-primary-foreground" : "fill-foreground"
              )}
            >
              {mode === "minute" && num === 0 ? "00" : String(num)}
            </text>
          );
        })}

        {/* Tick marks for minutes */}
        {mode === "minute" && Array.from({ length: 60 }, (_, i) => {
          if (i % 5 === 0) return null;
          const angle = (i / 60) * 360;
          const r1 = radius * 0.92;
          const r2 = radius * 0.96;
          const x1 = center + r1 * Math.sin((angle * Math.PI) / 180);
          const y1 = center - r1 * Math.cos((angle * Math.PI) / 180);
          const x2 = center + r2 * Math.sin((angle * Math.PI) / 180);
          const y2 = center - r2 * Math.cos((angle * Math.PI) / 180);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="stroke-muted-foreground/30"
              strokeWidth={1}
            />
          );
        })}
      </svg>
    </div>
  );
}
