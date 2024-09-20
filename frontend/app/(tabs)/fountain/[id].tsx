// app/(tabs)/fountain/[id].tsx

import React from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function FountainDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View>
      <Text>Fountain ID: {id}</Text>
      {/* Rest of your component */}
    </View>
  );
}
