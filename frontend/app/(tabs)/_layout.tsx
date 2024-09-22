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
          let iconName: "home" | "home-outline" | "map" | "map-outline" | "person" | "person-outline" | "ellipse" | "create" | "create-outline";

          if (route.name === "home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "account") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name == "edit-profile") {
            iconName = focused ? "create" : "create-outline";
          }
          else {
            iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#007aff",
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="map" options={{ title: "Find Fountains" }} />
      <Tabs.Screen name="account" options={{ title: "Account" }} />
      <Tabs.Screen name="edit-profile" options={{ title: "Edit Profile" }} />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarButton: () => null, // Hides this tab from the bottom bar
        }}
      />
      {/* <Tabs.Screen
        name="fountain/[id]"
        options={{
          title: "Fountain",
          tabBarButton: () => null, // Hides this tab from the bottom bar
        }}
      /> */}
    </Tabs>
  );
}
