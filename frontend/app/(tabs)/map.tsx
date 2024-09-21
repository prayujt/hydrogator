import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert, Text, Platform } from "react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

// Explicitly type MapboxGL for both web and native
let MapboxGL: typeof import('@rnmapbox/maps') | typeof import('mapbox-gl');

if (Platform.OS === "web") {
  // Web-specific imports
  const mapboxgl = require("mapbox-gl");
  mapboxgl.accessToken = 'your-mapbox-access-token';
  require('mapbox-gl/dist/mapbox-gl.css');
  MapboxGL = mapboxgl;
} else {
  // Mobile-specific imports
  const Mapbox = require("@rnmapbox/maps").default;
  Mapbox.setAccessToken('your-mapbox-access-token');
  MapboxGL = Mapbox;
}

export default function MapScreen() {
  const [location, setLocation] = useState<any>(null);
  const [fountains, setFountains] = useState([
    // Sample data; replace with real data as needed
    {
      id: 1,
      title: "Fountain A",
      description: "Near Library",
      latitude: 29.6436,
      longitude: -82.3549,
    },
    {
      id: 2,
      title: "Fountain B",
      description: "By the Gym",
      latitude: 29.6476,
      longitude: -82.3451,
    },
  ]);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Permission to access location was denied");
        return;
      }

      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  if (!location) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-700">Fetching your location...</Text>
      </View>
    );
  }

  const initialCoordinates = [location.longitude, location.latitude];

  return (
    <View className="flex-1">
      {Platform.OS === "web" ? (
        <div id="map" style={{ width: "100%", height: "100%" }} />
      ) : (
        <MapboxGL.MapView style={{ flex: 1 }} logoEnabled={false} zoomEnabled={true}>
          <MapboxGL.Camera
            zoomLevel={14}
            centerCoordinate={initialCoordinates}
          />
          <MapboxGL.UserLocation visible={true} showsUserHeadingIndicator={true} />
          {fountains.map((fountain) => (
            <MapboxGL.PointAnnotation
              key={fountain.id}
              id={fountain.id.toString()}
              coordinate={[fountain.longitude, fountain.latitude]}
              title={fountain.title}
            >
              <MapboxGL.Callout title={fountain.title}>
                <Text>{fountain.description}</Text>
              </MapboxGL.Callout>
            </MapboxGL.PointAnnotation>
          ))}
        </MapboxGL.MapView>
      )}
    </View>
  );
}
