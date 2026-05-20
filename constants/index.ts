// constants/index.ts

export const API_BASE_URL = "https://api.freeapi.app";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: "/api/v1/users/login",
  REGISTER: "/api/v1/users/register",
  LOGOUT: "/api/v1/users/logout",
  REFRESH_TOKEN: "/api/v1/users/refresh-token",
  CURRENT_USER: "/api/v1/users/current-user",
  UPDATE_AVATAR: "/api/v1/users/avatar",
  UPDATE_PROFILE: "/api/v1/users/update-account",
  CHANGE_PASSWORD: "/api/v1/users/change-password",

  // Courses (public APIs treated as LMS data)
  COURSES: "/api/v1/public/randomproducts",
  INSTRUCTORS: "/api/v1/public/randomusers",
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  BOOKMARKS: "bookmarks",
  ENROLLED_COURSES: "enrolled_courses",
  PREFERENCES: "app_preferences",
  LAST_OPENED: "last_opened_at",
};

export const REQUEST_TIMEOUT = 15000; // 15 seconds
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second

export const NOTIFICATION_IDS = {
  BOOKMARK_MILESTONE: "bookmark-milestone",
  APP_REMINDER: "app-reminder",
};

export const COLORS = {
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  surface: "#0F172A",
  surfaceCard: "#1E293B",
  surfaceElevated: "#334155",
  text: "#F8FAFC",
  textMuted: "#94A3B8",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
  border: "#334155",
};
