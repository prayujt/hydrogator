// app/edit-profile.tsx

import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";

export default function EditProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const saveProfile = () => {
    // TODO: Save profile changes
    alert("Profile updated!");
  };

  return (
    <View className="flex-1 bg-white px-6 py-4">
      <Text className="text-3xl font-bold mb-4">Edit Profile</Text>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Name</Text>
        <TextInput
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded px-3 py-2"
          inputMode="email"
          autoCapitalize="none"
        />
      </View>

      <Pressable onPress={saveProfile} className="bg-green-500 rounded py-3">
        <Text className="text-white text-center font-semibold">Save Changes</Text>
      </Pressable>
    </View>
  );
}
