// components/CourseCard.tsx
import React, { memo, useCallback } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Course } from "../types/index";
import { useCourseStore } from "../store/courseStore";
import { COLORS } from "../constants/index";

interface CourseCardProps {
  course: Course;
}

function getInstructorName(name: string | { first: string; last: string; title?: string }): string {
  if (typeof name === "string") return name;
  return `${name.first} ${name.last}`;
}

function getInstructorInitial(name: string | { first: string; last: string; title?: string }): string {
  if (typeof name === "string") return name[0];
  return name.first[0];
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

  const instructorName = getInstructorName(course.instructor.name);
  const instructorInitial = getInstructorInitial(course.instructor.name);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      className="bg-[#1a1625] rounded-2xl mb-4 overflow-hidden border border-[#2e2640]"
    >
      {/* Thumbnail */}
      <View className="relative">
        <Image
          source={{ uri: "https://asset.gecdesigns.com/img/wallpapers/make-money-motivation-iphone-wallpaper-with-gold-dollar-symbol-and-luxury-wealth-theme-sr13042604-mockup-one.webp" }}
          className="w-full h-44 bg-[#0d0b14]"
          resizeMode="cover"
        />

        {/* Bookmark button */}
        <TouchableOpacity
          onPress={handleBookmark}
          className="absolute top-3 right-3 rounded-full p-2"
          style={{ backgroundColor: "rgba(13,11,20,0.65)" }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={course.isBookmarked ? "bookmark" : "bookmark-outline"}
            size={18}
            color={course.isBookmarked ? "#a78bfa" : "white"}
          />
        </TouchableOpacity>

        {/* Enrolled badge */}
        {course.isEnrolled && (
          <LinearGradient
            colors={["#7c3aed", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons name="checkmark-circle" size={12} color="white" />
            <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>Enrolled</Text>
          </LinearGradient>
        )}
      </View>

      {/* Info */}
      <View className="p-4">

        {/* Category + Rating */}
        <View className="flex-row items-center justify-between mb-2">
          <LinearGradient
            colors={["#3b1f6e", "#2e1a5c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}
          >
            <Text className="text-violet-300 text-xs font-medium capitalize">
              {course.category}
            </Text>
          </LinearGradient>

          <View className="flex-row items-center" style={{ gap: 4 }}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text className="text-gray-300 text-xs">{course.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text className="text-white font-bold text-base mb-1" numberOfLines={2}>
          {course.title}
        </Text>

        {/* Description */}
        <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>
          {course.description}
        </Text>

        {/* Divider */}
        <View className="border-t border-[#2e2640] mb-3" />

        {/* Instructor + Price */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1" style={{ gap: 8 }}>
            {course.instructor.avatar ? (
              <Image
                source={{ uri: course.instructor.avatar }}
                className="w-7 h-7 rounded-full bg-[#2e2640]"
              />
            ) : (
              <LinearGradient
                colors={["#7c3aed", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 28, height: 28, borderRadius: 999, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>
                  {instructorInitial}
                </Text>
              </LinearGradient>
            )}
            <Text className="text-gray-500 text-xs flex-1" numberOfLines={1}>
              {instructorName}
            </Text>
          </View>

          {/* Price */}
          <LinearGradient
            colors={["#7c3aed", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}
          >
            <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
              ${course.price.toFixed(0)}
            </Text>
          </LinearGradient>
        </View>

      </View>
    </TouchableOpacity>
  );
});

export default CourseCard;