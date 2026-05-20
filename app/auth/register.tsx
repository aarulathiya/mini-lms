// app/auth/register.tsx
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
import { RegisterFormData } from "../../types/index";

const registerSchema = z.object({
  username: z.string().min(3, "Min 3 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, clearError } = useAuthStore();

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
      className="flex-1 bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          <View className="mb-10">
            <Text className="text-5xl font-bold text-indigo-400 mb-2">LMS</Text>
            <Text className="text-2xl font-semibold text-white">Create account</Text>
            <Text className="text-slate-400 mt-1">Start your learning journey</Text>
          </View>

          <View className="gap-4">
            {[
              { name: "username" as const, label: "Username", placeholder: "Choose a username" },
              { name: "email" as const, label: "Email", placeholder: "your@email.com" },
              { name: "password" as const, label: "Password", placeholder: "Min 8 characters", secure: true },
            ].map(({ name, label, placeholder, secure }) => (
              <View key={name}>
                <Text className="text-slate-300 mb-2 font-medium">{label}</Text>
                <Controller
                  control={control}
                  name={name}
                  render={({ field: { onChange, value, onBlur } }) => (
                    <TextInput
                      className="bg-slate-800 text-white px-4 py-4 rounded-xl border border-slate-700 text-base"
                      placeholder={placeholder}
                      placeholderTextColor="#64748B"
                      secureTextEntry={secure}
                      autoCapitalize="none"
                      keyboardType={name === "email" ? "email-address" : "default"}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  )}
                />
                {errors[name] && (
                  <Text className="text-red-400 text-sm mt-1">{errors[name]?.message}</Text>
                )}
              </View>
            ))}

            <TouchableOpacity
              className="bg-indigo-500 py-4 rounded-xl mt-2 items-center"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className="text-slate-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-indigo-400 font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
