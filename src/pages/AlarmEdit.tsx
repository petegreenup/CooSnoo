import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlarms } from "@/hooks/AlarmContext";
import { TimeInput } from "@/components/TimeInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2 } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const AlarmEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { alarms, updateAlarm, deleteAlarm } = useAlarms();
  const navigate = useNavigate();
  const alarm = alarms.find((a) => a.id === id);

  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [label, setLabel] = useState("");
  const [days, setDays] = useState<number[]>([]);

  useEffect(() => {
    if (!alarm) return;
    const h12 = alarm.hour % 12 || 12;
    setHour(h12);
    setMinute(alarm.minute);
    setPeriod(alarm.hour >= 12 ? "PM" : "AM");
    setLabel(alarm.label);
    setDays(alarm.days);
  }, [alarm]);

  if (!alarm) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Alarm not found</p>
      </div>
    );
  }

  const handleSave = () => {
    const h24 = period === "PM" ? (hour % 12) + 12 : hour % 12;
    const timeChanged = h24 !== alarm.hour || minute !== alarm.minute;
    if (timeChanged) {
      updateAlarm(alarm.id, { hour: h24, minute, label, days });
    } else {
      // Only update non-time fields — preserve snooze nextTriggerAt
      updateAlarm(alarm.id, { label, days });
    }
    navigate("/");
  };

  const handleDelete = () => {
    deleteAlarm(alarm.id);
    navigate("/");
  };

  const toggleDay = (day: number) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-foreground">Edit Alarm</h1>
          </div>
          <button
            onClick={handleDelete}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-card border border-border py-8 px-4">
            <TimeInput
              hour={hour}
              minute={minute}
              period={period}
              onChange={(h, m, p) => { setHour(h); setMinute(m); setPeriod(p); }}
              size="lg"
            />
            
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2">
            <Label className="text-muted-foreground">Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Work, Gym..."
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <Label className="text-muted-foreground text-sm">Repeat</Label>
            <div className="flex gap-2 mt-3">
              {DAYS.map((name, i) => (
                <button
                  key={i}
                  onClick={() => toggleDay(i)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    days.includes(i)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {days.length === 0 ? "One-time alarm" : "Repeats on selected days"}
            </p>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlarmEdit;
