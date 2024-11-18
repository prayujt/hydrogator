import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeftIcon } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { View, ScrollView, Pressable } from "react-native";
import { API_HOST } from "@/constants/vars";
import { Input, InputField } from "@/components/ui/input";

export default function CreateReview() {
  const { id: fountainId } = useLocalSearchParams();
  const router = useRouter();

  const [review, setReview] = useState({
    taste: 0,
    temperature: 0,
    flow: 0,
    filterStatus: 1,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStarPress = (
    type: "taste" | "temperature" | "flow",
    rating: number
  ) => {
    setReview((prev) => ({ ...prev, [type]: rating }));
  };

  const handleFilterStatusChange = (status: number) => {
    setReview((prev) => ({ ...prev, filterStatus: status }));
  };

  const renderStarRating = (
    type: "taste" | "temperature" | "flow",
    value: number
  ) => {
    return (
      <HStack className="space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => handleStarPress(type, star)}>
            <Text
              className={`text-2xl ${
                star <= value ? "text-yellow-500" : "text-gray-300"
              }`}
            >
              ★
            </Text>
          </Pressable>
        ))}
      </HStack>
    );
  };

  const submitReview = async () => {
    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw Error("No token found");

      const response = await fetch(
        `${API_HOST}/fountains/${fountainId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...review,
            fountainId,
          }),
        }
      );

      if (!response.ok) throw Error("Failed to submit review");

      router.push(`/fountain/${fountainId}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <VStack className="p-4 space-y-6">
          <Button
            variant="link"
            onPress={() => router.back()}
            className="mr-auto"
          >
            <ButtonIcon as={ArrowLeftIcon} className="h-5 w-5 text-gray-900" />
            <ButtonText className="text-gray-900">Go Back</ButtonText>
          </Button>

          <Heading className="text-xl text-center text-gray-900 font-bold">
            Create Review
          </Heading>

          <VStack className="space-y-6">
            {/* Taste Rating */}
            <VStack className="space-y-2">
              <Text className="text-gray-600 font-medium">Taste Rating</Text>
              {renderStarRating("taste", review.taste)}
            </VStack>

            {/* Temperature Rating */}
            <VStack className="space-y-2">
              <Text className="text-gray-600 font-medium">
                Temperature Rating
              </Text>
              {renderStarRating("temperature", review.temperature)}
            </VStack>

            {/* Flow Rating */}
            <VStack className="space-y-2">
              <Text className="text-gray-600 font-medium">Flow Rating</Text>
              {renderStarRating("flow", review.flow)}
            </VStack>

            {/* Filter Status */}
            <VStack className="space-y-2">
              <Text className="text-gray-600 font-medium">Filter Status</Text>
              <VStack className="space-y-2">
                {[
                  { value: 2, label: "Good", color: "bg-green-500" },
                  { value: 1, label: "OK", color: "bg-yellow-500" },
                  { value: 0, label: "Needs Replacement", color: "bg-red-500" },
                ].map((status) => (
                  <Pressable
                    key={status.value}
                    onPress={() => handleFilterStatusChange(status.value)}
                    className={`${status.color} ${
                      review.filterStatus === status.value
                        ? "opacity-100"
                        : "opacity-50"
                    } rounded-full py-2`}
                  >
                    <Text className="text-white text-center">
                      {status.label}
                    </Text>
                  </Pressable>
                ))}
              </VStack>
            </VStack>

            {/* Comment Input */}
            <VStack className="space-y-2">
              <Text className="text-gray-600 font-medium">Comment</Text>
              <Input>
                <InputField
                  placeholder="Share your thoughts about this water fountain..."
                  multiline
                  value={review.comment}
                  onChangeText={(text) =>
                    setReview((prev) => ({ ...prev, comment: text }))
                  }
                  className="border border-gray-300 rounded-lg p-3 pb-8"
                  numberOfLines={4}
                />
              </Input>
            </VStack>

            {/* Submit Button */}
            <Button
              onPress={submitReview}
              disabled={isSubmitting}
              className="py-3 rounded-lg"
            >
              <ButtonText className="text-white font-medium">
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </View>
  );
}
