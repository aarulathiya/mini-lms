// app/auth/login.tsx
import React, { useCallback } from "react";
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
import { useAuthStore } from "../../store/authStore";
import { LoginFormData } from "../../types/index";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, clearError } = useAuthStore();

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
      className="flex-1 bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="mb-10">
            <Text className="text-5xl font-bold text-indigo-400 mb-2">LMS</Text>
            <Text className="text-2xl font-semibold text-white">Welcome back</Text>
            <Text className="text-slate-400 mt-1">Sign in to continue learning</Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            <View>
              <Text className="text-slate-300 mb-2 font-medium">Username</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-base"
                    placeholder="Enter username"
                    placeholderTextColor="#64748B"
                    autoCapitalize="none"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.username && (
                <Text className="text-red-400 text-sm mt-1">{errors.username.message}</Text>
              )}
            </View>

            <View>
              <Text className="text-slate-300 mb-2 font-medium">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-base"
                    placeholder="Enter password"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.password && (
                <Text className="text-red-400 text-sm mt-1">{errors.password.message}</Text>
              )}
            </View>

            <TouchableOpacity
              className="bg-indigo-500 py-4 rounded-xl mt-2 items-center"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Demo hint */}
            <View className="bg-slate-800 rounded-xl p-4 mt-2 border border-slate-700">
              <Text className="text-slate-400 text-sm text-center">
                Demo: username <Text className="text-indigo-400">johnd</Text> / password <Text className="text-indigo-400">m38rmF$</Text>
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-slate-400">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text className="text-indigo-400 font-semibold">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
