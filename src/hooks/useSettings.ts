import { useState, useEffect, useCallback } from "react";
import type { AppSettings } from "@/types/alarm";
import { DEFAULT_SETTINGS } from "@/types/alarm";

const STORAGE_KEY = "snooze-grid-settings";

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AppSettings> | AppSettings) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateSnoozeMinutes = useCallback((index: number, minutes: number) => {
    setSettings((prev) => ({
      ...prev,
      snoozeButtons: prev.snoozeButtons.map((b) =>
        b.index === index ? { ...b, minutes } : b
      ),
    }));
  }, []);

  return { settings, updateSettings, updateSnoozeMinutes };
}
