// app/(tabs)/map.tsx

import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert, Text } from "react-native";
// import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

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

  const initialRegion = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  return (
    <View className="flex-1">
      {/* <MapView
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {fountains.map((fountain) => (
          <Marker
            key={fountain.id}
            coordinate={{ latitude: fountain.latitude, longitude: fountain.longitude }}
            title={fountain.title}
            description={fountain.description}
            onCalloutPress={() => router.push(`/fountain/${fountain.id}`)}
          />
        ))}
      </MapView> */}
    </View>
  );
}
