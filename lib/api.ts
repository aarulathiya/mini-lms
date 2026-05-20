// lib/api.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL, MAX_RETRY_ATTEMPTS, REQUEST_TIMEOUT, RETRY_DELAY, STORAGE_KEYS } from "../constants/index";

interface RetryConfig extends AxiosRequestConfig {
  _retryCount?: number;
}

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor — attach token
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — handle 401 refresh + retry
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest: RetryConfig = error.config ?? {};

      // Handle 401 — attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retryCount) {
        try {
          const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/api/v1/users/refresh-token`, {
              refreshToken,
            });
            const { accessToken } = response.data.data;
            await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${accessToken}`,
            };
            return client(originalRequest);
          }
        } catch {
          await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
          await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        }
      }

      // Retry logic for network errors
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;

      const isNetworkError = !error.response;
      const isServerError = error.response?.status >= 500;

      if (
        (isNetworkError || isServerError) &&
        originalRequest._retryCount <= MAX_RETRY_ATTEMPTS
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY * originalRequest._retryCount!)
        );
        return client(originalRequest);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();
