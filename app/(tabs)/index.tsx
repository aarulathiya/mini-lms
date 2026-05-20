// app/(tabs)/index.tsx
import React, { useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/index";
import CourseCard from "../../components/CourseCard";
import OfflineBanner from "../../components/OfflineBanner";
import ErrorView from "../../components/ErrorView";
import { useNetwork } from "../../hooks/useNetwork";

export default function CoursesScreen() {
  const {
    fetchCourses,
    refreshCourses,
    setSearchQuery,
    getFilteredCourses,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    hasMore,
    currentPage,
  } = useCourseStore();

  const { isConnected } = useNetwork();
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && isConnected) {
      fetchCourses(currentPage + 1);
    }
  }, [isLoading, hasMore, isConnected, fetchCourses, currentPage]);

  const handleSearch = useCallback(
    (text: string) => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        setSearchQuery(text);
      }, 300);
    },
    [setSearchQuery]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Course>) => <CourseCard course={item} />,
    []
  );

  const keyExtractor = useCallback((item: Course) => item.id, []);

  const filteredCourses = getFilteredCourses();

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* <OfflineBanner /> */}

      {/* Header */}
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-white mb-1">Explore Courses</Text>
        <Text className="text-slate-400 text-sm">{filteredCourses.length} courses available</Text>
      </View>

      {/* Search */}
      <View className="px-5 mb-3">
        <View className="bg-slate-800 rounded-xl flex-row items-center px-4 border border-slate-700">
          <Text className="text-slate-400 text-lg mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-white py-3 text-base"
            placeholder="Search courses, instructors..."
            placeholderTextColor="#64748B"
            onChangeText={handleSearch}
            defaultValue={searchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Error */}
      {error && !isLoading && (
        <ErrorView message={error} onRetry={() => fetchCourses(1)} />
      )}

      {/* List */}
      {isLoading && filteredCourses.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366F1" />
          <Text className="text-slate-400 mt-3">Loading courses...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshCourses}
              tintColor="#6366F1"
              colors={["#6366F1"]}
            />
          }
          ListFooterComponent={
            isLoading && filteredCourses.length > 0 ? (
              <ActivityIndicator color="#6366F1" style={{ marginVertical: 16 }} />
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="items-center justify-center py-20">
                <Text className="text-4xl mb-3">📚</Text>
                <Text className="text-white font-semibold text-lg">No courses found</Text>
                <Text className="text-slate-400 text-sm mt-1">Try a different search term</Text>
                {searchQuery ? (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    className="mt-4 bg-indigo-500 px-5 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">Clear search</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
