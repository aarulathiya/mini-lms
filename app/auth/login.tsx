// app/auth/login.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { useAuthStore } from "../../store/authStore";
import { LoginFormData } from "../../types/index";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      clearError();
      try {
        await login(data);
        router.replace("/(tabs)");
      } catch {
        Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      }
    },
    [login, router, clearError]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#0d0b14]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">

          {/* Header */}
          <View className="mb-10">
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <MaskedView
                maskElement={
                  <Text className="text-6xl font-extrabold tracking-tight leading-tight">
                    LMS
                  </Text>
                }
              >
                <LinearGradient
                  colors={["#a78bfa", "#7c3aed", "#c084fc"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text className="text-6xl font-extrabold tracking-tight leading-tight opacity-0">
                    LMS
                  </Text>
                </LinearGradient>
              </MaskedView>

              {/* Book icon with gradient pill */}
              <LinearGradient
                colors={["#a78bfa", "#7c3aed"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
              >
                <Ionicons name="book" size={24} color="#ffffff" />
              </LinearGradient>
            </View>

            {/* Gradient Welcome text */}
            <MaskedView
              maskElement={
                <Text className="text-2xl font-bold mt-1">
                  Welcome back
                </Text>
              }
            >
              <LinearGradient
                colors={["#e9d5ff", "#c4b5fd"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-2xl font-bold mt-1 opacity-0">
                  Welcome back
                </Text>
              </LinearGradient>
            </MaskedView>

            <Text className="text-sm text-gray-500 mt-1">
              Sign in to continue learning
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">

            {/* Username */}
            <View>
              <Text className="text-sm font-medium text-violet-300 mb-2">
                Username
              </Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className={`bg-[#1a1625] text-gray-100 px-4 py-4 rounded-2xl border text-base ${errors.username ? "border-red-400" : "border-[#2e2640]"
                      }`}
                    placeholder="Enter username"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.username && (
                <Text className="text-red-400 text-xs mt-1">
                  {errors.username.message}
                </Text>
              )}
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-violet-300 mb-2">
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View
                    className={`flex-row items-center bg-[#1a1625] rounded-2xl border ${errors.password ? "border-red-400" : "border-[#2e2640]"
                      }`}
                  >
                    <TextInput
                      className="flex-1 text-gray-100 px-4 py-4 text-base"
                      placeholder="Enter password"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showPassword}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="pr-4 pl-2"
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="#9ca3af"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.password && (
                <Text className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.85}
              className="mt-2 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={["#7c3aed", "#9333ea", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center rounded-2xl"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white p-4 font-bold text-base tracking-wide text-center">
                    Sign In
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500 text-sm">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text className="text-violet-400 font-bold text-sm">Register</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}