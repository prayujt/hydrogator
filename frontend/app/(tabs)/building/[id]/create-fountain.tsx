import type { Building, Fountain } from "../../../../types";

import { Platform, ScrollView, Switch, View } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { API_HOST } from "@/constants/vars";

import { ArrowLeftIcon } from "lucide-react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

const CreateFountainScreen = () => {
  const router = useRouter();
  const { id: buildingId } = useLocalSearchParams();

  const [building, setBuilding] = useState<Building>();
  const [fountainDescription, setFountainDescription] = useState("");
  const [fountainFloor, setFountainFloor] = useState("1");
  const [fountainBottleFiller, setFountainBottleFiller] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBuilding = async (buildingId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw Error("no token found");
      }

      const response = await fetch(`${API_HOST}/buildings/${buildingId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setBuilding(data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitFountain = async () => {
    try {
      if (!fountainDescription) return;
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw Error("No token found");

      const response = await fetch(`${API_HOST}/fountains`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buildingId,
          description: fountainDescription,
          longitude: building?.longitude,
          latitude: building?.latitude,
          hasBottleFiller: fountainBottleFiller,
          floor: parseInt(fountainFloor),
        }),
      });

      if (!response.ok) throw Error("Failed to create fountain");
      const newFountain: Fountain = await response.json();
      setFountainDescription("");
      setFountainFloor("1");
      setFountainBottleFiller(false);

      router.push(`/fountain/${newFountain.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchBuilding(buildingId as string);
  }, [buildingId]);

  return (
    <ScrollView className="flex-1 bg-white px-6 py-4">
      <View className="mr-auto bg-white px-6 pb-4">
        <Button variant="link" onPress={() => router.push("/")}>
          <ButtonIcon as={ArrowLeftIcon} className="h-5 w-5 text-gray-900" />
          <ButtonText className="text-gray-900">Go Back</ButtonText>
        </Button>
      </View>

      {building && (
        <>
          <VStack className="space-y-1 mb-2">
            <Heading className="text-2xl text-center text-gray-900 font-bold">
              New Fountain
            </Heading>
            <HStack className="justify-center space-x-2">
              <Text className="text-gray-600">{building.name}</Text>
            </HStack>
          </VStack>

          <VStack className="space-y-4">
            {/* Location */}
            <VStack>
              <Text className="text-gray-700 mb-2">Location</Text>
              <Input>
                <InputField
                  testID="fountainLocationInput"
                  placeholder="Enter a description of the fountain location"
                  value={fountainDescription}
                  onChangeText={setFountainDescription}
                />
              </Input>
            </VStack>

            {/* Floor */}
            <VStack>
              <Text className="text-gray-700 mb-2">Floor</Text>
              <Input>
                <InputField
                  testID="fountainFloorInput"
                  placeholder="Enter the floor number"
                  value={fountainFloor}
                  onChangeText={setFountainFloor}
                />
              </Input>
            </VStack>

            {/* Water Bottle Filler */}
            <VStack className="space-y-2">
              <Text className="text-gray-600 font-medium">
                Water Bottle Filler
              </Text>
              <HStack className="items-center space-x-2">
                <Text
                  className={`text-sm ${
                    !fountainBottleFiller ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  No
                </Text>
                <Switch
                  value={fountainBottleFiller}
                  onValueChange={setFountainBottleFiller}
                  trackColor={{ false: "#d1d5db", true: "#3b82f6" }} // gray-300 when off, blue-500 when on
                  thumbColor={fountainBottleFiller ? "#1d4ed8" : "#9ca3af"} // Use blue-700 when on, gray-400 when off
                  ios_backgroundColor="#d1d5db" // gray-300 background for iOS
                  {...Platform.select({
                    web: {
                      activeThumbColor: "white",
                    },
                  })}
                />
                <Text
                  className={`text-sm ${
                    fountainBottleFiller ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  Yes
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Submit Button */}
          <Button
            onPress={submitFountain}
            disabled={isSubmitting}
            className="py-3 rounded-lg mt-8"
          >
            <ButtonText className="text-white font-medium">
              {isSubmitting ? "Creating..." : "Create Fountain"}
            </ButtonText>
          </Button>
        </>
      )}
    </ScrollView>
  );
};

export default CreateFountainScreen;
