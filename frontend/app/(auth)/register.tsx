// app/(auth)/register.tsx

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Link, useRouter } from "expo-router";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onRegister = () => {
    // Email format validation
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // TODO: Add registration logic
    // On successful registration, navigate to the main tabs
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-2xl font-bold text-center mb-8">Register</Text>

      <View className="mb-4">
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

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Password</Text>
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="border border-gray-300 rounded px-3 py-2"
        />
      </View>

      <Pressable onPress={onRegister} className="bg-green-500 rounded py-3 mb-4">
        <Text className="text-white text-center font-semibold">Register</Text>
      </Pressable>

      <Link href="./sign-in">
        <Text className="text-blue-500 text-center">
          Already have an account? Sign In
        </Text>
      </Link>
    </View>
  );
}