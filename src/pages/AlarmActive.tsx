import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useAlarms } from "@/hooks/AlarmContext";
import { SnoozeGrid } from "@/components/SnoozeGrid";
import { BellOff, AlarmClock } from "lucide-react";
import { toast } from "sonner";
import { startAlarmSound, stopAlarmSound } from "@/lib/alarmSound";

const AlarmActive = () => {
  const { settings } = useSettings();
  const { id } = useParams<{ id: string }>();
  const { snoozeAlarm, updateAlarm } = useAlarms();
  const navigate = useNavigate();
  const [snoozed, setSnoozed] = useState(false);

  useEffect(() => {
    startAlarmSound();
    return () => stopAlarmSound();
  }, []);

  const handleSnooze = (minutes: number) => {
    stopAlarmSound();
    if (id) {
      snoozeAlarm(id, minutes);
    }
    setSnoozed(true);
    toast.success(`Snoozed for ${minutes} minutes`, {
      description: `Alarm will ring again at ${getSnoozeTime(minutes)}`,
    });
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 1200);
  };

  const handleDismiss = () => {
    stopAlarmSound();
    // Clear the trigger so it doesn't re-fire this minute
    if (id) {
      updateAlarm(id, { nextTriggerAt: undefined });
    }
    toast("Alarm dismissed", { description: "Have a great day!" });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {!snoozed ? (
        <>
          <div className="mb-8 relative">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring">
              <AlarmClock className="h-12 w-12 text-primary" />
            </div>
          </div>

          <h1 className="font-mono-display text-2xl font-semibold text-foreground mb-2">
            Alarm Ringing
          </h1>
          <p className="text-sm text-muted-foreground mb-10">Choose your snooze duration</p>

          <SnoozeGrid settings={settings} onSnooze={handleSnooze} />

          <div className="mt-12 w-full max-w-sm">
            <div className="border-t border-border/50 pt-6">
              <button
                onClick={handleDismiss}
                className="w-full rounded-xl bg-dismiss py-4 px-6 text-dismiss-foreground font-semibold text-base transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                <BellOff className="h-5 w-5" />
                Dismiss Alarm
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <AlarmClock className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl font-medium text-foreground">Snoozed ✓</p>
          <p className="text-sm text-muted-foreground mt-1">Going back to sleep...</p>
        </div>
      )}
    </div>
  );
};

function getSnoozeTime(minutes: number) {
  const d = new Date(Date.now() + minutes * 60000);
  const h = d.getHours() % 12 || 12;
  const m = d.getMinutes().toString().padStart(2, "0");
  const period = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${period}`;
}

export default AlarmActive;
