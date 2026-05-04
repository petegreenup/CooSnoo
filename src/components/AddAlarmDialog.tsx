import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { TimeInput } from "@/components/TimeInput";
import type { Alarm } from "@/types/alarm";

interface AddAlarmDialogProps {
  onAdd: (alarm: Omit<Alarm, "id">) => void;
}

export function AddAlarmDialog({ onAdd }: AddAlarmDialogProps) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);
  const [label, setLabel] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const handleSave = () => {
    const h24 = period === "PM" ? (hour % 12) + 12 : hour % 12;
    onAdd({
      hour: h24,
      minute,
      enabled: true,
      label,
      days: [],
    });
    setLabel("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full gap-2 px-6">
          <Plus className="h-5 w-5" />
          Add Alarm
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-xs" aria-describedby="add-alarm-desc">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Alarm</DialogTitle>
          <DialogDescription id="add-alarm-desc" className="text-muted-foreground text-xs">
            Set your alarm time and label
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="py-4">
            <TimeInput
              hour={hour}
              minute={minute}
              period={period}
              onChange={(h, m, p) => { setHour(h); setMinute(m); setPeriod(p); }}
              size="md"
            />
            
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Label (optional)</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Work, Gym..."
              className="bg-secondary border-border text-foreground"
            />
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            Save Alarm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
