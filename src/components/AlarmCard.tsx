import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Clock, Trash2 } from "lucide-react";
import type { Alarm } from "@/types/alarm";

interface AlarmCardProps {
  alarm: Alarm;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatTime(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, "0");
  return { time: `${h}:${m}`, period };
}

function isSnoozed(alarm: Alarm): string | null {
  if (!alarm.enabled || !alarm.nextTriggerAt) return null;
  const scheduled = new Date();
  scheduled.setHours(alarm.hour, alarm.minute, 0, 0);
  if (scheduled.getTime() <= Date.now()) scheduled.setDate(scheduled.getDate() + 1);
  if (Math.abs(alarm.nextTriggerAt - scheduled.getTime()) < 60000) return null;

  const d = new Date(alarm.nextTriggerAt);
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  const p = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${p}`;
}

export function AlarmCard({ alarm, onToggle, onDelete }: AlarmCardProps) {
  const { time, period } = formatTime(alarm.hour, alarm.minute);
  const navigate = useNavigate();
  const snoozeUntil = isSnoozed(alarm);
  const isEnabled = alarm.enabled;

  return (
    <div
      onClick={() => navigate(`/alarm/${alarm.id}/edit`)}
      className={`flex items-center justify-between rounded-lg border px-5 py-4 transition-all cursor-pointer ${
        isEnabled
          ? "border-primary/30 bg-card hover:bg-secondary/50"
          : "border-border bg-secondary/40 hover:bg-secondary/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <Clock className={`h-5 w-5 ${isEnabled ? "text-muted-foreground" : "text-foreground/70"}`} />
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-mono-display text-3xl font-light tracking-tight ${
                isEnabled ? "text-foreground" : "text-foreground/85"
              }`}
            >
              {time}
            </span>
            <span className={`text-sm font-medium ${isEnabled ? "text-muted-foreground" : "text-foreground/65"}`}>
              {period}
            </span>
          </div>
          {alarm.label && (
            <p className={`mt-0.5 text-xs ${isEnabled ? "text-muted-foreground" : "text-foreground/60"}`}>
              {alarm.label}
            </p>
          )}
          {snoozeUntil && (
            <p className="mt-0.5 text-xs font-medium text-primary/80">Snoozed until {snoozeUntil}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onDelete(alarm.id)}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
        <Switch
          checked={alarm.enabled}
          onCheckedChange={() => onToggle(alarm.id)}
          className="shrink-0 data-[state=unchecked]:border-border"
        />
      </div>
    </div>
  );
}

