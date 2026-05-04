import { LocalNotifications, type ScheduleResult } from "@capacitor/local-notifications";
import type { Alarm } from "@/types/alarm";

const CHANNEL_ID = "alarm-channel";
const CHANNEL_NAME = "Alarms";

export async function initNotificationChannel() {
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: 5,
      sound: "alarm_sound",
      vibration: true,
      lights: true,
    });
  } catch {
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

export function alarmNotificationId(alarmId: string): number {
  let hash = 0;
  for (let i = 0; i < alarmId.length; i++) {
    hash = (Math.imul(31, hash) + alarmId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 2_000_000_000;
}

export async function scheduleNativeAlarm(alarm: Alarm): Promise<ScheduleResult | null> {
  if (!alarm.enabled || !alarm.nextTriggerAt) return null;
  const notifId = alarmNotificationId(alarm.id);

  await cancelNativeAlarm(alarm.id);

  const at = new Date(alarm.nextTriggerAt);

  const result = await LocalNotifications.schedule({
    notifications: [
      {
        id: notifId,
        title: alarm.label || "CooSnoo Alarm",
        body: formatTime(alarm.hour, alarm.minute),
        channelId: CHANNEL_ID,
        schedule: { at, allowWhileIdle: true },
        sound: "alarm_sound",
        actionTypeId: "ALARM_ACTIONS",
        extra: { alarmId: alarm.id },
        ongoing: true,
        autoCancel: false,
      },
    ],
  });
  return result;
}

export async function cancelNativeAlarm(alarmId: string): Promise<void> {
  const notifId = alarmNotificationId(alarmId);
  try {
    await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
  } catch {
  }
}

export async function cancelAllNativeAlarms(): Promise<void> {
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch {
  }
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m} ${period}`;
}
