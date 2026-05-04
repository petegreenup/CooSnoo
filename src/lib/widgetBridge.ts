import { registerPlugin } from "@capacitor/core";

interface AlarmWidgetPlugin {
  updateWidget(options: { nextAlarmText: string }): Promise<void>;
}

const AlarmWidget = registerPlugin<AlarmWidgetPlugin>("AlarmWidget", {
  web: {
    async updateWidget(_options: { nextAlarmText: string }) {
    },
  },
});

export async function updateHomeWidget(nextAlarmText: string): Promise<void> {
  try {
    await AlarmWidget.updateWidget({ nextAlarmText });
  } catch {
  }
}

export function formatNextAlarmText(alarms: { hour: number; minute: number; enabled: boolean; label: string; nextTriggerAt?: number }[]): string {
  const active = alarms
    .filter((a) => a.enabled && a.nextTriggerAt)
    .sort((a, b) => (a.nextTriggerAt ?? 0) - (b.nextTriggerAt ?? 0));

  if (active.length === 0) return "No alarm";

  const next = active[0];
  const h = next.hour % 12 || 12;
  const m = String(next.minute).padStart(2, "0");
  const period = next.hour >= 12 ? "PM" : "AM";
  const label = next.label ? ` · ${next.label}` : "";
  return `${h}:${m} ${period}${label}`;
}
