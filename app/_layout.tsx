// app/_layout.tsx
import "../global.css"
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
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

      const granted = await requestNotificationPermissions();
      if (granted) {
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0d0b14", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#a78bfa" />
      </View>
    );
  }

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