// app/(tabs)/_layout.tsx

import React from "react";
import { Tabs } from "expo-router";
import { Ionicons} from "@expo/vector-icons";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: "home" | "home-outline" | "map" | "map-outline" | "person" | "person-outline" | "ellipse";

          if (route.name === "home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "account") {
            iconName = focused ? "person" : "person-outline";
          } else {
            iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007aff",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Find Fountains" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
    </Tabs>
  );
}
