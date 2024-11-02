import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView, View, Dimensions } from "react-native";

import { useRouter } from "expo-router";

import BottomSheet, { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { X } from "lucide-react-native";

import Mapbox from "@rnmapbox/maps";

import { API_HOST } from "../../constants/vars";
import type { Fountain, Building } from "../../types";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_RNMAPBOX_API_KEY as string);

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const MapScreen = () => {
  const mapRef = useRef<Mapbox.MapView | null>(null);
  const userLocationRef = useRef<[number, number] | null>(null);
  const router = useRouter();

  // Bottom Sheet
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [groupedFountains, setGroupedFountains] = useState<{
    [floor: number]: Fountain[];
  }>({});
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingFountains, setBuildingFountains] = useState<Fountain[]>([]);

  const layerStyles = {
    building: {
      fillExtrusionOpacity: 0.5,
      fillExtrusionHeight: ["get", "height"],
      fillExtrusionBase: ["get", "base_height"],
      fillExtrusionColor: ["get", "color"],
    },
  };

  const snapPoints = useMemo(() => {
    if (selectedBuilding) {
      const contentLines = selectedBuilding.fountainCount;
      const minSnapPoint = Math.min(35 + contentLines * 5, 50);
      return [`${minSnapPoint}%`, "75%"];
    }
    return ["50%", "75%"];
  }, [selectedBuilding]);

  const fetchFountains = async (buildingId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // failed to retrieve token for request
        throw Error("no token found");
      }

      const response = await fetch(
        `${API_HOST}/buildings/${buildingId}/fountains`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBuildingFountains(await response.json());

      if (!response.ok) {
        return;
      }
    } catch (error) {
      // Handle network or other errors
      console.error(error);
    }
  };

  const fetchBuildings = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        // failed to retrieve token for request
        throw Error("no token found");
      }

      const response = await fetch(`${API_HOST}/buildings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setBuildings(await response.json());

      if (!response.ok) {
        return;
      }
    } catch (error) {
      // Handle network or other errors
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(mapRef.current);
    if (mapRef.current) {
    }
  }, [mapRef.current]);

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-white" testID="mapContainer">
        <Mapbox.MapView
          ref={mapRef}
          style={{ width: screenWidth, height: screenHeight, zIndex: 0 }}
          styleURL="mapbox://styles/mapbox/streets-v12"
        >
          <Mapbox.Camera zoomLevel={15} centerCoordinate={[-82.35, 29.645]} />
        </Mapbox.MapView>
        {selectedBuilding && (
          <BottomSheet
            index={0}
            snapPoints={snapPoints}
            onClose={() => setSelectedBuilding(null)}
            style={{ zIndex: 10 }}
          >
            <View className="items-center p-4 flex-1">
              {/* Close Button */}
              <Button
                className="absolute top-4 right-4 p-1 bg-[#ff6347] w-[30px] h-[30px] rounded-full justify-center items-center"
                onPress={() => setSelectedBuilding(null)}
              >
                <X color="white" size={20} />
              </Button>

              {/* Building Name */}
              <Heading className="text-lg mb-4">
                {selectedBuilding.name}
              </Heading>

              <ScrollView className="w-full">
                {Object.entries(groupedFountains).map(([floor, fountains]) => (
                  <View key={floor} className="w-full mb-4 px-2">
                    <Heading className="text-md mb-2">Floor {floor}</Heading>
                    {fountains.map((fountain, index) => (
                      <Pressable
                        key={index}
                        onPress={() => router.push(`/fountains/${fountain.id}`)}
                        className="w-full flex flex-row items-center mb-2 bg-white p-2 rounded-lg shadow-sm"
                      >
                        <Text className="text-sm text-black">
                          {fountain.description}
                        </Text>
                        <Text className="ml-auto text-[#ff6347] text-sm font-semibold">
                          View
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ))}
              </ScrollView>
            </View>
          </BottomSheet>
        )}
      </View>
    </BottomSheetModalProvider>
  );
};

export default MapScreen;
