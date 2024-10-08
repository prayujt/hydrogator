import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccountScreen() {
  const router = useRouter();

  const onSignOut = async () => {
    try {
      // Remove the JWT token from AsyncStorage
      await AsyncStorage.removeItem("token");
  
      // Navigate back to the sign-in screen
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
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
