// store/courseStore.ts
import { create } from "zustand";
import { apiClient } from "../lib/api";
import { appStorage } from "../lib/storage";
import { scheduleBookmarkMilestoneNotification } from "../lib/notifications";
import { Course, RandomProduct, RandomUser } from "../types";
import { API_ENDPOINTS } from "../constants";

const BOOKMARK_MILESTONE = 5;

function getInstructorFullName(
  name: string | { first: string; last: string; title?: string } | undefined
): string {
  if (!name) return "";
  if (typeof name === "string") return name;
  return `${name.first ?? ""} ${name.last ?? ""}`.trim();
}

interface CourseStore {
  courses: Course[];
  bookmarks: string[];
  enrolledCourses: string[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  currentPage: number;
  hasMore: boolean;

  fetchCourses: (page?: number) => Promise<void>;
  refreshCourses: () => Promise<void>;
  toggleBookmark: (courseId: string) => Promise<void>;
  enrollCourse: (courseId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  loadStoredData: () => Promise<void>;
  getFilteredCourses: () => Course[];
}

// Map API data to our Course model
function mapToCourse(
  product: RandomProduct,
  instructor: RandomUser | undefined,
  bookmarks: string[],
  enrolled: string[]
): Course {
  const rawName = instructor?.name as
    | string
    | { first: string; last: string; title?: string }
    | undefined;
  const instructorName = getInstructorFullName(rawName) || "Unknown Instructor";

  return {
    id: String(product.id),
    title: product.title,
    description: product.description,
    thumbnail: product.thumbnail,
    price: product.price,
    rating: product.rating,
    category: product.category,
    instructor: {
      id: String(instructor?.id ?? 0),
      name: instructorName,
      email: instructor?.email ?? "",
      avatar: instructor?.profileImage ?? "",
      gender: instructor?.gender ?? "male",
    },
    isBookmarked: bookmarks.includes(String(product.id)),
    isEnrolled: enrolled.includes(String(product.id)),
  };
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  courses: [],
  bookmarks: [],
  enrolledCourses: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  searchQuery: "",
  currentPage: 1,
  hasMore: true,

  fetchCourses: async (page = 1) => {
    const { isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const [productsRes, usersRes] = await Promise.all([
        apiClient.get(`${API_ENDPOINTS.COURSES}?page=${page}&limit=20`),
        apiClient.get(`${API_ENDPOINTS.INSTRUCTORS}?page=1&limit=20`),
      ]);

      const products: RandomProduct[] = productsRes.data.data.data;
      const users: RandomUser[] = usersRes.data.data.data;

      const bookmarks = await appStorage.getBookmarks();
      const enrolled = await appStorage.getEnrolledCourses();

      const newCourses: Course[] = products.map((p, i) =>
        mapToCourse(p, users[i % users.length], bookmarks, enrolled)
      );

      set((state) => ({
        courses: page === 1 ? newCourses : [...state.courses, ...newCourses],
        bookmarks,
        enrolledCourses: enrolled,
        currentPage: page,
        hasMore: productsRes.data.data.hasNextPage,
        isLoading: false,
      }));
    } catch (err: unknown) {
      const error = err as { message?: string };
      set({ error: error.message ?? "Failed to load courses", isLoading: false });
    }
  },

  refreshCourses: async () => {
    set({ isRefreshing: true });
    await get().fetchCourses(1);
    set({ isRefreshing: false });
  },

  toggleBookmark: async (courseId: string) => {
    const isBookmarked = await appStorage.toggleBookmark(courseId);
    const bookmarks = await appStorage.getBookmarks();

    set((state) => ({
      bookmarks,
      courses: state.courses.map((c) =>
        c.id === courseId ? { ...c, isBookmarked } : c
      ),
    }));

    if (bookmarks.length >= BOOKMARK_MILESTONE && isBookmarked) {
      await scheduleBookmarkMilestoneNotification();
    }
  },

  enrollCourse: async (courseId: string) => {
    await appStorage.enrollCourse(courseId);
    const enrolled = await appStorage.getEnrolledCourses();

    set((state) => ({
      enrolledCourses: enrolled,
      courses: state.courses.map((c) =>
        c.id === courseId ? { ...c, isEnrolled: true } : c
      ),
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  loadStoredData: async () => {
    const [bookmarks, enrolled] = await Promise.all([
      appStorage.getBookmarks(),
      appStorage.getEnrolledCourses(),
    ]);
    set({ bookmarks, enrolledCourses: enrolled });
  },

  getFilteredCourses: () => {
    const { courses, searchQuery } = get();
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.instructor.name.toLowerCase().includes(q)
    );
  },
}));