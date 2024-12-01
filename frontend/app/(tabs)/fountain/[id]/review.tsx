import { useEffect, useState } from "react";
import { View, ScrollView, Pressable, Switch, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeftIcon } from "lucide-react-native";
import Slider from "@react-native-community/slider";

import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";

import { API_HOST } from "@/constants/vars";

import type { Fountain } from "../../../../types";

interface Review {
  id: string;
  comment: string;
  taste: number;
  temperature: number;
  flow: number;
  filterStatus: number;
  createdAt: string;
  user: {
    name: string;
  };
}

interface FountainWithReviews extends Fountain {
  buildingName: string;
  reviews: Review[];
}

export default function CreateReview() {
  const { id: fountainId } = useLocalSearchParams();
  const router = useRouter();
  const [fountain, setFountain] = useState<FountainWithReviews>();

  const [review, setReview] = useState({
    taste: 0,
    temperature: 0,
    flow: 0,
    filterStatus: 2,
    hasBottleFiller: false,
    comment: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFountain = async (fountainId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw Error("no token found");
      }

      const response = await fetch(`${API_HOST}/fountains/${fountainId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setFountain(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStarPress = (
    type: "taste" | "temperature" | "flow",
    rating: number
  ) => {
    setReview((prev) => ({ ...prev, [type]: rating }));
  };

  const getFilterStatusLabel = (value: number) => {
    if (value <= 0.67) return "Needs Replacement";
    if (value <= 1.33) return "OK";
    return "Good";
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
              className={`text-xl ${
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

  const getFilterStatusColor = (value: number) => {
    if (value <= 0.67) return "bg-red-500";
    if (value <= 1.33) return "bg-yellow-500";
    return "bg-green-500";
  };

  useEffect(() => {
    fetchFountain(fountainId as string);
  }, [fountainId]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <VStack className="p-4 space-y-6">
          <Button
            variant="link"
            onPress={() => router.push(`/fountain/${fountainId}`)}
            className="mr-auto"
          >
            <ButtonIcon as={ArrowLeftIcon} className="h-5 w-5 text-gray-900" />
            <ButtonText className="text-gray-900">Go Back</ButtonText>
          </Button>

          {fountain && (
            <>
              <VStack className="space-y-1 mb-2">
                <Heading className="text-2xl text-center text-gray-900 font-bold">
                  {fountain.buildingName}
                </Heading>
                <HStack className="justify-center space-x-2">
                  <Text className="text-gray-600">Floor {fountain.floor}</Text>
                  <Text className="text-gray-600">•</Text>
                  <Text className="text-gray-600">{fountain.description}</Text>
                </HStack>
              </VStack>

              <VStack className="space-y-2">
                {/* Taste Rating */}
                <VStack>
                  <Text className="text-gray-600 font-medium">Taste</Text>
                  {renderStarRating("taste", review.taste)}
                </VStack>

                {/* Temperature Rating */}
                <VStack>
                  <Text className="text-gray-600 font-medium">Temperature</Text>
                  {renderStarRating("temperature", review.temperature)}
                </VStack>

                {/* Flow Rating */}
                <VStack>
                  <Text className="text-gray-600 font-medium">Flow</Text>
                  {renderStarRating("flow", review.flow)}
                </VStack>

                {/* Filter Status */}
                <VStack className="space-y-2">
                  <Text className="text-gray-600 font-medium">
                    Filter Status
                  </Text>
                  <View className="w-1/2">
                    <View
                      className={`h-3 rounded-full overflow-hidden ${getFilterStatusColor(
                        review.filterStatus
                      )}`}
                      style={{
                        width: `${Math.max(
                          (review.filterStatus / 2) * 100,
                          10
                        )}%`, // Minimum width of 10%
                        backgroundColor:
                          review.filterStatus === 0 ? "#EF4444" : undefined, // Ensure red color for the lowest value
                      }}
                    />
                    <Slider
                      minimumValue={0}
                      maximumValue={2}
                      step={1}
                      value={review.filterStatus}
                      onValueChange={(value) =>
                        setReview((prev) => ({
                          ...prev,
                          filterStatus: Math.floor(value),
                        }))
                      }
                      minimumTrackTintColor="transparent"
                      maximumTrackTintColor="transparent"
                      thumbTintColor="#4B5563"
                    />
                    <Text className="text-center text-sm text-gray-600">
                      {getFilterStatusLabel(review.filterStatus)}
                    </Text>
                  </View>
                </VStack>

                {/* Comment Input */}
                <VStack className="space-y-2">
                  <Text className="text-gray-600 font-medium">Comment</Text>
                  <Textarea>
                    <TextareaInput
                      testID="reviewCommentInput"
                      placeholder="Share any additional thoughts..."
                      value={review.comment}
                      numberOfLines={4}
                      maxLength={255}
                      onChangeText={(text) =>
                        setReview((prev) => ({
                          ...prev,
                          comment: text,
                        }))
                      }
                    />
                  </Textarea>
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
            </>
          )}
        </VStack>
      </ScrollView>
    </View>
  );
}
