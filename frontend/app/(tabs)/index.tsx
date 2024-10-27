import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { View, Dimensions } from "react-native";

import { useRouter } from "expo-router";

import BottomSheet, { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";

import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

/* import waterFountainData from "../water-fountains.json"; */
import "../MapScreen.css";

import { API_HOST } from "../../constants/vars";
import type { Fountain, Building } from "../../types";

mapboxgl.accessToken = process.env.EXPO_PUBLIC_RNMAPBOX_API_KEY as string;

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function MapScreen() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userLocationRef = useRef<[number, number] | null>(null);
  const router = useRouter();

  // Bottom Sheet
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingFountains, setBuildingFountains] = useState<Fountain[]>([]);

  const snapPoints = useMemo(() => {
    if (selectedBuilding) {
      const contentLines = selectedBuilding.fountainCount;
      const minSnapPoint = Math.min(17 + contentLines * 5, 50);
      return [`${minSnapPoint}%`, "75%"];
    }
    return ["25%", "75%"];
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
    console.log("buildings set", buildings); // Debugging log
    if (buildings.length === 0) return;
    console.log("map", mapRef.current);
    if (!mapRef.current) return;
    // Add location markers for the water fountains
    buildings.forEach((building) => {
      const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat([building.latitude, building.longitude])
        .addTo(mapRef.current);

      marker.getElement().addEventListener("click", async () => {
        console.log("Marker clicked:", building); // Debugging log
        setSelectedBuilding(building); // Open bottom sheet with this location data
        await fetchFountains(building.id);
      });

      // Add click event listener to the marker
      marker.getElement().addEventListener("click", () => {
        if (userLocationRef.current) {
          const userLocation = userLocationRef.current;
          const fountainLocation = [building.latitude, building.longitude];

          // Build the directions API URL
          const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation[0]},${userLocation[1]};${fountainLocation[0]},${fountainLocation[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

          // Fetch directions
          fetch(directionsUrl)
            .then((response) => response.json())
            .then((data) => {
              if (data.routes && data.routes.length > 0) {
                const route = data.routes[0].geometry;

                // Remove existing route layer if it exists
                if (mapRef.current.getSource("route")) {
                  mapRef.current.removeLayer("route");
                  mapRef.current.removeSource("route");
                }

                // Add the route to the map
                mapRef.current.addSource("route", {
                  type: "geojson",
                  data: {
                    type: "Feature",
                    properties: {},
                    geometry: route,
                  },
                });

                mapRef.current.addLayer({
                  id: "route",
                  type: "line",
                  source: "route",
                  layout: {
                    "line-join": "round",
                    "line-cap": "round",
                  },
                  paint: {
                    "line-color": "#888",
                    "line-width": 8,
                  },
                });

                // Adjust the map view to fit the route
                const coordinates = route.coordinates;
                const bounds = coordinates.reduce(function (
                  bounds: mapboxgl.LngLatBounds,
                  coord: [number, number]
                ) {
                  return bounds.extend(coord);
                },
                new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

                mapRef.current.fitBounds(bounds, {
                  padding: 50,
                });
                mapRef.current.easeTo({
                  pitch: 30,
                  bearing: 0,
                });
              } else {
                console.error("No route found");
              }
            })
            .catch((err) => {
              console.error("Error fetching directions", err);
            });
        } else {
          console.error("User location not available");
        }
      });
    });
  }, [buildings]);

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-82.346, 29.648],
        zoom: 16,
        pitch: 30,
        antialias: true, // Enable anti-aliasing for smoother 3D rendering
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
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: false, // Disable the blue accuracy circle
      });

      // Add the GeolocateControl to the map
      map.addControl(geolocateControl);

      // Store user's location when geolocated
      geolocateControl.on("geolocate", function (e: any) {
        userLocationRef.current = [e.coords.longitude, e.coords.latitude];
        // Set the pitch back to 60 degrees
        map.easeTo({
          pitch: 30,
          zoom: 16,
          bearing: 0,
        });
      });

      geolocateControl.on("geolocate", () => {
        // Set the pitch back to 60 degrees
        map.easeTo({
          pitch: 30,
          zoom: 16,
          bearing: 0,
        });
      });

      map.on("load", () => {
        // Trigger geolocation to center the map on the user's location
        geolocateControl.trigger();

        // Insert the layer beneath any existing labels.
        const layers = map.getStyle().layers;
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
      });

      // Clean up on unmount
      return () => {
        mapRef.current.remove();
      };
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) fetchBuildings();
  }, [mapRef.current]);

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-white">
        <div
          ref={mapContainerRef}
          style={{ width: screenWidth, height: screenHeight, zIndex: 0 }}
        />
        {selectedBuilding && (
          <BottomSheet
            index={0}
            snapPoints={snapPoints}
            onClose={() => setSelectedBuilding(null)}
            style={{ zIndex: 10 }}
          >
            <View className="items-center p-4 flex-1">
              <Button
                className="absolute top-4 right-4 p-1 bg-[#ff6347] w-[30px] h-[30px] rounded-full justify-center items-center"
                onPress={() => setSelectedBuilding(null)}
              >
                <ButtonText className="text-white font-bold text-lg">
                  x
                </ButtonText>
              </Button>

              <Text className="text-lg font-bold">
                {selectedBuilding.name}
              </Text>

              {buildingFountains.map((fountain, index) => (
                <Button 
                  key={index}
                  className="bg-white" 
                  variant="link"
                  onPress={() => {
                    router.push(`/water-fountain/${fountain.floor}`);
                  }}
                >
                  <ButtonText className="text-sm mt-2 text-black">
                    Floor {fountain.floor}: {fountain.description}
                  </ButtonText>
                </Button>
              ))}
            </View>
          </BottomSheet>
        )}
      </View>
    </BottomSheetModalProvider>
  );
}