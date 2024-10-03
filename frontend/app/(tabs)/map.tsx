import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import waterFountainData from '../water-fountains.json';
import '../MapScreen.css';
import { useRouter } from 'expo-router';
import BottomSheet, { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

mapboxgl.accessToken = process.env.EXPO_PUBLIC_RNMAPBOX_API_KEY as string;

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

type Fountain = {
  floor: number;
  description: string;
};

type Location = {
  coordinates: [number, number];
  building: string;
  fountains: Fountain[];
};

export default function MapScreen() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userLocationRef = useRef<[number, number] | null>(null);
  const router = useRouter();

  // Bottom Sheet
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const snapPoints = useMemo(() => {
    if (selectedLocation) {
      const contentLines = selectedLocation.fountains.length;
      const minSnapPoint = Math.min(17 + contentLines * 5, 50);
      return [`${minSnapPoint}%`, '75%'];
    }
    return ['25%', '75%'];
  }, [selectedLocation]);


  useEffect(() => {
    if (mapContainerRef.current) {
      const locations: Location[] = waterFountainData as Location[];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-82.3460, 29.6480],
        zoom: 16,
        pitch: 30,
        antialias: true, // Enable anti-aliasing for smoother 3D rendering
      });

      mapRef.current = map;

      // Add navigation control (zoom and rotation controls)
      map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}), 'top-right');

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
      geolocateControl.on('geolocate', function(e: any) {
        userLocationRef.current = [
          e.coords.longitude,
          e.coords.latitude,
        ];
        // Set the pitch back to 60 degrees
        map.easeTo({
          pitch: 30,
          zoom: 16,
          bearing: 0,
        });
      });

      // Add location markers for the water fountains      
      locations.forEach((location) => {
        const marker = new mapboxgl.Marker({ color: 'red' })
          .setLngLat(location.coordinates)
          .addTo(map);

        marker.getElement().addEventListener('click', () => {
          console.log('Marker clicked:', location); // Debugging log
          setSelectedLocation(location); // Open bottom sheet with this location data
        });
        
        // Add click event listener to the marker
        marker.getElement().addEventListener('click', () => {
          if (userLocationRef.current) {
            const userLocation = userLocationRef.current;
            const fountainLocation = location.coordinates;

            // Build the directions API URL
            const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/walking/${userLocation[0]},${userLocation[1]};${fountainLocation[0]},${fountainLocation[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

            // Fetch directions
            fetch(directionsUrl)
              .then((response) => response.json())
              .then((data) => {
                if (data.routes && data.routes.length > 0) {
                  const route = data.routes[0].geometry;

                  // Remove existing route layer if it exists
                  if (map.getSource('route')) {
                    map.removeLayer('route');
                    map.removeSource('route');
                  }

                  // Add the route to the map
                  map.addSource('route', {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      properties: {},
                      geometry: route,
                    },
                  });

                  map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: 'route',
                    layout: {
                      'line-join': 'round',
                      'line-cap': 'round',
                    },
                    paint: {
                      'line-color': '#888',
                      'line-width': 8,
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
                  new mapboxgl.LngLatBounds(
                    coordinates[0],
                    coordinates[0]
                  ));

                  map.fitBounds(bounds, {
                    padding: 50,
                  });
                } else {
                  console.error('No route found');
                }
              })
              .catch((err) => {
                console.error('Error fetching directions', err);
              });
          } else {
            console.error('User location not available');
          }
        });
      });
    
      geolocateControl.on('geolocate', () => {
        // Set the pitch back to 60 degrees
        map.easeTo({
          pitch: 30,
          zoom: 16,
          bearing: 0
        });
      });

      map.on('load', () => {
        // Trigger geolocation to center the map on the user's location
        geolocateControl.trigger();

        // Insert the layer beneath any existing labels.
        const layers = map.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        // Add 3D buildings layer
        map.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#aaa',

              // Use an 'interpolate' expression to add height based on zoom level
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height'],
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height'],
              ],
              'fill-extrusion-opacity': 0.6,
            },
          },
          labelLayerId
        );
      });

      // Clean up on unmount
      return () => {
        map.remove();
      };
    }
  }, []);
  
  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <div
          ref={mapContainerRef}
          style={{ width: screenWidth, height: screenHeight, zIndex: 0 }}
        />
        {selectedLocation && (
          <BottomSheet
            index={0}
            snapPoints={snapPoints}
            onClose={() => setSelectedLocation(null)}
            style={{ zIndex: 10 }}
          >
            <View style={styles.contentContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedLocation(null)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>

              <Text style={styles.title}>{selectedLocation.building}</Text>
              {selectedLocation.fountains.map((fountain, index) => (
                <Text key={index} style={styles.fountainInfo} onPress={() => {
                  router.push(`/water-fountain/${fountain.floor}`);
                }}>
                  Floor {fountain.floor}: {fountain.description}
                </Text>
              ))}
            </View>
          </BottomSheet>
        )}
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fountainInfo: {
    fontSize: 14,
    marginTop: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    backgroundColor: '#ff6347',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});