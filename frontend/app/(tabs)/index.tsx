import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Pressable } from "@/components/ui/pressable";
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Link, useRouter } from "expo-router";

import BottomSheet, { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { PlusCircle, X } from "lucide-react-native";

// for native
import Mapbox, { MapView, Camera, PointAnnotation } from "@rnmapbox/maps";

// for web
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

import { API_HOST } from "@/constants/vars";
import type { Fountain, Building } from "../../types";

if (Platform.OS === "web") {
  mapboxgl.accessToken = process.env.EXPO_PUBLIC_RNMAPBOX_API_KEY as string;
} else {
  Mapbox.setAccessToken(process.env.EXPO_PUBLIC_RNMAPBOX_API_KEY as string);
}

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

const MapScreen = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Mapbox.MapView | any>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
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

  const snapPoints = useMemo(() => {
    if (selectedBuilding) {
      const contentLines = selectedBuilding.fountainCount;
      const minSnapPoint = Math.min(35 + contentLines * 5, 60);
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
    console.log(buildingFountains);
    const groups = buildingFountains.reduce((acc: Record<number, Fountain[]>, fountain: Fountain) => {
      (acc[fountain.floor] = acc[fountain.floor] || []).push(fountain);
      return acc;
    }, {});
    setGroupedFountains(groups);
  }, [buildingFountains]);

  useEffect(() => {
    if (!selectedBuilding && mapRef.current) {
      if (Platform.OS === "web")
        mapRef.current.easeTo({
          pitch: 30,
          zoom: 16,
          bearing: 0,
        });
    }
  }, [selectedBuilding]);

  useEffect(() => {
    if (buildings.length === 0) return;
    if (!mapRef.current) return;
    // Add location markers for the water fountains
    buildings.forEach((building) => {
      if (Platform.OS === "web") {
        const markerElement = document.createElement("div");
        markerElement.style.backgroundColor = "blue";
        markerElement.style.borderRadius = "50%";
        markerElement.style.color = "white";
        markerElement.style.width = "30px";
        markerElement.style.height = "30px";
        markerElement.style.display = "flex";
        markerElement.style.alignItems = "center";
        markerElement.style.justifyContent = "center";
        markerElement.style.fontSize = "14px";
        markerElement.style.fontWeight = "bold";
        markerElement.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
        markerElement.innerHTML = `<span>${building.fountainCount}</span>`;

        // Set up the marker with the custom element
        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: "center",
        })
          .setLngLat([building.latitude, building.longitude])
          .addTo(mapRef.current);

        // Add click event listener to the marker
        marker.getElement().addEventListener("click", async () => {
          console.log("Marker clicked:", building); // Debugging log
          setSelectedBuilding(building); // Open bottom sheet with this location data
          await fetchFountains(building.id.toString());

          const buildingLocation = [
            building.latitude,
            building.longitude - 0.00035,
          ];

          mapRef.current.easeTo({
            center: buildingLocation,
            zoom: 18,
            pitch: 75,
            bearing: -10,
            duration: 750,
          });
        });
      }
    });
  }, [buildings]);

  useEffect(() => {
    if (mapContainerRef.current && Platform.OS === "web") {
      console.log("container ref found");
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-82.35, 29.645],
        zoom: 16,
        pitch: 50,
        antialias: true,
      });

      mapRef.current = map;

      // Add navigation control (zoom and rotation controls)
      map.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        "top-right"
      );

      // Create a reference to the GeolocateControl
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true, // Request high accuracy
        },
        trackUserLocation: false,
        showUserHeading: true,
        showAccuracyCircle: false, // Disable the blue accuracy circle
      });

      // Add the GeolocateControl to the map
      map.addControl(geolocateControl);

      // Store user's location when geolocated
      geolocateControl.on("geolocate", (e: any) => {
        console.log("running geolocate");
        userLocationRef.current = [e.coords.longitude, e.coords.latitude];
        map.easeTo({
          center: [-82.35, 29.645],
          zoom: 16,
          pitch: 50,
        });
      });

      map.easeTo({
        center: [-82.35, 29.645],
        zoom: 16,
        pitch: 50,
      });

      map.on("load", () => {
        // Trigger geolocation to center the map on the user's location
        geolocateControl.trigger();

        // Insert the layer beneath any existing labels.
        // const layers = map.getStyle().layers;
        const style = map.getStyle();
        if (style && style.layers) {
          const layers = style.layers;
        
          const labelLayerId = layers?.find(
            (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
          )?.id;

          // Add 3D buildings layer
          map.addLayer(
            {
              id: "3d-buildings",
              source: "composite",
              "source-layer": "building",
              filter: ["==", "extrude", "true"],
              type: "fill-extrusion",
              minzoom: 15,
              paint: {
                "fill-extrusion-color": "#aaa",

                // Use an 'interpolate' expression to add height based on zoom level
                "fill-extrusion-height": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  15,
                  0,
                  15.05,
                  ["get", "height"],
                ],
                "fill-extrusion-base": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  15,
                  0,
                  15.05,
                  ["get", "min_height"],
                ],
                "fill-extrusion-opacity": 0.6,
              },
            },
            labelLayerId
          );
        }
      });

      // Clean up on unmount
      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [mapContainerRef.current]);

  useEffect(() => {
    console.log("running fetch again");
    console.log(mapRef.current);
    if (mapRef.current) fetchBuildings();
  }, [mapRef.current]);

  return (
    <BottomSheetModalProvider>
      {Platform.OS === "web" ? (
        <div
          ref={mapContainerRef}
          style={{ width: screenWidth, height: screenHeight, zIndex: 0 }}
        />
      ) : (
        <MapView
          ref={mapRef}
          style={{ width: screenWidth, height: screenHeight, zIndex: 0 }}
          styleURL="mapbox://styles/mapbox/streets-v12"
          testID="mapView"
        >
          <Camera
            ref={cameraRef}
            zoomLevel={16}
            centerCoordinate={[-82.35, 29.645]}
            pitch={50}
            animationMode="flyTo"
            animationDuration={1000}
          />
          {buildings.map((building) => (
            <Pressable
              key={building.id}
              onPress={async () => {
                setSelectedBuilding(building);
                await fetchFountains(building.id.toString());

                const buildingLocation = [
                  building.latitude,
                  building.longitude - 0.00035,
                ];

                if (cameraRef.current)
                  cameraRef.current.setCamera({
                    centerCoordinate: buildingLocation,
                    zoomLevel: 14,
                    pitch: 50,
                    animationMode: "flyTo",
                    animationDuration: 1000,
                  });
              }}
            >
              <PointAnnotation
                key={building.id.toString()}
                id={`marker-${building.id}`}
                coordinate={[building.latitude, building.longitude]} // Note: longitude first, then latitude
              >
                <View style={styles.marker}>
                  <Text style={styles.markerText}>
                    {building.fountainCount}
                  </Text>
                </View>
              </PointAnnotation>
            </Pressable>
          ))}
        </MapView>
      )}
      {selectedBuilding && (
        <BottomSheet
          index={0}
          snapPoints={snapPoints}
          onClose={() => setSelectedBuilding(null)}
          style={{ zIndex: 10 }}
        >
          <View className="items-center p-4 flex-1">
            <View className="flex flex-row items-center justify-between w-full mb-4">
              {/* Link to create a new fountain */}
              <Link
                href={`/building/${selectedBuilding.id}/create-fountain`}
                className="flex flex-row items-center pr-4 bg-blue-200 rounded-full"
              >
                <Button className="bg-blue-200 rounded-full justify-center items-center">
                  <PlusCircle color="blue" size={25} />
                </Button>
                <Text className="font-semibold">New Fountain</Text>
              </Link>

              {/* Close button */}
              <Button
                className="p-1 bg-[#ff6347] w-[30px] h-[30px] rounded-full justify-center items-center"
                onPress={() => setSelectedBuilding(null)}
              >
                <X color="white" size={20} />
              </Button>
            </View>

            {/* Building Name */}
            <Heading className="text-lg mb-4">{selectedBuilding.name}</Heading>

            <ScrollView className="flex-1 px-4 w-full">
              {Object.entries(groupedFountains).map(([floor, fountains]) => (
                <View key={floor} className="w-full mb-4 px-2">
                  <Heading className="text-md mb-2">Floor {floor}</Heading>
                  {fountains.map((fountain, index) => (
                    <Pressable
                      key={index}
                      onPress={() => router.push(`/fountain/${fountain.id}`)}
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
    </BottomSheetModalProvider>
  );
};
const styles = StyleSheet.create({
  marker: {
    backgroundColor: "blue",
    borderRadius: 15, // Make it circular
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  callout: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "gray",
  },
});

export default MapScreen;
