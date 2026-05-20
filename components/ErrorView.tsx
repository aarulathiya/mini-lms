// components/ErrorView.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <View className="mx-5 my-3 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="text-red-400 font-semibold text-sm">⚠️ Error</Text>
        <Text className="text-red-300 text-xs mt-1">{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-red-500/20 px-3 py-2 rounded-lg ml-3"
        >
          <Text className="text-red-300 font-semibold text-sm">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
