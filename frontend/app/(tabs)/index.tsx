import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView, View, Dimensions } from "react-native";

import { useRouter } from "expo-router";

/* import BottomSheet, { BottomSheetModalProvider } from "@gorhom/bottom-sheet"; */
import AsyncStorage from "@react-native-async-storage/async-storage";

import { X } from "lucide-react-native";

import Mapbox, { MapView, Camera } from "@rnmapbox/maps";

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
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
        // other props...
      >
        <Camera zoomLevel={15} centerCoordinate={[-82.35, 29.645]} />
      </MapView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1, // or a fixed height like 400
  },
  map: {
    height: "100%",
    width: "100%",
  },
};

export default MapScreen;
