import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Alarm } from "@/types/alarm";
import {
  scheduleNativeAlarm,
  cancelNativeAlarm,
  initNotificationChannel,
  requestNotificationPermission,
} from "@/lib/nativeAlarm";
import { updateHomeWidget, formatNextAlarmText } from "@/lib/widgetBridge";

const STORAGE_KEY = "snooze-grid-alarms";

function loadAlarms(): Alarm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function armAlarm(alarm: Alarm): Alarm {
  const now = new Date();
  const target = new Date();
  target.setHours(alarm.hour, alarm.minute, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return { ...alarm, nextTriggerAt: target.getTime() };
}

interface AlarmContextValue {
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, "id">) => void;
  updateAlarm: (id: string, updates: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  snoozeAlarm: (id: string, minutes: number) => void;
}

const AlarmContext = createContext<AlarmContextValue | null>(null);

export function AlarmProvider({ children }: { children: ReactNode }) {
  const [alarms, setAlarms] = useState<Alarm[]>(loadAlarms);

  useEffect(() => {
    initNotificationChannel();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    updateHomeWidget(formatNextAlarmText(alarms));
  }, [alarms]);

  const addAlarm = useCallback((alarm: Omit<Alarm, "id">) => {
    const newAlarm: Alarm = { ...alarm, id: crypto.randomUUID() };
    const armed = armAlarm(newAlarm);
    setAlarms((prev) => [...prev, armed]);
    scheduleNativeAlarm(armed);
  }, []);

  const updateAlarm = useCallback((id: string, updates: Partial<Alarm>) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, ...updates };
        let final = updated;
        if (updates.hour !== undefined || updates.minute !== undefined) {
          final = armAlarm(updated);
        }
        if (final.enabled && final.nextTriggerAt) {
          scheduleNativeAlarm(final);
        } else {
          cancelNativeAlarm(id);
        }
        return final;
      })
    );
  }, []);

  const snoozeAlarm = useCallback((id: string, minutes: number) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const snoozed: Alarm = {
          ...a,
          nextTriggerAt: Date.now() + minutes * 60000,
          enabled: true,
        };
        scheduleNativeAlarm(snoozed);
        return snoozed;
      })
    );
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    cancelNativeAlarm(id);
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const toggled = { ...a, enabled: !a.enabled };
        const final = toggled.enabled ? armAlarm(toggled) : toggled;
        if (final.enabled) {
          scheduleNativeAlarm(final);
        } else {
          cancelNativeAlarm(id);
        }
        return final;
      })
    );
  }, []);

  return (
    <AlarmContext.Provider value={{ alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, snoozeAlarm }}>
      {children}
    </AlarmContext.Provider>
  );
}

export function useAlarms() {
  const ctx = useContext(AlarmContext);
  if (!ctx) throw new Error("useAlarms must be used within AlarmProvider");
  return ctx;
}
