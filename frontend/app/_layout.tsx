// app/_layout.tsx

import { Slot, Stack, useRouter, Redirect } from "expo-router";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // TODO: Replace with your authentication logic
    // For now, we assume user is not logged in
    if (isLoggedIn) {
      router.replace("./sign-in");
    }
  }, [isLoggedIn]);

  return (
    <GluestackUIProvider mode="light"><View className="flex-1">
        <Slot />
      </View></GluestackUIProvider>
  );
}
