import React, { useEffect, useState } from "react";
import { Tabs, useRootNavigationState  } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabsLayout() {
  const [user, setUser] = useState(false);
  const navigationState = useRootNavigationState(); // Used to track route changes

  const isUserSignedIn = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      setUser(!!token); // If token exists, set user to true; otherwise, false
    } catch (error) {
      console.error("Error checking user sign-in status:", error);
    }
  };

  // Check token when navigation state changes
  useEffect(() => {
    isUserSignedIn();
  }, [navigationState]);
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"];

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "account") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "edit-profile") {
            iconName = focused ? "create" : "create-outline";
          } else if (route.name === "sign-in") {
            iconName = focused ? "log-in" : "log-in-outline";
          } else if (route.name === "register") {
            iconName = focused ? "person-add" : "person-add-outline";
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Find Fountains",
        }}
      />

        
      <Tabs.Screen
        name="sign-in"
        options={{
          title: "Sign In",
          href: user ? null : "/sign-in",
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "Register",
          href: user ? null : "/register",
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          href: user ? "/account" : null,

        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          title: "Edit Profile",
          href: null,
        }}
      />

      {/* Hidden tabs */}
      <Tabs.Screen
        name="forgot-password"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="water-fountain/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
