package com.coosnoo.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;

public class ClockWidget extends AppWidgetProvider {

    public static final String ACTION_UPDATE = "com.coosnoo.app.WIDGET_UPDATE";
    private static final String PREFS_NAME = "CooSnooWidget";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        scheduleNextUpdate(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_UPDATE.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            ComponentName widget = new ComponentName(context, ClockWidget.class);
            int[] ids = mgr.getAppWidgetIds(widget);
            for (int id : ids) {
                updateAppWidget(context, mgr, id);
            }
            scheduleNextUpdate(context);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        Calendar cal = Calendar.getInstance();

        String date = new SimpleDateFormat("EEE, MMM d", Locale.getDefault()).format(cal.getTime());

        int hour24 = cal.get(Calendar.HOUR_OF_DAY);
        int minute = cal.get(Calendar.MINUTE);
        int hour12 = (hour24 == 0) ? 12 : (hour24 > 12 ? hour24 - 12 : hour24);
        String time = String.format(Locale.getDefault(), "%d:%02d", hour12, minute);
        String period = (hour24 >= 12) ? "PM" : "AM";

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String nextAlarm = prefs.getString("next_alarm", "No alarm");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_layout);
        views.setTextViewText(R.id.widget_date, date);
        views.setTextViewText(R.id.widget_time, time);
        views.setTextViewText(R.id.widget_period, period);
        views.setTextViewText(R.id.widget_alarm, "\u23F0 " + nextAlarm);

        Intent launchIntent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private void scheduleNextUpdate(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        Intent intent = new Intent(context, ClockWidget.class);
        intent.setAction(ACTION_UPDATE);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MINUTE, 1);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);

        alarmManager.set(AlarmManager.RTC, cal.getTimeInMillis(), pendingIntent);
    }
}
