// app/auth/register.tsx
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
import { RegisterFormData } from "../../types/index";

const registerSchema = z.object({
  username: z.string().min(3, "Min 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "" },
  });

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      clearError();
      try {
        await register(data);
        Alert.alert("Success", "Account created! Please log in.", [
          { text: "OK", onPress: () => router.replace("/auth/login") },
        ]);
      } catch {
        Alert.alert("Registration Failed", "Username or email may already exist.");
      }
    },
    [register, router, clearError]
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

            {/* LMS Title + Book Icon row */}
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

            {/* Gradient "Create account" */}
            <MaskedView
              maskElement={
                <Text className="text-2xl font-bold mt-3">Create account</Text>
              }
            >
              <LinearGradient
                colors={["#e9d5ff", "#c4b5fd"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-2xl font-bold mt-3 opacity-0">Create account</Text>
              </LinearGradient>
            </MaskedView>

            <Text className="text-sm text-gray-500 mt-1">
              Start your learning journey
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">

            {/* Username */}
            <View>
              <Text className="text-sm font-medium text-violet-300 mb-2">Username</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className={`bg-[#1a1625] text-gray-100 px-4 py-4 rounded-2xl border text-base ${
                      errors.username ? "border-red-400" : "border-[#2e2640]"
                    }`}
                    placeholder="Choose a username"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.username && (
                <Text className="text-red-400 text-xs mt-1">{errors.username.message}</Text>
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-violet-300 mb-2">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value, onBlur } }) => (
                  <TextInput
                    className={`bg-[#1a1625] text-gray-100 px-4 py-4 rounded-2xl border text-base ${
                      errors.email ? "border-red-400" : "border-[#2e2640]"
                    }`}
                    placeholder="your@email.com"
                    placeholderTextColor="#6b7280"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              {errors.email && (
                <Text className="text-red-400 text-xs mt-1">{errors.email.message}</Text>
              )}
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-violet-300 mb-2">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value, onBlur } }) => (
                  <View
                    className={`flex-row items-center bg-[#1a1625] rounded-2xl border ${
                      errors.password ? "border-red-400" : "border-[#2e2640]"
                    }`}
                  >
                    <TextInput
                      className="flex-1 text-gray-100 px-4 py-4 text-base"
                      placeholder="Min 8 characters"
                      placeholderTextColor="#6b7280"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
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
                <Text className="text-red-400 text-xs mt-1">{errors.password.message}</Text>
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
                className="py-4 items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white p-4 font-bold text-base tracking-wide text-center">
                    Create Account
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

          </View>

          {/* Footer */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-500 text-sm">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-violet-400 font-bold text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}