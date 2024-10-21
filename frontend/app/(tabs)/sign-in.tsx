import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For the eye icon
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_HOST } from "../../constants/vars";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility state
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSignIn = async () => {
    // Basic validation
    if (!email || !password) {
      showAlert("Error", "Please enter both email and password.");
      return;
    }

    // Email format validation
    if (!emailRegex.test(email)) {
      showAlert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(`${API_HOST}/signIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // On successful registration, navigate to the main tabs
        console.log("Successfully signed in");
        console.log(data);
        // Store the JWT token securely
        await AsyncStorage.setItem("token", data.token);

        router.replace("/(tabs)");
      } else {
        // Handle error response
        showAlert(
          "Incorrect email or password",
          data.message || "Registration failed",
        );
      }
    } catch (error) {
      // Handle network or other errors
      showAlert(
        "Error with backend server",
        "An error occurred while registering. Please try again.",
      );
    }
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
        <View className="flex-row items-center border border-gray-300 rounded px-3 py-2">
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            className="flex-1"
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </View>

      <Pressable onPress={onSignIn} className="bg-blue-500 rounded py-3 mb-4">
        <Text className="text-white text-center font-semibold">Sign In</Text>
      </Pressable>

      <Link href="./forgot-password" className="mb-4">
        <Text className="text-blue-500 text-center">Forgot your password?</Text>
      </Link>

      <Link href="./register">
        <Text className="text-blue-500 text-center">
          Don't have an account? Register
        </Text>
      </Link>
    </View>
  );
}
