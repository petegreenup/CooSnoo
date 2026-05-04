import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Alarm } from "@/types/alarm";

export function useAlarmRunner(alarms: Alarm[]) {
  const navigate = useNavigate();
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const handle = LocalNotifications.addListener(
      "localNotificationReceived",
      (notification) => {
        const alarmId: string | undefined = notification.extra?.alarmId;
        if (alarmId) {
          navigate(`/alarm-active/${alarmId}`);
        }
      }
    );

    const actionHandle = LocalNotifications.addListener(
      "localNotificationActionPerformed",
      (action) => {
        const alarmId: string | undefined = action.notification.extra?.alarmId;
        if (alarmId) {
          navigate(`/alarm-active/${alarmId}`);
        }
      }
    );

    return () => {
      handle.then((h) => h.remove());
      actionHandle.then((h) => h.remove());
    };
  }, [navigate]);

  useEffect(() => {
    const check = () => {
      const now = Date.now();
      for (const alarm of alarms) {
        if (!alarm.enabled || !alarm.nextTriggerAt) continue;
        if (now < alarm.nextTriggerAt) continue;

        const key = `${alarm.id}-${alarm.nextTriggerAt}`;
        if (firedRef.current.has(key)) continue;

        firedRef.current.add(key);
        if (firedRef.current.size > 200) {
          firedRef.current.clear();
          firedRef.current.add(key);
        }

        navigate(`/alarm-active/${alarm.id}`);
        return;
      }
    };

    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [alarms, navigate]);
}
