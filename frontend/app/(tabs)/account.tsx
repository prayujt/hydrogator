// account.tsx
import { Button, ButtonText } from "@/components/ui/button";

import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AccountScreen() {
  const router = useRouter();

  const onSignOut = async () => {
    try {
      // Remove the JWT token from AsyncStorage
      await AsyncStorage.removeItem("token");

      // Navigate back to the sign-in screen
      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-4">
      <Text className="text-3xl font-bold mb-4">Account Settings</Text>

      <Button onPress={() => router.push("./edit-profile")} className="">
        <ButtonText className="text-white text-center font-medium text-sm">
          Edit Profile
        </ButtonText>
      </Button>

      <Button
        variant="solid"
        onPress={onSignOut}
        className="rounded mt-4 bg-red-500"
      >
        <ButtonText className="text-white text-center font-medium text-sm">
          Sign Out
        </ButtonText>
      </Button>
    </View>
  );
}
