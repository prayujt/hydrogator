import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For the eye icon

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState('');

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState('');

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); // Toggle password visibility
  
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

  const validateUsername = (text: string) => {
    // Alphanumeric, underscores, and dashes, between 3-20 characters    
    if (!usernameRegex.test(text)) {
      setUsernameError(
        'Username must be between 3 and 20 alphanumeric characters.'
      );
    } else {
      setUsernameError('');
    }
    setUsername(text);
  };

  const validateEmail = (text: string) => {
    if (!emailRegex.test(text)) {
      setEmailError(
        'Enter a valid email address.'
      );
    } else {
      setEmailError('');
    }
    setEmail(text);
  };

  const validatePassword = (text: string) => {
   // At least 8 characters, one uppercase letter, one lowercase letter, and one number
    if (!passwordRegex.test(text)) {
      setPasswordError(
        'Password must be between 8 and 20 characters and contain one uppercase letter, one lowercase letter, and one number.'
      );
    } else {
      setPasswordError('');
    }
    setPassword(text);
  };
  
  const onRegister = () => {
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    if (!usernameRegex.test(username)) {
      Alert.alert(
        "Error",
        "Username must be at least 8 characters and contain one uppercase letter, one lowercase letter, and one number."
      );
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
        <Text className="text-gray-700 mb-2">Username</Text>
        <TextInput
          placeholder="Enter your username"
          value={username}
          onChangeText={validateUsername}
          className="border border-gray-300 rounded px-3 py-2"
          autoCapitalize="none"
        />
            {usernameError ? <Text className="text-red-500">{usernameError}</Text> : null}
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={validateEmail}
          className="border border-gray-300 rounded px-3 py-2"
          inputMode="email"
          autoCapitalize="none"
        />
        {emailError ? <Text className="text-red-500">{emailError}</Text> : null}
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded px-3 py-2">
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={validatePassword}
            secureTextEntry={!passwordVisible} // Toggle secureTextEntry based on visibility
            className="flex-1"
          />
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? "eye-off" : "eye"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? <Text className="text-red-500">{passwordError}</Text> : null}
      </View>

      <Pressable onPress={onRegister} className="bg-blue-500 rounded py-3 mb-4">
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
