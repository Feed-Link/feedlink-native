/**
 * MapPickerView — interactive map for picking a location.
 * Also displays nearby markers that are clickable.
 * 
 * Currently implemented with WebView + Leaflet for Expo Go compatibility.
 */

import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { C } from '../theme';
import { useRouter } from 'expo-router';

interface Marker {
  id: string;
  lat: number;
  lng: number;
  title: string;
}

interface MapPickerViewProps {
  lat: number;
  lng: number;
  markers?: Marker[];
  onPinChange?: (lat: number, lng: number) => void;
  onMarkerPress?: (id: string) => void;
  style?: object;
}

export default function MapPickerView({ lat, lng, markers = [], onPinChange, onMarkerPress, style }: MapPickerViewProps) {
  const router = useRouter();
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 15);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // User location marker
    const userIcon = L.divIcon({
      className: '',
      html: '<div style="width:28px;height:28px;background:#16a34a;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker([${lat}, ${lng}], { icon: userIcon }).addTo(map);

    // Food listing markers - amber pin
    const foodIcon = L.divIcon({
      className: '',
      html: '<div style="width:24px;height:24px;background:#f59e0b;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="font-size:10px;">🍱</span></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });

    // Add markers for each listing
    ${markers.map((m, i) => `
    (function() {
      const mk = L.marker([${m.lat}, ${m.lng}], { icon: foodIcon }).addTo(map);
      mk.on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ id: '${m.id}', action: 'marker' }));
      });
    })();
    `).join('')}

    function sendCoords(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
    }

    // Allow clicking map to set location
    map.on('click', function(e) {
      sendCoords(e.latlng.lat, e.latlng.lng);
    });
  </script>
</body>
</html>
`;

  return (
    <View style={[{ flex: 1, overflow: 'hidden' }, style]}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        onMessage={e => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.action === 'marker' && data.id && onMarkerPress) {
              onMarkerPress(data.id);
            } else if (data.lat !== undefined && data.lng !== undefined && onPinChange) {
              onPinChange(data.lat, data.lng);
            }
          } catch {}
        }}
        renderLoading={() => (
          <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface2 }}>
            <ActivityIndicator color={C.green} size="large" />
          </View>
        )}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}