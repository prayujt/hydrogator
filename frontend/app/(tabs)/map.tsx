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

      // Add markers for each water fountain location
      const locations: {coordinates: [number, number], text: string}[] = [
        { coordinates: [-82.347443, 29.646192], text: 'Reitz Union' },
        { coordinates: [-82.3433, 29.6498], text: 'The Hub' },
        { coordinates: [-82.3670, 29.6358], text: 'Southwest Recreation Center' },
        { coordinates: [-82.3445, 29.6476], text: 'Marston Science Library' },
        { coordinates: [-82.3420, 29.6515], text: 'Library West' },
        { coordinates: [-82.3480, 29.6490], text: 'Little Hall' },
      ];

      // Initialize the map centered at a central point on UF campus
      const centerCoordinates: [number, number] = [-82.3460, 29.6480];

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: centerCoordinates,
        zoom: 15,
        antialias: true,
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

      // Add markers for each location
      locations.forEach((location) => {
        new mapboxgl.Marker({ color: 'red' })
          .setLngLat(location.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(location.text))
          .addTo(map);
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

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(e => 
            map.flyTo({ 
              center: [e.coords.longitude, e.coords.latitude],
              zoom: 18,
              pitch: 60
            }))
        }
      });

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
          height: '100vh',
        }}
      />
    </div>
  );
}
