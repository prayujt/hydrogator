import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Link, useRouter } from "expo-router";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSignIn = () => {
    // Basic validation
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

     // Email format validation
     if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // TODO: Add authentication logic
    router.replace("/(tabs)");
  };


  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-center mb-8">Sign In</Text>

      <View className="mb-4 text-white">
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

      <Pressable onPress={onSignIn} className="bg-blue-500 rounded py-3 mb-4">
        <Text className="text-white text-center font-semibold">Sign In</Text>
      </Pressable>

      <Pressable onPress={() => router.push("./forgot-password")} className="mb-4">
        <Text className="text-blue-500 text-center">Forgot your password?</Text>
      </Pressable>

      <Link href="./register">
        <Text className="text-blue-500 text-center">
          Don't have an account? Register
        </Text>
      </Link>
    </View>
  );
}
