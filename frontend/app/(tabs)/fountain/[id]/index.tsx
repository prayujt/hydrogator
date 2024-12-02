import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeftIcon,
  Droplet,
  Thermometer,
  Star,
  Filter,
  Heart,
  GlassWater,
} from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { View, ScrollView, Animated } from "react-native";
import { API_HOST } from "@/constants/vars";
import type { Fountain } from "../../../../types";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { useReviewRefresh } from "@/context/ReviewContext"; 

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

export default function WaterFountainDetail() {
  const { id: fountainId } = useLocalSearchParams();
  const router = useRouter();

  const [isFavorited, setIsFavorited] = useState(false);
  const [fountain, setFountain] = useState<FountainWithReviews | undefined>(
    undefined
  );
  const [stats, setStats] = useState({
    avgTaste: 0,
    avgTemp: 0,
    avgFlow: 0,
    avgFilterStatus: 0,
  });

  const { shouldRefreshReview, resetReviewRefresh } = useReviewRefresh();

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
      setIsFavorited(data.liked);

      // Calculate statistics
      if (data.reviews && data.reviews.length > 0) {
        const avgTaste =
          data.reviews.reduce(
            (sum: any, review: { taste: any }) => sum + review.taste,
            0
          ) / data.reviews.length;
        const avgTemp =
          data.reviews.reduce(
            (sum: any, review: { temperature: any }) =>
              sum + review.temperature,
            0
          ) / data.reviews.length;
        const avgFlow =
          data.reviews.reduce(
            (sum: any, review: { flow: any }) => sum + review.flow,
            0
          ) / data.reviews.length;
        const avgFilterStatus =
          data.reviews.reduce(
            (sum: any, review: { filterStatus: any }) =>
              sum + review.filterStatus,
            0
          ) / data.reviews.length;

        setStats({
          avgTaste,
          avgTemp,
          avgFlow,
          avgFilterStatus,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Add an effect to handle map refreshing
  useEffect(() => {
    if (shouldRefreshReview) {
      console.log("Refreshing reviews");
      fetchFountain(fountainId as string);

      resetReviewRefresh();
    }
  }, [shouldRefreshReview]);

  // Add animation value for heart press
  const scaleValue = new Animated.Value(1);

  const animateHeart = () => {
    Animated.sequence([
      Animated.spring(scaleValue, {
        toValue: 1.2,
        useNativeDriver: true,
        speed: 50,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
      }),
    ]).start();
  };

  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw Error("no token found");
      }

      const response = await fetch(`${API_HOST}/fountains/${fountainId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        animateHeart();
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  useEffect(() => {
    setFountain(undefined);
    setStats({
      avgTaste: 0,
      avgTemp: 0,
      avgFlow: 0,
      avgFilterStatus: 0,
    });
    fetchFountain(fountainId as string);
  }, [fountainId]);

  const getFilterStatusIcon = (status: number) => {
    const baseClasses = "w-full h-3 rounded-full overflow-hidden";
    const gradientClasses =
      status === 2
        ? "bg-gradient-to-r from-green-300 to-green-500"
        : status === 1
        ? "bg-gradient-to-r from-yellow-300 to-yellow-500"
        : "bg-gradient-to-r from-red-300 to-red-500";
    return (
      <View className="w-full">
        <View className={`${baseClasses} bg-gray-200`}>
          <View className={`${gradientClasses} h-full`} />
        </View>
        <Text className="text-center text-sm mt-1 text-gray-600">
          {status === 2 ? "Good" : status === 1 ? "OK" : "Needs Replacement"}
        </Text>
      </View>
    );
  };

  const renderStars = (value: number) => {
    return (
      <HStack className="space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            className={`text-lg ${
              star <= value ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </Text>
        ))}
      </HStack>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        <VStack className="p-4 space-y-6">
          {/* Header with Favorite Button */}
          <HStack className="items-center justify-between">
            <Button variant="link" onPress={() => router.push("/")}>
              <ButtonIcon
                as={ArrowLeftIcon}
                className="h-5 w-5 text-gray-900"
              />
              <ButtonText className="text-gray-900">Go Back</ButtonText>
            </Button>

            <Pressable
              onPress={toggleFavorite}
              className="p-2 rounded-full bg-gray-50"
            >
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <Heart
                  size={24}
                  className={
                    isFavorited ? "text-red-500 fill-red-500" : "text-gray-400"
                  }
                />
              </Animated.View>
            </Pressable>
          </HStack>

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

                {/* Bottle Filler Indicator */}
                <View className="mt-2">
                  <HStack className="justify-center items-center space-x-2 bg-blue-50 py-2 px-4 rounded-full self-center">
                    <GlassWater
                      size={20}
                      className={
                        fountain.hasBottleFiller
                          ? "text-blue-500"
                          : "text-gray-400"
                      }
                    />
                    <Text
                      className={`${
                        fountain.hasBottleFiller
                          ? "text-blue-700"
                          : "text-gray-500"
                      } font-medium`}
                    >
                      {fountain.hasBottleFiller
                        ? "Bottle Filling Station Available"
                        : "No Bottle Filling Station"}
                    </Text>
                  </HStack>
                </View>
              </VStack>

              {/* Stats Grid */}
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <Text className="text-xl font-bold text-gray-900 mb-4">
                  Average Ratings
                </Text>
                {fountain.reviews.length == 0 && (
                  <Text className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review!
                  </Text>
                )}

                {fountain.reviews.length > 0 && (
                  <View className="flex-row flex-wrap justify-between">
                    {/* Taste */}
                    <View className="w-[48%] mb-6">
                      <HStack className="items-center mb-2 space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <Text className="text-gray-600 font-medium">Taste</Text>
                      </HStack>
                      <Text className="text-2xl font-bold mb-1">
                        {stats.avgTaste.toFixed(1)}
                      </Text>
                      {renderStars(stats.avgTaste)}
                    </View>

                    {/* Temperature */}
                    <View className="w-[48%] mb-6">
                      <HStack className="items-center mb-2 space-x-2">
                        <Thermometer className="h-5 w-5 text-blue-500" />
                        <Text className="text-gray-600 font-medium">
                          Temperature
                        </Text>
                      </HStack>
                      <Text className="text-2xl font-bold mb-1">
                        {stats.avgTemp.toFixed(1)}
                      </Text>
                      {renderStars(stats.avgTemp)}
                    </View>

                    {/* Flow */}
                    <View className="w-[48%] mb-6">
                      <HStack className="items-center mb-2 space-x-2">
                        <Droplet className="h-5 w-5 text-blue-500" />
                        <Text className="text-gray-600 font-medium">Flow</Text>
                      </HStack>
                      <Text className="text-2xl font-bold mb-1">
                        {stats.avgFlow.toFixed(1)}
                      </Text>
                      {renderStars(stats.avgFlow)}
                    </View>

                    {/* Filter Status */}
                    <View className="w-[48%] mb-6 ">
                      <HStack className="items-center mb-2 space-x-2">
                        <Filter className="h-5 w-5 text-gray-500" />
                        <Text className="text-gray-600 font-medium ">
                          Filter Status
                        </Text>
                      </HStack>
                      {getFilterStatusIcon(stats.avgFilterStatus)}
                    </View>
                  </View>
                )}
              </View>

              {/* Reviews Section */}
              <View className="bg-white rounded-xl p-4 shadow-sm">
                <HStack className="justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-gray-900">
                    Reviews
                  </Text>
                  <Button
                    onPress={() =>
                      router.push(`/fountain/${fountainId}/review`)
                    }
                    className="bg-blue-500 rounded-lg px-4 py-2"
                  >
                    <ButtonText className="text-white font-medium">
                      Add Review
                    </ButtonText>
                  </Button>
                </HStack>

                {fountain.reviews?.length === 0 ? (
                  <Text className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review!
                  </Text>
                ) : (
                  fountain.reviews?.map((review, index) => (
                    <View
                      key={review.id}
                      className={`${
                        index !== fountain.reviews.length - 1
                          ? "border-b border-gray-200"
                          : ""
                      } pb-4 mb-4`}
                    >
                      <HStack className="justify-between mb-2">
                        <Text className="font-medium text-gray-900">
                          {review.user?.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <VStack className="space-y-2">
                        <HStack className="space-x-4">
                          <Text className="text-gray-600 flex-1">
                            Taste {renderStars(review.taste)}
                          </Text>
                          <Text className="text-gray-600 flex-1">
                            Temperature {renderStars(review.temperature)}
                          </Text>
                        </HStack>
                        <HStack className="space-x-4">
                          <Text className="text-gray-600 flex-1">
                            Flow {renderStars(review.flow)}
                          </Text>
                          <View className="w-[48%] mb-6 ">
                            <View className="text-gray-600 flex-1 mb-2">
                              Filter Status
                            </View>
                            {getFilterStatusIcon(review.filterStatus)}
                          </View>
                        </HStack>
                        <View className="w-full">
                          {review.comment && (
                            <Text className="text-gray-700 mt-2 break-words">
                              {review.comment}
                            </Text>
                          )}
                        </View>
                      </VStack>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </VStack>
      </ScrollView>
    </View>
  );
}
