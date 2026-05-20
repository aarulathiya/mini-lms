// app/(tabs)/profile.tsx
import React, { useState } from "react";
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
import { useAuthStore } from "../../store/authStore";
import { useCourseStore } from "../../store/courseStore";
import { apiClient } from "../../lib/api";
import { API_ENDPOINTS } from "../../constants/index";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuthStore();
  const { bookmarks, enrolledCourses } = useCourseStore();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const stats = [
    { label: "Enrolled", value: enrolledCourses.length, icon: "📚" },
    { label: "Bookmarks", value: bookmarks.length, icon: "🔖" },
    { label: "Completed", value: 0, icon: "✅" },
  ];

  const handleAvatarUpdate = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera roll permission is needed to update your avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

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
        Alert.alert("Success", "Profile picture updated!");
      } catch {
        Alert.alert("Error", "Failed to update avatar. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }
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
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-3">
          <Text className="text-2xl font-bold text-white">Profile</Text>
        </View>

        {/* Avatar + info */}
        <View className="items-center py-6">
          <TouchableOpacity
            onPress={handleAvatarUpdate}
            disabled={isUploading}
            className="relative"
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-24 h-24 rounded-full bg-slate-700"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-indigo-600 items-center justify-center">
                <Text className="text-white text-3xl font-bold">
                  {user?.username?.[0]?.toUpperCase() ?? "U"}
                </Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-2">
              {isUploading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-xs">✏️</Text>
              )}
            </View>
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold mt-3">{user?.username}</Text>
          <Text className="text-slate-400 text-sm">{user?.email}</Text>
          <View className="bg-indigo-500/20 rounded-full px-3 py-1 mt-2">
            <Text className="text-indigo-300 text-xs font-medium capitalize">{user?.role}</Text>
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row mx-5 gap-3 mb-6">
          {stats.map(({ label, value, icon }) => (
            <View key={label} className="flex-1 bg-slate-800 rounded-2xl p-4 items-center border border-slate-700">
              <Text className="text-2xl mb-1">{icon}</Text>
              <Text className="text-white text-xl font-bold">{value}</Text>
              <Text className="text-slate-400 text-xs">{label}</Text>
            </View>
          ))}
        </View>

        {/* Account section */}
        <View className="mx-5 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-4">
          <Text className="text-slate-400 text-xs font-semibold uppercase px-4 py-3 border-b border-slate-700">
            Account
          </Text>
          {[
            { label: "Username", value: user?.username },
            { label: "Email", value: user?.email },
            {
              label: "Member Since",
              value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—",
            },
          ].map(({ label, value }) => (
            <View key={label} className="flex-row justify-between items-center px-4 py-3 border-b border-slate-700/50">
              <Text className="text-slate-400 text-sm">{label}</Text>
              <Text className="text-white text-sm font-medium">{value}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mx-5 bg-red-500/10 border border-red-500/30 rounded-2xl py-4 items-center mb-8"
          activeOpacity={0.8}
        >
          <Text className="text-red-400 font-semibold">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
