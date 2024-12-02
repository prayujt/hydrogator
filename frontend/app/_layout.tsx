// app/_layout.tsx

import { Slot, useRouter } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useEffect, useState } from "react";
import "@/global.css";
import { MapDataProvider } from "@/context/MapDataContext"; // Adjust the import path as needed
import { ReviewProvider } from "@/context/ReviewContext"; // Adjust the import path as needed

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("./sign-in");
    }
  }, [isLoggedIn]);

  return (
    <MapDataProvider>
      <ReviewProvider>
        <GluestackUIProvider mode="light">
          <Slot />
        </GluestackUIProvider>
      </ReviewProvider>
    </MapDataProvider>
  );
}
