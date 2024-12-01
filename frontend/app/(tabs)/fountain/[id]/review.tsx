import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeftIcon } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { View, ScrollView, Pressable, Switch, Platform } from "react-native";
import { API_HOST } from "@/constants/vars";
import { Input, InputField } from "@/components/ui/input";
import type { Fountain } from "../../../../types";
import Slider from "@react-native-community/slider";

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
    filterStatus: 1,
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
                        width: `${Math.max((review.filterStatus / 2) * 100, 15)}%`, // Minimum width of 5%
                        backgroundColor: review.filterStatus === 0 ? "#EF4444" : undefined, // Ensure red color for the lowest value
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

                {/* Water Bottle Filler */}
                <VStack className="space-y-2">
                  <Text className="text-gray-600 font-medium">
                    Water Bottle Filler
                  </Text>
                  <HStack className="items-center space-x-2">
                    <Text
                      className={`text-sm ${
                        !review.hasBottleFiller
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      No
                    </Text>
                    <Switch
                      value={review.hasBottleFiller}
                      onValueChange={(value) =>
                        setReview((prev) => ({
                          ...prev,
                          hasBottleFiller: value,
                        }))
                      }
                      trackColor={{ false: "#d1d5db", true: "#3b82f6" }} // gray-300 when off, blue-500 when on
                      thumbColor={
                        review.hasBottleFiller ? "#1d4ed8" : "#9ca3af"
                      } // Use blue-700 when on, gray-400 when off
                      ios_backgroundColor="#d1d5db" // gray-300 background for iOS
                      {...Platform.select({
                        web: {
                          activeThumbColor: "white",
                        },
                      })}
                    />
                    <Text
                      className={`text-sm ${
                        review.hasBottleFiller
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      Yes
                    </Text>
                  </HStack>
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
                      className="border border-gray-200 rounded-xl p-4 bg-white"
                      textAlignVertical="top"
                      placeholderTextColor="#9CA3AF"
                      numberOfLines={4}
                      maxLength={255}
                      style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: "#1F2937",
                        height: 120,
                        minHeight: 120,
                        maxHeight: 200,
                      }}
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
            </>
          )}
        </VStack>
      </ScrollView>
    </View>
  );
}
