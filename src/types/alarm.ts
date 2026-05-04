export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  enabled: boolean;
  label: string;
  days: number[]; // 0=Sun, 1=Mon...6=Sat, empty = one-time
  nextTriggerAt?: number; // epoch ms — set when alarm is armed or snoozed
}

export interface SnoozeButton {
  index: number;
  minutes: number;
}

export interface AppSettings {
  snoozeButtonCount: 2 | 4 | 6;
  snoozeButtons: SnoozeButton[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  snoozeButtonCount: 4,
  snoozeButtons: [
    { index: 0, minutes: 2 },
    { index: 1, minutes: 5 },
    { index: 2, minutes: 10 },
    { index: 3, minutes: 15 },
    { index: 4, minutes: 20 },
    { index: 5, minutes: 30 },
  ],
};
