package com.coosnoo.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AlarmWidget")
public class AlarmWidgetPlugin extends Plugin {

    private static final String PREFS_NAME = "CooSnooWidget";

    @PluginMethod
    public void updateWidget(PluginCall call) {
        String nextAlarmText = call.getString("nextAlarmText", "No alarm");

        Context context = getContext();

        SharedPreferences.Editor editor = context
                .getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit();
        editor.putString("next_alarm", nextAlarmText);
        editor.apply();

        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        ComponentName widget = new ComponentName(context, ClockWidget.class);
        int[] ids = mgr.getAppWidgetIds(widget);
        for (int id : ids) {
            ClockWidget.updateAppWidget(context, mgr, id);
        }

        call.resolve();
    }
}
