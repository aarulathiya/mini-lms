// app/course/[id].tsx
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
import { COLORS } from "../../constants";

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { courses, toggleBookmark, enrollCourse } = useCourseStore();

  const course = useMemo(
    () => courses.find((c) => c.id === id),
    [courses, id]
  );

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
        {
          text: "Start Learning",
          onPress: () => router.push(`/course/webview?courseId=${course.id}`),
        },
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
      <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
        <Text className="text-white">Course not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-indigo-400">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Thumbnail */}
        <View className="relative">
          <Image
            source={{ uri: course.thumbnail }}
            className="w-full h-56 bg-slate-800"
            resizeMode="cover"
          />
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 bg-black/50 rounded-full p-2"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          {/* Bookmark button */}
          <TouchableOpacity
            onPress={handleBookmark}
            className="absolute top-4 right-4 bg-black/50 rounded-full p-2"
          >
            <Ionicons
              name={course.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={course.isBookmarked ? COLORS.primary : "white"}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-5 py-5">
          {/* Category + rating */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-indigo-500/20 rounded-full px-3 py-1">
              <Text className="text-indigo-300 text-xs font-medium capitalize">
                {course.category}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-yellow-400">⭐</Text>
              <Text className="text-white font-medium">{course.rating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-white text-2xl font-bold mb-3">{course.title}</Text>

          {/* Instructor */}
          <View className="flex-row items-center gap-3 mb-4 bg-slate-800 rounded-xl p-3 border border-slate-700">
            {course.instructor.avatar ? (
              <Image
                source={{ uri: course.instructor.avatar }}
                className="w-12 h-12 rounded-full bg-slate-700"
              />
            ) : (
              <View className="w-12 h-12 rounded-full bg-indigo-600 items-center justify-center">
                <Text className="text-white font-bold">
                  {course.instructor.name[0]}
                </Text>
              </View>
            )}
            <View>
              <Text className="text-white font-semibold">{course.instructor.name}</Text>
              <Text className="text-slate-400 text-sm">{course.instructor.email}</Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-slate-300 text-base leading-relaxed mb-6">
            {course.description}
          </Text>

          {/* Price */}
          <View className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
            <Text className="text-slate-400 text-sm mb-1">Course Price</Text>
            <Text className="text-white text-3xl font-bold">
              ${course.price.toFixed(2)}
            </Text>
          </View>

          {/* Enroll button */}
          <TouchableOpacity
            onPress={handleEnroll}
            className={`py-4 rounded-xl items-center ${
              course.isEnrolled ? "bg-green-600" : "bg-indigo-500"
            }`}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">
              {course.isEnrolled ? "▶  Continue Learning" : "Enroll Now"}
            </Text>
          </TouchableOpacity>

          {course.isEnrolled && (
            <View className="mt-3 bg-green-500/10 border border-green-500/30 rounded-xl p-3">
              <Text className="text-green-400 text-sm text-center">
                ✅ You are enrolled in this course
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
