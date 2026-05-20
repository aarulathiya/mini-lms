// lib/storage.ts
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/index";
import { AuthTokens, User, AppPreferences } from "../types/index";

// ── Secure Store (sensitive) ────────────────────────────────────────────────

export const secureStorage = {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  },

  async saveUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const data = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    return data ? (JSON.parse(data) as User) : null;
  },

  async clearUser(): Promise<void> {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  },
};

// ── AsyncStorage (app data) ─────────────────────────────────────────────────

export const appStorage = {
  async getBookmarks(): Promise<string[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  },

  async saveBookmarks(bookmarks: string[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  },

  async toggleBookmark(courseId: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks();
    const index = bookmarks.indexOf(courseId);
    let isBookmarked: boolean;

    if (index === -1) {
      bookmarks.push(courseId);
      isBookmarked = true;
    } else {
      bookmarks.splice(index, 1);
      isBookmarked = false;
    }

    await this.saveBookmarks(bookmarks);
    return isBookmarked;
  },

  async getEnrolledCourses(): Promise<string[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ENROLLED_COURSES);
    return data ? JSON.parse(data) : [];
  },

  async enrollCourse(courseId: string): Promise<void> {
    const enrolled = await this.getEnrolledCourses();
    if (!enrolled.includes(courseId)) {
      enrolled.push(courseId);
      await AsyncStorage.setItem(STORAGE_KEYS.ENROLLED_COURSES, JSON.stringify(enrolled));
    }
  },

  async getPreferences(): Promise<AppPreferences> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data
      ? JSON.parse(data)
      : { theme: "dark", notifications: true, lastOpenedAt: new Date().toISOString() };
  },

  async savePreferences(prefs: Partial<AppPreferences>): Promise<void> {
    const current = await this.getPreferences();
    await AsyncStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify({ ...current, ...prefs })
    );
  },

  async updateLastOpened(): Promise<void> {
    await this.savePreferences({ lastOpenedAt: new Date().toISOString() });
  },

  async getLastOpened(): Promise<string | null> {
    const prefs = await this.getPreferences();
    return prefs.lastOpenedAt ?? null;
  },
};
