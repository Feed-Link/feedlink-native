import React from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

interface LocationPickerModalProps {
  lat: number;
  lng: number;
  address: string;
  onConfirm: (lat: number, lng: number, addr: string) => void;
  onClose: () => void;
}

export default function LocationPickerModal({ lat, lng, address, onConfirm, onClose }: LocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [pin, setPin] = React.useState({ lat, lng });
  const [pinAddress, setPinAddress] = React.useState(address);
  const [geocoding, setGeocoding] = React.useState(false);
  const mapRef = React.useRef<any>(null);

  const formatNominatim = (addr: any) => {
    const local = addr.neighbourhood || addr.suburb || addr.city_district || addr.quarter || addr.village;
    const city = addr.city || addr.town || addr.county || addr.state_district;
    return [local, city].filter(Boolean).join(', ');
  };

  const reverseGeocode = async (rlat: number, rlng: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${rlat}&lon=${rlng}&format=json&accept-language=en`);
      const data = await res.json();
      const formatted = formatNominatim(data.address || {}) || `${rlat.toFixed(4)}, ${rlng.toFixed(4)}`;
      setPinAddress(formatted);
    } catch {
      setPinAddress(`${rlat.toFixed(4)}, ${rlng.toFixed(4)}`);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearch(q);
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6&countrycodes=np&accept-language=en`);
      const data = await res.json();
      setResults(data.map((r: any) => ({
        display: formatNominatim(r.address) || r.display_name.split(',').slice(0, 2).join(',').trim(),
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      })));
    } catch { } finally { setSearching(false); }
  };

  const moveTo = (nlat: number, nlng: number, addr: string) => {
    setPin({ lat: nlat, lng: nlng });
    setPinAddress(addr);
    setResults([]);
    setSearch('');
    mapRef.current?.animateToRegion({ latitude: nlat, longitude: nlng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  const useMyLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;
      moveTo(latitude, longitude, '');
      reverseGeocode(latitude, longitude);
    } catch { }
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pick location</Text>
          <TouchableOpacity onPress={useMyLocation} style={styles.myLocationBtn}>
            <Text style={styles.myLocationText}>📍 My location</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Search: Pepsicola, Thamel, Baneshwor…"
            placeholderTextColor={C.textLight}
            style={styles.searchInput}
          />
          {searching && <ActivityIndicator size="small" color={C.textMid} style={{ marginRight: 8 }} />}
        </View>

        {/* Search results */}
        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={results}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => moveTo(item.lat, item.lng, item.display)} style={styles.resultItem}>
                  <Text style={{ fontSize: 12, marginRight: 8 }}>📍</Text>
                  <Text style={styles.resultText}>{item.display}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Map */}
        <View style={{ flex: 1, minHeight: 280 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{ latitude: pin.lat, longitude: pin.lng, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
            onPress={e => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              moveTo(latitude, longitude, '');
              reverseGeocode(latitude, longitude);
            }}
          >
            <Marker coordinate={{ latitude: pin.lat, longitude: pin.lng }} draggable
              onDragEnd={e => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                moveTo(latitude, longitude, '');
                reverseGeocode(latitude, longitude);
              }}
            />
          </MapView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.addressRow}>
            <Text style={{ fontSize: 12, marginRight: 8 }}>📍</Text>
            <Text style={styles.addressText}>{geocoding ? 'Finding address…' : (pinAddress || 'Tap map to set location')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => onConfirm(pin.lat, pin.lng, pinAddress)}
            disabled={geocoding || !pinAddress}
            style={[styles.confirmBtn, (geocoding || !pinAddress) && styles.confirmBtnDisabled]}
          >
            <Text style={styles.confirmBtnText}>Confirm location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 2000,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    marginTop: 52,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  closeBtn: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: 22,
    padding: 0,
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: C.textDark,
    flex: 1,
  },
  myLocationBtn: {
    borderWidth: 1.5,
    borderColor: C.green,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  myLocationText: {
    fontSize: 12,
    color: C.green,
    fontWeight: '700',
  },
  searchContainer: {
    padding: 10,
    paddingHorizontal: 16,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    fontSize: 15,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    fontSize: 14,
    color: C.textDark,
    backgroundColor: C.surface,
  },
  resultsContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 60,
    backgroundColor: C.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
    zIndex: 10,
    maxHeight: 200,
  },
  resultItem: {
    padding: 11,
    paddingHorizontal: 14,
    fontSize: 13,
    color: C.textDark,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 13,
    color: C.textDark,
  },
  footer: {
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
    backgroundColor: C.surface,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 13,
    color: C.textDark,
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: C.green,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
