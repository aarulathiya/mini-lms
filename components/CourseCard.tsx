// components/CourseCard.tsx
import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Course } from "../types/index";
import { useCourseStore } from "../store/courseStore";
import { COLORS } from "../constants/index";

interface CourseCardProps {
  course: Course;
}

const CourseCard = memo(function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const { toggleBookmark } = useCourseStore();

  const handlePress = useCallback(() => {
    router.push(`/course/${course.id}`);
  }, [router, course.id]);

  const handleBookmark = useCallback(
    async (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      await toggleBookmark(course.id);
    },
    [toggleBookmark, course.id]
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className="bg-slate-800 rounded-2xl mb-4 overflow-hidden border border-slate-700"
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: course.thumbnail }}
          className="w-full h-44 bg-slate-700"
          resizeMode="cover"
        />
        {/* Bookmark */}
        <TouchableOpacity
          onPress={handleBookmark}
          className="absolute top-3 right-3 bg-black/50 rounded-full p-2"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={course.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={18}
            color={course.isBookmarked ? COLORS.primary : "white"}
          />
        </TouchableOpacity>
        {/* Enrolled badge */}
        {course.isEnrolled && (
          <View className="absolute top-3 left-3 bg-green-500/90 rounded-full px-2 py-1">
            <Text className="text-white text-xs font-semibold">✓ Enrolled</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-4">
        {/* Category + rating */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="bg-indigo-500/20 rounded-full px-2 py-0.5">
            <Text className="text-indigo-300 text-xs font-medium capitalize">
              {course.category}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-yellow-400 text-xs">⭐</Text>
            <Text className="text-slate-300 text-xs">{course.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-white font-bold text-base mb-1" numberOfLines={2}>
          {course.title}
        </Text>

        {/* Description */}
        <Text className="text-slate-400 text-sm mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        {/* Instructor + Price */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2 flex-1">
            {course.instructor.avatar ? (
              <Image
                source={{ uri: course.instructor.avatar }}
                className="w-6 h-6 rounded-full bg-slate-600"
              />
            ) : (
              <View className="w-6 h-6 rounded-full bg-indigo-600 items-center justify-center">
                <Text className="text-white text-xs">{course.instructor.name[0]}</Text>
              </View>
            )}
            {/* <Text className="text-slate-400 text-xs flex-1" numberOfLines={1}>
              {course.instructor.name}
            </Text> */}
          </View>
          <Text className="text-indigo-400 font-bold">${course.price.toFixed(0)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default CourseCard;
