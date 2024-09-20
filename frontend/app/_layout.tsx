// app/_layout.tsx

import { Slot, Stack, useRouter, Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // TODO: Replace with your authentication logic
    // For now, we assume user is not logged in
    if (isLoggedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoggedIn]);

  return (
    <View className="flex-1">
      <Slot />
    </View>
  );
}
