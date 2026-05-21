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
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Ionicons } from "@expo/vector-icons";
import { useCourseStore } from "../../store/courseStore";
import { Course } from "../../types/index";
import CourseCard from "../../components/CourseCard";
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
    <SafeAreaView className="flex-1 bg-[#0d0b14]">

      {/* ── Header: Book icon + LMS gradient + bell ── */}
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <LinearGradient
            colors={["#a78bfa", "#7c3aed"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="book" size={20} color="#fff" />
          </LinearGradient>

          <MaskedView
            maskElement={
              <Text style={{ fontSize: 28, fontWeight: "800", letterSpacing: -0.5 }}>LMS</Text>
            }
          >
            <LinearGradient
              colors={["#a78bfa", "#7c3aed", "#c084fc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={{ fontSize: 28, fontWeight: "800", letterSpacing: -0.5, opacity: 0 }}>LMS</Text>
            </LinearGradient>
          </MaskedView>
        </View>

        <View
          className="bg-[#1a1625] border border-[#2e2640]"
          style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="notifications-outline" size={20} color="#a78bfa" />
        </View>
      </View>

      {/* ── Sub-title ── */}
      <View className="px-5 pb-3">
        <Text className="text-white text-xl font-bold">Explore Courses</Text>
        <Text className="text-gray-500 text-sm mt-0.5">
          {filteredCourses.length} courses available
        </Text>
      </View>

      {/* ── Search ── */}
      <View className="px-5 mb-4">
        <View
          className="bg-[#1a1625] rounded-2xl flex-row items-center px-4 border border-[#2e2640]"
          style={{ gap: 8 }}
        >
          <Ionicons name="search-outline" size={18} color="#6b7280" />
          <TextInput
            className="flex-1 text-gray-100 py-3 text-base"
            placeholder="Search courses, instructors..."
            placeholderTextColor="#4b5563"
            onChangeText={handleSearch}
            defaultValue={searchQuery}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#6b7280" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Error ── */}
      {error && !isLoading && (
        <ErrorView message={error} onRetry={() => fetchCourses(1)} />
      )}

      {/* ── First load spinner ── */}
      {isLoading && filteredCourses.length === 0 ? (
        <View className="flex-1 items-center justify-center" style={{ gap: 12 }}>
          <ActivityIndicator size="large" color="#a78bfa" />
          <Text className="text-gray-500">Loading courses...</Text>
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
              tintColor="#a78bfa"
              colors={["#7c3aed"]}
            />
          }
          ListFooterComponent={
            isLoading && filteredCourses.length > 0 ? (
              <ActivityIndicator color="#a78bfa" style={{ marginVertical: 16 }} />
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="items-center justify-center py-20" style={{ gap: 8 }}>
                <LinearGradient
                  colors={["#1a1625", "#2e2640"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 4,
                    borderWidth: 1,
                    borderColor: "#2e2640",
                  }}
                >
                  <Ionicons name="book-outline" size={32} color="#a78bfa" />
                </LinearGradient>

                <Text className="text-white font-semibold text-lg">No courses found</Text>
                <Text className="text-gray-500 text-sm">Try a different search term</Text>

                {searchQuery ? (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    activeOpacity={0.85}
                    className="mt-2 rounded-2xl overflow-hidden"
                  >
                    <LinearGradient
                      colors={["#7c3aed", "#9333ea", "#a855f7"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingHorizontal: 24, paddingVertical: 10, borderRadius: 16 }}
                    >
                      <Text className="text-white font-semibold">Clear search</Text>
                    </LinearGradient>
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