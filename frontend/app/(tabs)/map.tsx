import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { RNMAPBOX_API_KEY } from '@env';
import 'mapbox-gl/dist/mapbox-gl.css';
import waterFountainData from '../water-fountains.json';
import '../MapScreen.css'; // Import the CSS file

mapboxgl.accessToken = RNMAPBOX_API_KEY;

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

      // Add location markers for the water fountains      
      locations.forEach((location) => {
        const popupContent = `
          <h3 class="popup-building">${location.building}</h3>
          <ul class="popup-fountain-list">
            ${location.fountains
              .map(
                (fountain: { floor: number; description: string }) =>
                  `<li>Floor ${fountain.floor}: ${fountain.description}</li>`
              )
              .join('')}
          </ul>
        `;
        new mapboxgl.Marker({ color: 'red' })
        .setLngLat(location.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25, className: 'custom-popup' }).setHTML(popupContent))
        .addTo(map);
      });
    
      geolocateControl.on('geolocate', () => {
        // Set the pitch back to 60 degrees
        map.easeTo({
          pitch: 30,
          zoom: 16,
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
