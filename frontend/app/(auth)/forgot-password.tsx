import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For the eye icon

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility toggle
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // Confirm password visibility toggle
  const [step, setStep] = useState(1); // Track the current step
  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const generateCode = () => {
    // Generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const onSubmitEmail = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    // Email format validation
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

    // Generate and save a reset code
    const code = generateCode();
    setGeneratedCode(code);
    Alert.alert("Success", `A password reset code has been sent to your email. Code: ${code}`);
    console.log(code);
    // Move to step 2 (enter code)
    setStep(2);
  };

  const onSubmitCode = () => {
    if (!resetCode) {
      Alert.alert("Error", "Please enter the 6-digit reset code.");
      return;
    }

    if (resetCode !== generatedCode) {
      Alert.alert("Error", "The code you entered is incorrect.");
      return;
    }

    // Move to step 3 (enter new password)
    setStep(3);
  };

  const onSubmitNewPassword = () => {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please enter both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    // TODO: Add logic to handle password reset

    Alert.alert("Success", "Your password has been reset.");
    router.replace("/(tabs)"); // Redirect to the login or home screen
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-center mb-8">
        {step === 1 ? "Forgot Password" : step === 2 ? "Enter Reset Code" : "Reset Password"}
      </Text>

      {step === 1 && (
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
      )}

      {step === 2 && (
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Enter the 6-digit code sent to your email</Text>
          <TextInput
            placeholder="Enter reset code"
            value={resetCode}
            onChangeText={setResetCode}
            className="border border-gray-300 rounded px-3 py-2"
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      )}

      {step === 3 && (
        <>
          <View className="mb-6">
            <Text className="text-gray-700 mb-2">New Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded px-3 py-2">
              <TextInput
                placeholder="Enter new password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible} // Toggle password visibility
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
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2">Confirm New Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded px-3 py-2">
              <TextInput
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!confirmPasswordVisible} // Toggle password visibility for confirm field
                className="flex-1"
                style={{
                  color: password === confirmPassword || confirmPassword === "" ? "black" : "#bc1b13", // Change text color if passwords don't match
                }}
              />
              <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                <Ionicons
                  name={confirmPasswordVisible ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {step === 1 && (
        <Pressable onPress={onSubmitEmail} className="bg-blue-500 rounded py-3 mb-4">
          <Text className="text-white text-center font-semibold">Submit</Text>
        </Pressable>
      )}

      {step === 2 && (
        <Pressable onPress={onSubmitCode} className="bg-blue-500 rounded py-3 mb-4">
          <Text className="text-white text-center font-semibold">Submit Code</Text>
        </Pressable>
      )}

      {step === 3 && (
        <Pressable onPress={onSubmitNewPassword} className="bg-blue-500 rounded py-3 mb-4">
          <Text className="text-white text-center font-semibold">Reset Password</Text>
        </Pressable>
      )}
    </View>
  );
}
