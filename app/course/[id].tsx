
import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCourseStore } from "../../store/courseStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

function getInstructorName(name: string | { first: string; last: string; title?: string }): string {
  if (typeof name === "string") return name;
  return `${name.title ? name.title + " " : ""}${name.first} ${name.last}`;
}

function getInstructorInitial(name: string | { first: string; last: string; title?: string }): string {
  if (typeof name === "string") return name[0];
  return name.first[0];
}

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { courses, toggleBookmark, enrollCourse } = useCourseStore();

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id]);

  const handleEnroll = useCallback(async () => {
    if (!course) return;
    if (course.isEnrolled) {
      router.push(`/course/webview?courseId=${course.id}`);
      return;
    }
    await enrollCourse(course.id);
    Alert.alert(
      "🎉 Enrolled!",
      `You are now enrolled in "${course.title}"`,
      [
        { text: "Start Learning", onPress: () => router.push(`/course/webview?courseId=${course.id}`) },
        { text: "Later", style: "cancel" },
      ]
    );
  }, [course, enrollCourse, router]);

  const handleBookmark = useCallback(async () => {
    if (!course) return;
    await toggleBookmark(course.id);
  }, [course, toggleBookmark]);

  if (!course) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d0b14] items-center justify-center">
        <Text className="text-white">Course not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-violet-400">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const instructorName = getInstructorName(course.instructor.name);
  const instructorInitial = getInstructorInitial(course.instructor.name);

  return (
    <SafeAreaView className="flex-1 bg-[#0d0b14]">
      <ScrollView showsVerticalScrollIndicator={false}>

        <View className="relative">
          <Image
            source={{ uri: "https://asset.gecdesigns.com/img/wallpapers/make-money-motivation-iphone-wallpaper-with-gold-dollar-symbol-and-luxury-wealth-theme-sr13042604-mockup-one.webp" }}
            className="w-full h-56 bg-[#1a1625]"
            style={{ backgroundColor: "#0d0b14", height: 324 }}
            resizeMode="cover"
          />
          <View
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(13,11,20,0.35)" }}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 rounded-full p-2"
            style={{ backgroundColor: "rgba(13,11,20,0.65)" }}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBookmark}
            className="absolute top-4 right-4 rounded-full p-2"
            style={{ backgroundColor: "rgba(13,11,20,0.65)" }}
          >
            <Ionicons
              name={course.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={course.isBookmarked ? "#a78bfa" : "white"}
            />
          </TouchableOpacity>
        </View>

        <View className="px-5 py-5" style={{ gap: 16 }}>

          <View className="flex-row items-center justify-between">
            <LinearGradient
              colors={["#3b1f6e", "#2e1a5c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}
            >
              <Text className="text-violet-300 text-xs font-medium capitalize">
                {course.category}
              </Text>
            </LinearGradient>

            <View className="flex-row items-center" style={{ gap: 4 }}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text className="text-white font-semibold">{course.rating.toFixed(1)}</Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-bold">{course.title}</Text>

          <View
            className="bg-[#1a1625] rounded-2xl border border-[#2e2640] p-4 flex-row items-center"
            style={{ gap: 14 }}
          >
            {course.instructor.avatar ? (
              <Image
                source={{ uri: course.instructor.avatar }}
                className="w-12 h-12 rounded-full bg-[#2e2640]"
              />
            ) : (
              <LinearGradient
                colors={["#7c3aed", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 48, height: 48, borderRadius: 999, alignItems: "center", justifyContent: "center" }}
              >
                <Text className="text-white font-bold text-lg">{instructorInitial}</Text>
              </LinearGradient>
            )}
            <View>
              <Text className="text-white font-semibold">{instructorName}</Text>
              <Text className="text-gray-500 text-sm">{course.instructor.email}</Text>
            </View>
          </View>

          <Text className="text-gray-400 text-base leading-relaxed">
            {course.description}
          </Text>

          <View className="bg-[#1a1625] rounded-2xl border border-[#2e2640] p-4">
            <Text className="text-gray-500 text-sm mb-1">Course Price</Text>
            <Text style={{ fontSize: 32, fontWeight: "800", color: "#a78bfa", marginTop: -2 }}>
              ${course.price.toFixed(2)}
            </Text>
          </View>

          {course.isEnrolled ? (
            <TouchableOpacity
              onPress={handleEnroll}
              activeOpacity={0.85}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={["#065f46", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center justify-center"
              >
                <View className="flex-row items-center p-4" style={{ gap: 8 }}>
                  <Ionicons name="play-circle" size={20} color="white" />
                  <Text className="text-white font-bold text-base">Continue Learning</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleEnroll}
              activeOpacity={0.85}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={["#7c3aed", "#9333ea", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center justify-center"
              >
                <Text className="text-white font-bold text-base tracking-wide p-4">
                  Enroll Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Enrolled badge */}
          {course.isEnrolled && (
            <View
              className="border border-green-500/20 rounded-2xl p-3 items-center"
              style={{ backgroundColor: "rgba(16,185,129,0.08)" }}
            >
              <View className="flex-row items-center" style={{ gap: 6 }}>
                <Ionicons name="checkmark-circle" size={16} color="#34d399" />
                <Text className="text-green-400 text-sm">
                  You are enrolled in this course
                </Text>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
