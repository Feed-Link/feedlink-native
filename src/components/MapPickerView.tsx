/**
 * MapPickerView — interactive map for picking a location.
 *
 * Currently implemented with WebView + Leaflet for Expo Go compatibility.
 * To migrate to react-native-maps later:
 *   1. npm install react-native-maps
 *   2. Replace the WebView block below with:
 *        <MapView ... onPress={e => onPinChange(e.nativeEvent.coordinate.latitude, e.nativeEvent.coordinate.longitude)}>
 *          <Marker coordinate={{ latitude: lat, longitude: lng }} draggable onDragEnd={...} />
 *        </MapView>
 *   3. Remove the WebView import and HTML string — props interface stays identical.
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { C } from '../theme';

interface MapPickerViewProps {
  lat: number;
  lng: number;
  onPinChange: (lat: number, lng: number) => void;
  style?: object;
}

export default function MapPickerView({ lat, lng, onPinChange, style }: MapPickerViewProps) {
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

    const icon = L.divIcon({
      className: '',
      html: '<div style="width:28px;height:28px;background:#16a34a;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    let marker = L.marker([${lat}, ${lng}], { icon, draggable: true }).addTo(map);

    function sendCoords(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat, lng }));
    }

    marker.on('dragend', function(e) {
      const { lat, lng } = e.target.getLatLng();
      sendCoords(lat, lng);
    });

    map.on('click', function(e) {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      sendCoords(lat, lng);
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
            const { lat, lng } = JSON.parse(e.nativeEvent.data);
            onPinChange(lat, lng);
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
