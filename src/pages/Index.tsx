import { useState, useEffect } from "react";
import { useAlarms } from "@/hooks/AlarmContext";
import { useAlarmRunner } from "@/hooks/useAlarmRunner";
import { AlarmCard } from "@/components/AlarmCard";
import { AddAlarmDialog } from "@/components/AddAlarmDialog";
import { AlarmClock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm } = useAlarms();
  const navigate = useNavigate();
  useAlarmRunner(alarms);

  const nextAlarm = alarms
    .filter((a) => a.enabled && a.nextTriggerAt)
    .sort((a, b) => (a.nextTriggerAt ?? 0) - (b.nextTriggerAt ?? 0))[0];

  return (
    <div className="min-h-screen bg-background px-4 pt-10 pb-4">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
            Alarms
          </h1>
          <button
            onClick={() => navigate("/settings")}
            data-testid="settings-button"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Current Time */}
        <div className="mb-2 text-center">
          <CurrentTime />
        </div>

        {/* Next alarm label */}
        <div className="mb-8 text-center">
          {nextAlarm ? (
            <p className="text-xs text-primary/80 font-medium">
              ⏰ Next alarm at{" "}
              {(() => {
                const h = nextAlarm.hour % 12 || 12;
                const m = String(nextAlarm.minute).padStart(2, "0");
                const p = nextAlarm.hour >= 12 ? "PM" : "AM";
                return `${h}:${m} ${p}${nextAlarm.label ? ` · ${nextAlarm.label}` : ""}`;
              })()}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/50">No active alarms</p>
          )}
        </div>

        {/* Alarms */}
        <div className="space-y-3 mb-8">
          {alarms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 py-12 text-center">
              <AlarmClock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No alarms set</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Tap the button below to add one
              </p>
            </div>
          ) : (
            alarms.map((alarm) => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onToggle={toggleAlarm}
                onDelete={deleteAlarm}
              />
            ))
          )}
        </div>

        {/* Add button */}
        <div className="flex justify-center">
          <AddAlarmDialog onAdd={addAlarm} />
        </div>
      </div>
    </div>
  );
};

function CurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const h = time.getHours() % 12 || 12;
  const m = time.getMinutes().toString().padStart(2, "0");
  const s = time.getSeconds().toString().padStart(2, "0");
  const period = time.getHours() >= 12 ? "PM" : "AM";
  const dateStr = time.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{dateStr}</p>
      <div>
        <span className="font-mono-display text-6xl font-light tracking-tight text-foreground">
          {h}:{m}
        </span>
        <span className="font-mono-display text-2xl font-light text-muted-foreground ml-1">
          :{s}
        </span>
        <span className="ml-2 text-lg text-muted-foreground">{period}</span>
      </div>
    </div>
  );
}

export default Index;
