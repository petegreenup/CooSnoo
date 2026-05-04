import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hour: number; // 1-12
  minute: number; // 0-59
  period: "AM" | "PM";
  onConfirm: (hour: number, minute: number, period: "AM" | "PM") => void;
}

function ScrollPicker({
  items,
  value,
  onChange,
  formatItem,
}: {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem?: (v: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 48;
  const fmt = formatItem ?? ((v) => String(v).padStart(2, "0"));

  useEffect(() => {
    const idx = items.indexOf(value);
    if (idx >= 0 && containerRef.current) {
      containerRef.current.scrollTop = idx * itemHeight;
    }
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const idx = Math.round(scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    if (items[clamped] !== value) {
      onChange(items[clamped]);
    }
  };

  return (
    <div className="relative h-[192px] overflow-hidden">
      {/* Selection highlight */}
      <div className="absolute top-[72px] left-0 right-0 h-[48px] rounded-lg bg-primary/20 border border-primary/30 pointer-events-none z-10" />
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-[72px] bg-gradient-to-b from-card to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 left-0 right-0 h-[72px] bg-gradient-to-t from-card to-transparent pointer-events-none z-20" />
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory", paddingTop: 72, paddingBottom: 72 }}
      >
        {items.map((item) => (
          <button
            key={item}
            onClick={() => {
              onChange(item);
              if (containerRef.current) {
                const idx = items.indexOf(item);
                containerRef.current.scrollTo({ top: idx * itemHeight, behavior: "smooth" });
              }
            }}
            className={cn(
              "w-full h-[48px] flex items-center justify-center font-mono-display text-2xl snap-center transition-colors",
              item === value ? "text-foreground font-medium" : "text-muted-foreground/50"
            )}
            style={{ scrollSnapAlign: "center" }}
          >
            {fmt(item)}
          </button>
        ))}
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

export function TimePicker({ open, onOpenChange, hour, minute, period, onConfirm }: TimePickerProps) {
  const [h, setH] = useState(hour);
  const [m, setM] = useState(minute);
  const [p, setP] = useState(period);

  useEffect(() => {
    if (open) {
      setH(hour);
      setM(minute);
      setP(period);
    }
  }, [open, hour, minute, period]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-xs" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-foreground text-center">Set Time</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center gap-1 py-2">
          <div className="w-20">
            <ScrollPicker items={HOURS} value={h} onChange={setH} />
          </div>
          <span className="font-mono-display text-3xl text-muted-foreground">:</span>
          <div className="w-20">
            <ScrollPicker items={MINUTES} value={m} onChange={setM} />
          </div>
          <div className="flex flex-col gap-2 ml-3">
            <button
              onClick={() => setP("AM")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                p === "AM"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              AM
            </button>
            <button
              onClick={() => setP("PM")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                p === "PM"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              PM
            </button>
          </div>
        </div>
        <div className="text-center text-muted-foreground text-sm mb-2">
          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")} {p}
        </div>
        <Button
          onClick={() => {
            onConfirm(h, m, p);
            onOpenChange(false);
          }}
          className="w-full"
          size="lg"
        >
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  );
}
