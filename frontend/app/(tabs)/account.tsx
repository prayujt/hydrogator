// app/(tabs)/account.tsx

import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function AccountScreen() {
  const router = useRouter();

  const onSignOut = () => {
    // TODO: Handle sign-out logic
    // Navigate back to sign-in screen
    router.replace("/(auth)/sign-in");
  };

  return (
    <View className="flex-1 bg-white px-6 py-4">
      <Text className="text-3xl font-bold mb-4">Account Settings</Text>

      <Pressable
        onPress={() => router.push("./edit-profile")}
        className="bg-gray-200 rounded py-3 px-4 mb-4"
      >
        <Text className="text-gray-800">Edit Profile</Text>
      </Pressable>

      <Pressable onPress={onSignOut} className="bg-red-500 rounded py-3 px-4">
        <Text className="text-white text-center font-semibold">Sign Out</Text>
      </Pressable>
    </View>
  );
}
