import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ArrowLeftIcon, Droplet, Thermometer, Star } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { View, ScrollView } from "react-native";
import { API_HOST } from "@/constants/vars";
import type { Fountain } from "../../../../types";
import { HStack } from "@/components/ui/hstack";

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
  reviews: Review[];
}

export default function WaterFountainDetail() {
  const { id: fountainId } = useLocalSearchParams();
  const router = useRouter();

  const [fountain, setFountain] = useState<FountainWithReviews | undefined>(undefined);
  const [stats, setStats] = useState({
    avgTaste: 0,
    avgTemp: 0,
    avgFlow: 0,
    filterStatus: {
      needsReplacement: 0,
      ok: 0,
      good: 0
    }
  });

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

      // Calculate statistics
      if (data.reviews && data.reviews.length > 0) {
        const avgTaste = data.reviews.reduce((sum: any, review: { taste: any; }) => sum + review.taste, 0) / data.reviews.length;
        const avgTemp = data.reviews.reduce((sum: any, review: { temperature: any; }) => sum + review.temperature, 0) / data.reviews.length;
        const avgFlow = data.reviews.reduce((sum: any, review: { flow: any; }) => sum + review.flow, 0) / data.reviews.length;
        
        const filterStatusCounts = data.reviews.reduce((acc: { needsReplacement: number; ok: number; good: number; }, review: { filterStatus: number; }) => {
          if (review.filterStatus === 0) acc.needsReplacement++;
          else if (review.filterStatus === 1) acc.ok++;
          else if (review.filterStatus === 2) acc.good++;
          return acc;
        }, { needsReplacement: 0, ok: 0, good: 0 });

        setStats({
          avgTaste,
          avgTemp,
          avgFlow,
          filterStatus: filterStatusCounts
        });
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFountain(fountainId as string);
  }, [fountainId]);

  const getFilterStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-red-500";
      case 1: return "bg-yellow-500";
      case 2: return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderRating = (value: number) => {
    const roundedValue = Math.round(value);
    return "★".repeat(roundedValue) + "☆".repeat(5 - roundedValue);
  };

  const renderEmptyStars = () => (
    <HStack className="space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} className="text-gray-300">★</Text>
      ))}
    </HStack>
  );
  
  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        <VStack className="p-4 space-y-6">
          {/* Header */}
          <HStack className="items-center">
            <Button
              variant="link"
              onPress={() => router.push("/")}
              className="mr-auto"
            >
              <ButtonIcon as={ArrowLeftIcon} className="h-5 w-5 text-gray-900" />
              <ButtonText className="text-gray-900">Go Back</ButtonText>
            </Button>
          </HStack>

          {fountain && (
            <>
              {/* Fountain Description */}
              <Heading className="text-xl text-center text-gray-900 font-bold">
                {fountain.description}
              </Heading>

              {/* Stats Grid */}
              <View className="flex-row flex-wrap justify-between">
                {/* Taste */}
                <View className="w-[48%] mb-6">
                  <HStack className="items-center mb-2 space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <Text className="text-gray-600">Taste</Text>
                  </HStack>
                  <Text className="text-2xl font-bold mb-1">
                    {stats.avgTaste.toFixed(1)}/5
                  </Text>
                  {renderEmptyStars()}
                </View>

                {/* Temperature */}
                <View className="w-[48%] mb-6">
                  <HStack className="items-center mb-2 space-x-2">
                    <Thermometer className="h-5 w-5 text-blue-500" />
                    <Text className="text-gray-600">Temperature</Text>
                  </HStack>
                  <Text className="text-2xl font-bold mb-1">
                    {stats.avgTemp.toFixed(1)}/5
                  </Text>
                  {renderEmptyStars()}
                </View>

                {/* Flow */}
                <View className="w-[48%] mb-6">
                  <HStack className="items-center mb-2 space-x-2">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    <Text className="text-gray-600">Flow</Text>
                  </HStack>
                  <Text className="text-2xl font-bold mb-1">
                    {stats.avgFlow.toFixed(1)}/5
                  </Text>
                  {renderEmptyStars()}
                </View>

                {/* Filter Status */}
                <View className="w-[48%] mb-6">
                  <Text className="text-gray-600 mb-2">Filter Status</Text>
                  <VStack className="space-y-2">
                    <View className="bg-green-500 rounded-full py-2">
                      <Text className="text-white text-center">
                        Good: {stats.filterStatus.good}
                      </Text>
                    </View>
                    <View className="bg-yellow-500 rounded-full py-2">
                      <Text className="text-white text-center">
                        OK: {stats.filterStatus.ok}
                      </Text>
                    </View>
                    <View className="bg-red-400 rounded-full py-2">
                      <Text className="text-white text-center">
                        Needs Replacement: {stats.filterStatus.needsReplacement}
                      </Text>
                    </View>
                  </VStack>
                </View>
              </View>

              {/* Reviews Section */}
              <VStack className="space-y-4">
                <HStack className="justify-between items-center">
                  <Text className="text-xl font-bold text-gray-900">Reviews</Text>
                  <Button
                    onPress={() => router.push(`/fountain/${fountainId}/review`)}
                    className="bg-blue-500 rounded-lg px-4 py-2"
                  >
                    <ButtonText className="text-white font-medium">
                      Add Review
                    </ButtonText>
                  </Button>
                </HStack>

                {fountain.reviews?.length === 0 ? (
                  <Text className="text-gray-500 text-center py-4">
                    No reviews yet. Be the first to review!
                  </Text>
                ) : (
                  fountain.reviews?.map((review) => (
                    <View key={review.id} className="border-b border-gray-200 pb-4">
                      <HStack className="justify-between mb-2">
                        <Text className="font-medium text-gray-900">
                          {review.user?.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {formatDate(review.createdAt)}
                        </Text>
                      </HStack>
                      <VStack className="space-y-2">
                        <HStack className="space-x-4">
                          <Text className="text-gray-600">
                            Taste: {renderRating(review.taste)}
                          </Text>
                          <Text className="text-gray-600">
                            Temp: {renderRating(review.temperature)}
                          </Text>
                        </HStack>
                        <HStack className="space-x-4">
                          <Text className="text-gray-600">
                            Flow: {renderRating(review.flow)}
                          </Text>
                          <View className={`rounded-full px-3 py-1 ${getFilterStatusColor(review.filterStatus)}`}>
                            <Text className="text-white text-sm">
                              {review.filterStatus === 0 ? "Needs Replacement" : 
                               review.filterStatus === 1 ? "OK" : "Good"}
                            </Text>
                          </View>
                        </HStack>
                        <Text className="text-gray-700 mt-2">{review.comment}</Text>
                      </VStack>
                    </View>
                  ))
                )}
              </VStack>
            </>
          )}
        </VStack>
      </ScrollView>
    </View>
  );
}