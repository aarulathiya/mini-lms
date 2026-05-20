// app/(tabs)/bookmarks.tsx
import React, { useCallback } from "react";
import { View, Text, FlatList, ListRenderItemInfo } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/index";
import CourseCard from "../../components/CourseCard";

export default function BookmarksScreen() {
  const { courses, bookmarks } = useCourseStore();

  const bookmarkedCourses = courses.filter((c) => bookmarks.includes(c.id));

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Course>) => <CourseCard course={item} />,
    []
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-white">Bookmarks</Text>
        <Text className="text-slate-400 text-sm mt-1">
          {bookmarkedCourses.length} saved course{bookmarkedCourses.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {bookmarkedCourses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">🔖</Text>
          <Text className="text-white font-semibold text-xl text-center">No bookmarks yet</Text>
          <Text className="text-slate-400 text-sm text-center mt-2">
            Bookmark courses from the catalog to save them here for quick access
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarkedCourses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
