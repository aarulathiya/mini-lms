// components/HomeHeader.tsx
import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Ionicons } from "@expo/vector-icons";

export default function HomeHeader() {
  return (
    <View className="px-5 pt-4 pb-4 flex-row items-center justify-between">

      <View className="flex-row items-center" style={{ gap: 10 }}>
        <LinearGradient
          colors={["#a78bfa", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="book" size={20} color="#ffffff" />
        </LinearGradient>

        <MaskedView
          maskElement={
            <Text style={{ fontSize: 28, fontWeight: "800", letterSpacing: -0.5 }}>
              LMS
            </Text>
          }
        >
          <LinearGradient
            colors={["#a78bfa", "#7c3aed", "#c084fc"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={{ fontSize: 28, fontWeight: "800", letterSpacing: -0.5, opacity: 0 }}>
              LMS
            </Text>
          </LinearGradient>
        </MaskedView>
      </View>

      <LinearGradient
        colors={["#1a1625", "#2e2640"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#2e2640",
        }}
      >
        <Ionicons name="notifications-outline" size={20} color="#a78bfa" />
      </LinearGradient>

    </View>
  );
}