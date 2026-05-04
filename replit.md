# CooSnoo - Customizable Snooze Alarm Clock

## Overview
A React/Vite alarm clock app with customizable snooze options, 4-tab navigation, World Clock, Timer, Stopwatch, and an Android home-screen widget. Runs as a web app in the browser and builds to a native Android APK via Capacitor. Alarms use Android's native AlarmManager (via `@capacitor/local-notifications`) so they fire even when the app is closed.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router DOM v6 (4-tab bottom nav)
- **Native Mobile**: Capacitor 8 (Android)
- **Native Alarms**: `@capacitor/local-notifications` → wraps AlarmManager on Android
- **Widget**: Native Android AppWidgetProvider (`ClockWidget.java`) + Capacitor plugin (`AlarmWidgetPlugin.java`)
- **State**: React Context (AlarmContext) + localStorage
- **No backend**: Pure client-side app

## Key Files
- `src/App.tsx` — Root component with routing + bottom tab layout
- `src/pages/Index.tsx` — Alarms tab (alarm list, clock, next alarm indicator)
- `src/pages/WorldClock.tsx` — World Clock tab (add/remove cities, live times, UTC offsets)
- `src/pages/Timer.tsx` — Timer tab (H:MM:SS input, countdown, progress ring, native notification)
- `src/pages/Stopwatch.tsx` — Stopwatch tab (MM:SS.cs, lap tracking, fastest/slowest lap)
- `src/pages/AlarmActive.tsx` — Full-screen alarm firing screen
- `src/pages/AlarmEdit.tsx` — Edit alarm time/label/repeat days
- `src/pages/Settings.tsx` — Snooze button count + duration settings
- `src/components/BottomTabBar.tsx` — Fixed bottom tab navigation (Alarms/World/Timer/Stopwatch)
- `src/hooks/AlarmContext.tsx` — Global alarm state, schedules native alarms, updates home widget
- `src/hooks/useAlarmRunner.ts` — Listens for native notification events + setInterval fallback for web
- `src/lib/nativeAlarm.ts` — Capacitor LocalNotifications wrapper
- `src/lib/widgetBridge.ts` — Calls native AlarmWidgetPlugin to update SharedPreferences + widget
- `vite.config.ts` — Vite dev server (port 5000, allowedHosts: true)
- `capacitor.config.ts` — Capacitor config (appId: com.coosnoo.app)
- `android/` — Generated Android project (Gradle)

## Android Widget
The home-screen widget shows:
- Date (Mon, May 4)
- Large time (4:32 PM)
- Next alarm (⏰ 7:00 AM · Work)

**Native files:**
- `android/app/src/main/java/com/coosnoo/app/ClockWidget.java` — AppWidgetProvider
- `android/app/src/main/java/com/coosnoo/app/AlarmWidgetPlugin.java` — Capacitor plugin bridge
- `android/app/src/main/res/layout/widget_layout.xml` — Widget layout
- `android/app/src/main/res/xml/widget_provider_info.xml` — Widget metadata (4×2 cells)
- `android/app/src/main/res/drawable/widget_background.xml` — Rounded dark background

Widget updates when: app opens/closes, alarms change (via widgetBridge.ts → SharedPreferences), every minute (via AlarmManager schedule).

## Running in browser
```bash
npm run dev
```
App runs on port 5000. Native alarm/widget APIs gracefully no-op in browser.

## Building the APK
```bash
export ANDROID_HOME=$HOME/android-sdk
export JAVA_HOME=/nix/store/k95pqfzyvrna93hc9a4cg5csl7l4fh0d-openjdk-21.0.7+6/lib/openjdk
export PATH=$JAVA_HOME/bin:$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
# If SDK missing: sdkmanager --sdk_root=$ANDROID_HOME "platform-tools" "build-tools;35.0.0" "platforms;android-35"
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
npm run build && npx cap sync android && cd android && ./gradlew assembleDebug --no-daemon
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk` (also copied to `coosnoo-debug.apk` and `public/coosnoo-debug.apk`)

## Android Permissions (AndroidManifest.xml)
- `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` — AlarmManager exact timing (Android 12+/13+)
- `RECEIVE_BOOT_COMPLETED` — Reschedule alarms after device reboot
- `WAKE_LOCK` — Wake screen when alarm fires
- `VIBRATE` — Vibration on alarm
- `POST_NOTIFICATIONS` — Notification permission (Android 13+)
- `FOREGROUND_SERVICE` — Keep alarm service alive

## Native alarm flow (Android)
1. User creates/enables alarm → `scheduleNativeAlarm()` registers a LocalNotification with `schedule.at` and `allowWhileIdle: true`
2. At trigger time, Android fires the notification via AlarmManager (even if app is closed)
3. If app is open, `localNotificationReceived` event navigates to `/alarm-active/:id`
4. If app is tapped from notification, `localNotificationActionPerformed` navigates to `/alarm-active/:id`
5. Snooze → `scheduleNativeAlarm()` with `Date.now() + minutes * 60000`
6. Dismiss / delete → `cancelNativeAlarm()` removes the pending AlarmManager intent
