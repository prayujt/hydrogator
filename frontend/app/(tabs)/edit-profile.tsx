// app/edit-profile.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_HOST } from "../../constants/vars";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
};

interface BodyData {
  username?: string;
  email?: string;
  newPassword?: string;
}

export default function EditProfileScreen() {
  const [userToken, setUserToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false); // Toggle password visibility
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,20}$/;
  const validatePassword = (text: string) => {
    // At least 8 characters, one uppercase letter, one lowercase letter, and one number
    if (!passwordRegex.test(text)) {
      setPasswordError(
        "Password must be between 8 and 20 characters and contain one uppercase letter, one lowercase letter, and one number."
      );
    } else {
      setPasswordError("");
    }
    setPassword(text);
  };

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // Handle token not found, maybe navigate to login
        return;
      }
      setUserToken(token);
      // const response = await fetch("https://your-api-url.com/api/user/profile", {
      //   method: "GET",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   setUsername(data.username);
      //   setEmail(data.email);
      // } else {
      //   // Handle error
      //   console.error("Failed to fetch profile");
      // }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const updatePassword = async () => {
    setLoading(true);
    try {
      // Build the request body with only the fields that have changed or are valid
      const bodyData: BodyData = {};
      if (passwordRegex.test(password)) {
        bodyData.newPassword = password;
      }

      // Check if there are any fields to update
      if (Object.keys(bodyData).length === 0) {
        showAlert("No changes detected", "Please make changes before saving.");
        setLoading(false);
        return;
      }

      // Make the API call to update the profile
      const profileResponse = await fetch(`${API_HOST}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify(bodyData),
      });

      
    const { username, email, newPassword } = bodyData;
    // Log each field's value
    console.log("Username:", username);
    if (username !== undefined && (typeof username !== "string" || username.trim() === "")) {
      console.log("Bad");
  } else{
    console.log("Good")
  }
    console.log("Email:", email);
    console.log("New Password:", newPassword);

      console.log(JSON.stringify(bodyData));
      // console.log(userToken);

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        showAlert("Error", errorData.message || "Failed to update profile");
        setLoading(false);
        return;
      }

      showAlert("Success", "Profile updated!");

      // Update original values to the new ones
      // if (usernameHasChanged) {
      //   setOriginalUsername(username);
      // }
      // if (emailHasChanged) {
      //   setOriginalEmail(email);
      // }

      // Clear password fields after successful update
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordFields(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 py-4">
      <Text className="text-3xl font-bold mb-6 text-center">Edit Profile</Text>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={{ marginBottom: 20 }}
        />
      )}

      <View className="mb-6">
        <Text className="text-gray-700 mb-2">New Password</Text>
        <Input>
          <InputField
            testID="passwordInput"
            placeholder="Enter your password"
            value={password}
            onChangeText={validatePassword}
            secureTextEntry={!passwordVisible} // Toggle secureTextEntry based on visibility
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
        {passwordError ? (
          <Text testID="passwordErrorField" className="text-red-500">
            {passwordError}
          </Text>
        ) : null}
      </View>
      <Button
        onPress={updatePassword}
        className="mb-6 p-3 rounded"
        testID="updatePasswordButton"
      >
        <ButtonText className="text-white text-center font-medium text-sm">
          Update Password
        </ButtonText>
      </Button>
      
    </ScrollView>
  );
}

