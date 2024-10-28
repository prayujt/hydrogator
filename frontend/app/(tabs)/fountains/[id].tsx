import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { ArrowLeftIcon } from "lucide-react-native";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";

import { API_HOST } from "../../../constants/vars";
import type { Fountain } from "../../../types";

export default function WaterFountainDetail() {
  const { id: fountainId } = useLocalSearchParams(); // Get the dynamic ID from the route
  const router = useRouter();

  const [fountain, setFountain] = useState<Fountain | undefined>(undefined);

  const fetchFountain = async (fountainId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // failed to retrieve token for request
        throw Error("no token found");
      }

      const response = await fetch(`${API_HOST}/fountains/${fountainId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setFountain(await response.json());

      if (!response.ok) {
        return;
      }
    } catch (error) {
      // Handle network or other errors
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFountain(fountainId as string);
  }, [fountainId]);

  return (
    <VStack className="ml-2">
      <Button
        variant="link"
        className="mr-auto"
        onPress={() => router.push("/")}
      >
        <ButtonIcon
          as={ArrowLeftIcon}
          className="h-3 w-3 text-background-900 ml-1"
        />
        <ButtonText className="font-medium text-sm text-typography-900">
          Go Back
        </ButtonText>
      </Button>
      {fountain && (
        <VStack>
          <Heading className="text-center text-typography-800 mb-4">
            {fountain.description}
          </Heading>
          <Heading className="text-md">Reviews</Heading>
        </VStack>
      )}
    </VStack>
  );
}
