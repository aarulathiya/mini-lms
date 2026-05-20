// components/OfflineBanner.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useNetwork } from "../hooks/useNetwork";

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isConnected ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, slideAnim]);

  return (
    <Animated.View
      style={{ transform: [{ translateY: slideAnim }] }}
      className="bg-red-600 px-4 py-2 flex-row items-center justify-center gap-2"
    >
      <Text className="text-white font-semibold text-sm">
        📵 No internet connection
      </Text>
    </Animated.View>
  );
}
