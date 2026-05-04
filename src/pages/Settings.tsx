import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();
  const navigate = useNavigate();

  // Draft state — edits happen here, not saved until "Save"
  const [draft, setDraft] = useState(() => structuredClone(settings));
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const hasChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(settings),
    [draft, settings]
  );

  const handleSave = () => {
    updateSettings(draft);
    setTimeout(() => navigate("/"), 50);
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true);
    } else {
      navigate("/");
    }
  };

  const updateDraftSnoozeMinutes = (index: number, minutes: number) => {
    setDraft((prev) => ({
      ...prev,
      snoozeButtons: prev.snoozeButtons.map((b) =>
        b.index === index ? { ...b, minutes } : b
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={handleBack}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>

        {/* Snooze Button Count */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <Label className="text-sm font-medium text-foreground">
              Number of Snooze Buttons
            </Label>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              How many snooze options to show when alarm rings
            </p>
            <Select
              value={String(draft.snoozeButtonCount)}
              onValueChange={(v) =>
                setDraft((prev) => ({ ...prev, snoozeButtonCount: Number(v) as 2 | 4 | 6 }))
              }
            >
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 buttons</SelectItem>
                <SelectItem value="4">4 buttons</SelectItem>
                <SelectItem value="6">6 buttons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Snooze Durations */}
          <div className="rounded-lg border border-border bg-card p-5">
            <Label className="text-sm font-medium text-foreground">
              Snooze Durations
            </Label>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Set minutes for each snooze button
            </p>
            <div className="grid grid-cols-2 gap-3">
              {draft.snoozeButtons
                .slice(0, draft.snoozeButtonCount)
                .map((btn, i) => (
                  <div key={btn.index} className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Button {i + 1}
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={120}
                        value={btn.minutes}
                        onChange={(e) =>
                          updateDraftSnoozeMinutes(btn.index, Number(e.target.value) || 1)
                        }
                        className="bg-secondary border-border text-foreground font-mono-display"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        min
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            Save Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            size="lg"
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="bg-card border-border max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              If you go back your changes will be lost. Please use the Save Settings button to keep them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              type="button"
              onClick={() => { setShowUnsavedDialog(false); handleSave(); }}
              className="w-full"
            >
              Save Settings
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowUnsavedDialog(false);
                navigate("/");
              }}
            >
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsPage;
