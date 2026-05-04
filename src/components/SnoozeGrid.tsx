import type { AppSettings } from "@/types/alarm";

interface SnoozeGridProps {
  settings: AppSettings;
  onSnooze: (minutes: number) => void;
}

const SNOOZE_COLORS = [
  "bg-snooze-1",
  "bg-snooze-2",
  "bg-snooze-3",
  "bg-snooze-4",
  "bg-snooze-5",
  "bg-snooze-6",
];

export function SnoozeGrid({ settings, onSnooze }: SnoozeGridProps) {
  const buttons = settings.snoozeButtons.slice(0, settings.snoozeButtonCount);
  const cols = settings.snoozeButtonCount <= 2 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className={`grid ${cols} gap-4 w-full max-w-sm`}>
      {buttons.map((btn, i) => (
        <button
          key={btn.index}
          onClick={() => onSnooze(btn.minutes)}
          className={`${SNOOZE_COLORS[i]} rounded-xl py-6 px-4 text-primary-foreground font-semibold text-lg transition-transform active:scale-95 hover:brightness-110 shadow-lg`}
        >
          <span className="font-mono-display text-3xl font-bold block">
            {btn.minutes}
          </span>
          <span className="text-sm opacity-80 mt-1 block">min</span>
        </button>
      ))}
    </div>
  );
}
