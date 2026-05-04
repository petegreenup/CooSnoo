import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.coosnoo.app",
  appName: "CooSnoo",
  webDir: "dist",
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#29C8D8",
      sound: "alarm_sound",
    },
  },
  android: {
    backgroundColor: "#111318",
    allowMixedContent: false,
  },
};

export default config;
