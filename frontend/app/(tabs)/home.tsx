// app/(tabs)/home.tsx

import React from "react";
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-3xl font-bold text-center mb-4">
        Welcome to the Water Fountain App!
      </Text>
      <Text className="text-center text-gray-700">
        Discover and rate water fountains around the University of Florida campus.
      </Text>
    </View>
  );
}
