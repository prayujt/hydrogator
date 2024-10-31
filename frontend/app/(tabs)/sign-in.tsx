import React, { useState } from "react";
import { View, Alert, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

import { EyeIcon, EyeOffIcon } from "lucide-react-native";

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

  const signIn = async () => {
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
        // Store the JWT token securely
        await AsyncStorage.setItem("token", data.token);

        router.replace("/(tabs)");
      } else {
        // Handle error response
        showAlert(
          "Incorrect email or password",
          data.message || "Registration failed"
        );
      }
    } catch (error) {
      // Handle network or other errors
      showAlert(
        "Error with backend server",
        "An error occurred while registering. Please try again."
      );
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Heading className="text-2xl text-center mb-8">Sign In</Heading>

      <View className="mb-4">
        <Text className="text-gray-700 mb-2">Email</Text>
        <Input>
          <InputField
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            inputMode="email"
            autoCapitalize="none"
          />
        </Input>
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Password</Text>
        <Input>
          <InputField
            placeholder="Enter your password"
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChangeText={setPassword}
          />
          <InputSlot
            className="pr-3"
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <InputIcon
              as={passwordVisible ? EyeIcon : EyeOffIcon}
              className="text-darkBlue-500"
            />
          </InputSlot>
        </Input>
      </View>

      <Button className="mb-6 p-3 rounded" onPress={signIn} testID="signInButton">
        <ButtonText className="text-white text-center font-medium text-sm">
          Sign In
        </ButtonText>
      </Button>

      <Link href="./forgot-password" className="mb-4">
        <Text className="text-sm text-blue-500 text-center">
          Forgot your password?
        </Text>
      </Link>

      <Link href="./register">
        <Text className="text-sm text-blue-500 text-center">
          Don't have an account? Register
        </Text>
      </Link>
    </View>
  );
}
