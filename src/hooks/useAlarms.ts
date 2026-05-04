import { useState, useEffect, useCallback } from "react";
import type { Alarm } from "@/types/alarm";

const STORAGE_KEY = "snooze-grid-alarms";

function loadAlarms(): Alarm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Compute next trigger timestamp for an alarm based on its hour/minute */
export function armAlarm(alarm: Alarm): Alarm {
  const now = new Date();
  const target = new Date();
  target.setHours(alarm.hour, alarm.minute, 0, 0);
  // If the time already passed today, schedule for tomorrow
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 1);
  }
  return { ...alarm, nextTriggerAt: target.getTime() };
}

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>(loadAlarms);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  const addAlarm = useCallback((alarm: Omit<Alarm, "id">) => {
    const newAlarm: Alarm = { ...alarm, id: crypto.randomUUID() };
    setAlarms((prev) => [...prev, armAlarm(newAlarm)]);
  }, []);

  const updateAlarm = useCallback((id: string, updates: Partial<Alarm>) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, ...updates };
        // Re-arm if time changed
        if (updates.hour !== undefined || updates.minute !== undefined) {
          return armAlarm(updated);
        }
        return updated;
      })
    );
  }, []);

  const snoozeAlarm = useCallback((id: string, minutes: number) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, nextTriggerAt: Date.now() + minutes * 60000, enabled: true }
          : a
      )
    );
  }, []);

  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const toggled = { ...a, enabled: !a.enabled };
        return toggled.enabled ? armAlarm(toggled) : toggled;
      })
    );
  }, []);

  return { alarms, addAlarm, updateAlarm, deleteAlarm, toggleAlarm, snoozeAlarm };
}
