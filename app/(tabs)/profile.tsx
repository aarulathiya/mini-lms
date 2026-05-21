// app/(tabs)/profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";          
import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";
import { apiClient } from "../../lib/api";
import { API_ENDPOINTS } from "../../constants/index";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// ✅ Notification handler (app foreground માં હોય ત્યારે પણ show કરે)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const { bookmarks, enrolledCourses } = useCourseStore();
  const [isUploading, setIsUploading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);  
  const router = useRouter();

  // ✅ App open થાય ત્યારે permission check + bookmark notification
  useEffect(() => {
    checkNotificationPermission();
    checkBookmarkMilestone();
  }, [bookmarks.length]);

  // ✅ Permission check
  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotifEnabled(status === "granted");
  };

  // ✅ Permission request
  const requestNotificationPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotifEnabled(status === "granted");
    if (status === "granted") {
      Alert.alert("✅ Notifications ON", "Tame notification enable karya!");
    } else {
      Alert.alert("Permission Denied", "Settings mathi notification enable karo.");
    }
  };

  // ✅ Bookmarks 5+ થાય ત્યારે notification
  const checkBookmarkMilestone = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    if (bookmarks.length >= 5) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔖 Bookmarks Milestone!",
          body: `Wah! Tamara ${bookmarks.length} courses bookmark thaya che. Enroll karo haju!`,
          data: { screen: "bookmarks" },
        },
        trigger: null, // ✅ Immediately show
      });
    }
  };

  // ✅ Manual test notification
  const sendTestNotification = async () => {
    if (!notifEnabled) {
      await requestNotificationPermission();
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📚 LMS Notification",
        body: "Aaje nava courses explore karo!",
        data: {},
      },
      trigger: null,
    });
  };

  const stats = [
    { label: "Enrolled",   value: enrolledCourses.length, icon: "book-outline" as const,             colors: ["#7c3aed", "#a78bfa"] as const },
    { label: "Bookmarks",  value: bookmarks.length,        icon: "bookmark-outline" as const,         colors: ["#6d28d9", "#c084fc"] as const },
    { label: "Completed",  value: 0,                       icon: "checkmark-circle-outline" as const, colors: ["#5b21b6", "#a78bfa"] as const },
    { label: "Avg Rating", value: "4.5",                   icon: "star-outline" as const,             colors: ["#7c3aed", "#e9d5ff"] as const },
  ];

  const handleAvatarUpdate = async () => {
    Alert.alert("Change Profile Photo", "", [
      { text: "Take Photo", onPress: () => pickImage("camera") },
      { text: "Choose from Gallery", onPress: () => pickImage("gallery") },
      { text: "Remove Photo", style: "destructive", onPress: handleRemoveAvatar },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickImage = async (source: "camera" | "gallery") => {
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access aapvo jaruri che.");
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Gallery access aapvo jaruri che.");
        return;
      }
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });

    if (!result.canceled && result.assets[0]) {
      setIsUploading(true);
      try {
        const asset = result.assets[0];
        const formData = new FormData();
        formData.append("avatar", {
          uri: asset.uri,
          type: asset.mimeType ?? "image/jpeg",
          name: "avatar.jpg",
        } as unknown as Blob);
        const response = await apiClient.patch(API_ENDPOINTS.UPDATE_AVATAR, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updateUser(response.data.data);
        Alert.alert("Success", "Profile picture update thay gayu!");
      } catch {
        Alert.alert("Error", "Avatar update nai thayo.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveAvatar = async () => {
    Alert.alert("Remove Photo", "Profile photo remove karvu che?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await apiClient.delete(API_ENDPOINTS.UPDATE_AVATAR);
            updateUser(response.data.data);
            Alert.alert("Done", "Profile photo remove thay gayu.");
          } catch {
            Alert.alert("Error", "Remove nai thayo, try karo.");
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const avatarUrl = user?.avatar?.url;

  return (
    <SafeAreaView className="flex-1 bg-[#0d0b14]">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Top Header ── */}
        <View className="px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-violet-200">Profile</Text>
        </View>

        {/* ── Avatar Section ── */}
        <View className="items-center py-6">
          <TouchableOpacity
            onPress={handleAvatarUpdate}
            disabled={isUploading}
            className="relative"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#a78bfa", "#7c3aed", "#c084fc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 3, borderRadius: 9999 }}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} className="w-24 h-24 rounded-full bg-[#1a1625]" />
              ) : (
                <View className="w-24 h-24 rounded-full bg-[#1a1625] items-center justify-center">
                  <Text className="text-violet-300 text-3xl font-bold">
                    {user?.username?.[0]?.toUpperCase() ?? "U"}
                  </Text>
                </View>
              )}
            </LinearGradient>
            <LinearGradient
              colors={["#7c3aed", "#a855f7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ position: "absolute", bottom: 0, right: 0, borderRadius: 9999, padding: 7 }}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="pencil" size={13} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold mt-3">{user?.username}</Text>
          <Text className="text-gray-500 text-sm mt-0.5">{user?.email}</Text>
          <LinearGradient
            colors={["#7c3aed", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 4, marginTop: 8 }}
          >
            <Text className="text-white text-xs font-semibold capitalize">{user?.role}</Text>
          </LinearGradient>
        </View>

        {/* ── Body ── */}
        <View className="px-4 pt-2 pb-10" style={{ gap: 14 }}>

          {/* Stats 2x2 */}
          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {stats.map(({ label, value, icon, colors }) => (
              <View
                key={label}
                className="bg-[#1a1625] rounded-2xl border border-[#2e2640] p-4 flex-row items-center"
                style={{ width: "48%", gap: 12 }}
              >
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
                >
                  <Ionicons name={icon} size={18} color="#ffffff" />
                </LinearGradient>
                <View>
                  <Text className="text-white text-lg font-semibold">{value}</Text>
                  <Text className="text-gray-500 text-xs">{label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ✅ Notifications Card */}
          <View className="bg-[#1a1625] rounded-2xl border border-[#2e2640] overflow-hidden">
            <View className="px-4 py-3 border-b border-[#2e2640]">
              <Text className="text-violet-400 text-xs font-semibold uppercase tracking-widest">
                Notifications
              </Text>
            </View>

            {/* Status Row */}
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-[#2e2640]">
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Ionicons name="notifications-outline" size={16} color="#7c3aed" />
                <Text className="text-gray-500 text-sm">Status</Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${notifEnabled ? "bg-green-500/20" : "bg-red-500/20"}`}>
                <Text className={`text-xs font-semibold ${notifEnabled ? "text-green-400" : "text-red-400"}`}>
                  {notifEnabled ? "Enabled" : "Disabled"}
                </Text>
              </View>
            </View>

            {/* Enable / Test Button */}
            <TouchableOpacity
              onPress={notifEnabled ? sendTestNotification : requestNotificationPermission}
              activeOpacity={0.7}
              className="flex-row justify-between items-center px-4 py-3"
            >
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Ionicons
                  name={notifEnabled ? "paper-plane-outline" : "lock-open-outline"}
                  size={16}
                  color="#7c3aed"
                />
                <Text className="text-gray-500 text-sm">
                  {notifEnabled ? "Send Test Notification" : "Enable Notifications"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#4b4063" />
            </TouchableOpacity>
          </View>

          {/* Account section */}
          <View className="bg-[#1a1625] rounded-2xl border border-[#2e2640] overflow-hidden">
            <View className="px-4 py-3 border-b border-[#2e2640]">
              <Text className="text-violet-400 text-xs font-semibold uppercase tracking-widest">
                Account
              </Text>
            </View>
            {[
              { label: "Username",     value: user?.username,  icon: "person-outline" as const },
              { label: "Email",        value: user?.email,     icon: "mail-outline" as const },
              {
                label: "Member Since",
                value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—",
                icon: "calendar-outline" as const,
              },
            ].map(({ label, value, icon }, i, arr) => (
              <View
                key={label}
                className={`flex-row justify-between items-center px-4 py-3 ${
                  i < arr.length - 1 ? "border-b border-[#2e2640]" : ""
                }`}
              >
                <View className="flex-row items-center" style={{ gap: 8 }}>
                  <Ionicons name={icon} size={16} color="#7c3aed" />
                  <Text className="text-gray-500 text-sm">{label}</Text>
                </View>
                <Text className="text-violet-200 text-sm font-medium" numberOfLines={1}>
                  {value}
                </Text>
              </View>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl py-4 flex-row items-center justify-center"
            style={{ gap: 8 }}
          >
            <Ionicons name="log-out-outline" size={18} color="#f87171" />
            <Text className="text-red-400 font-semibold">Log Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}