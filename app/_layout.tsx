// app/_layout.tsx
import "../global.css"
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "../store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { appStorage } from "../lib/storage";
import { requestNotificationPermissions, scheduleAppReminderNotification } from "../lib/notifications";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadStoredAuth, isLoading } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await loadStoredAuth();

      // Request notification permissions
      const granted = await requestNotificationPermissions();
      if (granted) {
        // Check last opened for reminder
        const lastOpened = await appStorage.getLastOpened();
        if (lastOpened) {
          const hoursSince =
            (Date.now() - new Date(lastOpened).getTime()) / 1000 / 3600;
          if (hoursSince >= 24) {
            await scheduleAppReminderNotification();
          }
        }
        await appStorage.updateLastOpened();
      }

      await SplashScreen.hideAsync();
    };
    init();
  }, []);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course" />
      </Stack>
    </GestureHandlerRootView>
  );
}
