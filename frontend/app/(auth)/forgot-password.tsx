// app/(auth)/forgot-password.tsx

import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSubmit = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    // Email format validation
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // TODO: Add logic to handle sending the reset code to the email
    Alert.alert("Success", "A password reset code has been sent to your email.");
    // Navigate to a page where user can enter the reset code
    // router.push("/(auth)/enter-reset-code");
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-center mb-8">Forgot Password</Text>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Enter your email address</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded px-3 py-2"
          inputMode="email"
          autoCapitalize="none"
        />
      </View>

      <Pressable onPress={onSubmit} className="bg-blue-500 rounded py-3 mb-4">
        <Text className="text-white text-center font-semibold">Submit</Text>
      </Pressable>
    </View>
  );
}