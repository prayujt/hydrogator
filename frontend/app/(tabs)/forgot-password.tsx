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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // For the eye icon
import { API_HOST } from "../../constants/vars";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // Password visibility toggle
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false); // Confirm password visibility toggle
  const [step, setStep] = useState(1); // Track the current step
  const [validResetCode, setValidResetCode] = useState(false); // Did the user submit the valid reset code

  const router = useRouter();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSubmitEmail = async () => {
    if (!email) {
      showAlert("Error", "Please enter your email address.");
      return;
    }

    // Email format validation
    if (!emailRegex.test(email)) {
      showAlert("Error", "Please enter a valid email address.");
      return;
    }

    try {
      const response = await fetch(`${API_HOST}/generateForgot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(
          "Success",
          data.message || "A password reset code has been sent to your email",
        );
        setStep(2);
      } else {
        showAlert("Error", data.message || "Could not send reset code");
      }
    } catch (error) {
      showAlert(
        "Error with backend server",
        "An error occurred. Please try again.",
      );
    }
  };

  const onSubmitCode = async () => {
    if (!resetCode) {
      showAlert("Error", "Please enter the 6-digit reset code.");
      return;
    }

    try {
      const response = await fetch(`${API_HOST}/validateForgot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: resetCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("Success", `The correct reset code was entered`);
        setValidResetCode(true);
        setStep(3);
      } else {
        setValidResetCode(false);
        showAlert("Error", data.message || "Could not validate the reset code");
      }
    } catch (error) {
      setValidResetCode(false);
      showAlert(
        "Error with backend server",
        "An error occurred. Please try again.",
      );
    }
  };

  const onSubmitNewPassword = async () => {
    if (!validResetCode) {
      showAlert("Error", "Incorrect reset code was submitted.");
      return;
    }

    if (!password || !confirmPassword) {
      showAlert("Error", "Please enter both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${API_HOST}/resetPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: resetCode,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert("Success", `Your password was reset`);
        setValidResetCode(true);
        setStep(3);
      } else {
        setValidResetCode(false);
        showAlert("Error", data.message || "Could not reset your password");
      }
    } catch (error) {
      setValidResetCode(false);
      showAlert(
        "Error with backend server",
        "An error occurred. Please try again.",
      );
    }

    showAlert("Success", "Your password has been reset.");
    console.log(password);
    router.replace("/sign-in");
  };

  const onGoBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-center mb-8">
        {step === 1
          ? "Forgot Password"
          : step === 2
          ? "Enter Reset Code"
          : "Reset Password"}
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
          <Text className="text-gray-700 mb-2">
            Enter the 6-digit code sent to your email
          </Text>
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
                  color:
                    password === confirmPassword || confirmPassword === ""
                      ? "black"
                      : "#bc1b13", // Change text color if passwords don't match
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              >
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
        <Pressable
          onPress={onSubmitEmail}
          className="bg-blue-500 rounded py-3 mb-4"
        >
          <Text className="text-white text-center font-semibold">Submit</Text>
        </Pressable>
      )}

      {step === 2 && (
        <Pressable
          onPress={onSubmitCode}
          className="bg-blue-500 rounded py-3 mb-4"
        >
          <Text className="text-white text-center font-semibold">
            Submit Code
          </Text>
        </Pressable>
      )}

      {step === 3 && (
        <Pressable
          onPress={onSubmitNewPassword}
          className="bg-blue-500 rounded py-3 mb-4"
        >
          <Text className="text-white text-center font-semibold">
            Reset Password
          </Text>
        </Pressable>
      )}

      <Pressable onPress={onGoBack} className="bg-gray-400 rounded py-3 mb-4">
        <Text className="text-white text-center font-semibold">Go Back</Text>
      </Pressable>
    </View>
  );
}
