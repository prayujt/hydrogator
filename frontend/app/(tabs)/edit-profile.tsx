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

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const saveProfile = async () => {
    setLoading(true);
    let validPassword = false;
  
    try {
      // Validate password fields if the user is attempting to change the password
      if (showPasswordFields && newPassword) {
        if (newPassword !== confirmPassword) {
          showAlert("Error", "New password and confirm password do not match");
          setLoading(false);
          return;
        }
        validPassword = true;
      }
  
      // Determine if username or email have changed
      // const usernameHasChanged = username !== originalUsername;
      // const emailHasChanged = email !== originalEmail;
  
      // Build the request body with only the fields that have changed or are valid
      const bodyData: BodyData = {};
  
      // if (usernameHasChanged) {
      if (username.length > 0 && username.length < 4) {
        showAlert("Error", "Please enter a username larger than 3 characters");
        return;
      } else if (username.length > 3) {
        bodyData.username = username;
      }
  

      if (email.length > 0 &&!emailRegex.test(email)) {
        showAlert("Error", "Please enter a valid email address.");
        return;
      } else if (email.length > 0){
        bodyData.email = email;
      }
  
      if (validPassword) {
        bodyData.newPassword = newPassword;
      }
  
      // Check if there are any fields to update
      if (Object.keys(bodyData).length === 0) {
        showAlert("No changes detected", "Please make changes before saving.");
        setLoading(false);
        return;
      }
  
      // Make the API call to update the profile
      const profileResponse = await fetch("http://localhost:3000/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`,
        },
        body: JSON.stringify(bodyData),
      });
  
      console.log(JSON.stringify(bodyData));
      console.log(userToken);

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
        <ActivityIndicator size="large" color="#0000ff" style={{ marginBottom: 20 }} />
      )}

      <View className="mb-6">
        <Text className="text-gray-800 mb-2 text-base font-medium">Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          className="border border-gray-300 rounded-full px-4 py-3 text-base"
          autoCapitalize="none"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-800 mb-2 text-base font-medium">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          className="border border-gray-300 rounded-full px-4 py-3 text-base"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Change Password Button */}
      <Pressable
        onPress={() => setShowPasswordFields(!showPasswordFields)}
        className="bg-gray-200 rounded-full py-3 mb-6"
      >
        <Text className="text-center text-base font-medium text-gray-800">
          {showPasswordFields ? "Cancel Password Change" : "Change Password"}
        </Text>
      </Pressable>

      {showPasswordFields && (
        <View>
          <View className="mb-6">
            <Text className="text-gray-800 mb-2 text-base font-medium">New Password</Text>
            <TextInput
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={setNewPassword}
              className="border border-gray-300 rounded-full px-4 py-3 text-base"
              secureTextEntry
            />
          </View>

          <View className="mb-8">
            <Text className="text-gray-800 mb-2 text-base font-medium">Confirm New Password</Text>
            <TextInput
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              className="border border-gray-300 rounded-full px-4 py-3 text-base"
              secureTextEntry
            />
          </View>
        </View>
      )}

      <Pressable
        onPress={saveProfile}
        className="bg-blue-600 rounded-full py-4 mb-6 shadow-lg"
        disabled={loading}
      >
        <Text className="text-white text-center font-semibold text-lg">
          {loading ? "Saving..." : "Save Changes"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
