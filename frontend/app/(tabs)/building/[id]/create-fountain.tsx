import type { Building, Fountain } from "../../../../types";

import { ScrollView, View } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
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

  useEffect(() => {
    fetchBuilding(buildingId as string);
  }, [buildingId]);

  return (
    <ScrollView className="flex-1 bg-white px-6 py-4">
      <View className="mr-auto bg-white px-6">
        <Button variant="link" onPress={() => router.push("/")}>
          <ButtonIcon as={ArrowLeftIcon} className="h-5 w-5 text-gray-900" />
          <ButtonText className="text-gray-900">Go Back</ButtonText>
        </Button>
      </View>

      {building && (
        <>
          <VStack className="space-y-1 mb-2">
            <Heading className="text-2xl text-center text-gray-900 font-bold">
              {building.name}
            </Heading>
          </VStack>
        </>
      )}
    </ScrollView>
  );
};

export default CreateFountainScreen;
