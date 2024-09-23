import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { RNMAPBOX_API_KEY } from '@env';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = RNMAPBOX_API_KEY;

export default function MapScreen() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      // Coordinates for various locations on UF campus
      const reitzUnionCoordinates: [number, number] = [-82.347443, 29.646192];
      const hubCoordinates: [number, number] = [-82.3433, 29.6498];
      const swRecCoordinates: [number, number] = [-82.3670, 29.6358];
      const marstonCoordinates: [number, number] = [-82.3445, 29.6476];
      const libraryWestCoordinates: [number, number] = [-82.3420, 29.6515];
      const littleHallCoordinates: [number, number] = [-82.3480, 29.6490];

      // Initialize the map centered at a central point on UF campus
      const centerCoordinates: [number, number] = [-82.3460, 29.6480];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: centerCoordinates,
        zoom: 15, // Zoom level adjusted to fit campus area
      });

      mapRef.current = map;

      // Add navigation control (zoom and rotation controls)
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add markers for each location

      // Reitz Union
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(reitzUnionCoordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText('Reitz Union')
        )
        .addTo(map);

      // The Hub
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(hubCoordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText('The Hub')
        )
        .addTo(map);

      // Southwest Recreation Center
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(swRecCoordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText('Southwest Recreation Center')
        )
        .addTo(map);

      // Marston Science Library
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(marstonCoordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText('Marston Science Library')
        )
        .addTo(map);

      // Library West
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(libraryWestCoordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText('Library West')
        )
        .addTo(map);

      // Little Hall
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat(littleHallCoordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setText('Little Hall')
        )
        .addTo(map);

      // Optionally, get the user's location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoordinates: [number, number] = [
            position.coords.longitude,
            position.coords.latitude,
          ];

          // Add a marker at the user's location
          new mapboxgl.Marker({ color: 'blue' })
            .setLngLat(userCoordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('Your Location'))
            .addTo(map);
        },
        (error) => {
          console.error('Error obtaining location', error);
        },
        { enableHighAccuracy: true }
      );

      // Clean up on unmount
      return () => {
        map.remove();
      };
    }
  }, []);

  // Center the map vertically
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '80vh',
        }}
      />
    </div>
  );
}
