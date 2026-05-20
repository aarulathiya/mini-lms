// types/index.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: {
    url: string;
    localPath: string;
  };
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  rating: number;
  category: string;
  instructor: Instructor;
  isBookmarked?: boolean;
  isEnrolled?: boolean;
  enrolledAt?: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  gender: string;
}

export interface RandomProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

export interface RandomUser {
  id: number;
  name: string;
  email: string;
  username: string;
  profileImage: string;
  gender: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: {
    data: T[];
    page: number;
    limit: number;
    totalPages: number;
    previousPage: boolean;
    nextPage: boolean;
    serialNumberStartFrom: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    totalItems: number;
  };
  message: string;
  statusCode: number;
  success: boolean;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export interface AppPreferences {
  theme: "dark" | "light";
  notifications: boolean;
  lastOpenedAt: string;
}
