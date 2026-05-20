// lib/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { NOTIFICATION_IDS } from "../constants/index";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return finalStatus === "granted";
}

export async function scheduleBookmarkMilestoneNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDS.BOOKMARK_MILESTONE
  ).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.BOOKMARK_MILESTONE,
    content: {
      title: "🎉 Learning Milestone!",
      body: "You've bookmarked 5 courses! Ready to start learning?",
      data: { type: "bookmark_milestone" },
    },
    trigger: null, // immediate
  });
}

export async function scheduleAppReminderNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDS.APP_REMINDER
  ).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.APP_REMINDER,
    content: {
      title: "📚 Keep Learning!",
      body: "You haven't visited your courses in a while. Pick up where you left off!",
      data: { type: "app_reminder" },
    },
    trigger: {
      seconds: 86400, // 24 hours
      repeats: false,
    },
  });
}

export async function cancelReminderNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    NOTIFICATION_IDS.APP_REMINDER
  ).catch(() => {});
}
