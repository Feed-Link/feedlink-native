import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapPickerView from './MapPickerView';

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

  const reverseGeocode = async (rlat: number, rlng: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(`https://photon.komoot.io/reverse?lon=${rlng}&lat=${rlat}&limit=1`);
      const data = await res.json();
      const p = data?.features?.[0]?.properties;
      if (p) {
        const parts = [p.name, p.city || p.county].filter(Boolean);
        setPinAddress(parts.join(', ') || `${rlat.toFixed(4)}, ${rlng.toFixed(4)}`);
      } else {
        setPinAddress(`${rlat.toFixed(4)}, ${rlng.toFixed(4)}`);
      }
    } catch {
      setPinAddress(`${rlat.toFixed(4)}, ${rlng.toFixed(4)}`);
    } finally {
      setGeocoding(false);
    }
  };

  const searchTimer = React.useRef<any>(null);

  const handleSearch = (q: string) => {
    setSearch(q);
    if (!q.trim()) { setResults([]); return; }
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(q), 600);
  };

  const doSearch = async (q: string) => {
    setSearching(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=en&bbox=80.058,26.347,88.201,29.305`;
      const res = await fetch(url);
      const data = await res.json();
      const features = data?.features || [];
      setResults(features.map((f: any) => {
        const p = f.properties;
        const parts = [p.name, p.city || p.county, p.country].filter(Boolean);
        return {
          display: parts.join(', '),
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        };
      }));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const moveTo = (nlat: number, nlng: number, addr: string) => {
    setPin({ lat: nlat, lng: nlng });
    setPinAddress(addr);
    setResults([]);
    setSearch('');
    reverseGeocode(nlat, nlng);
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

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {/* Search */}
          <View style={styles.searchContainer}>
            <MaterialCommunityIcons name="magnify" size={18} color={C.textMid} style={{ marginRight: 8 }} />
            <TextInput
              value={search}
              onChangeText={handleSearch}
              placeholder="Search location..."
              placeholderTextColor={C.textLight}
              style={styles.searchInput}
            />
            {searching && (
              <View style={{ position: 'absolute', right: 28, top: 0, bottom: 0, justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={C.textMid} />
              </View>
            )}
          </View>

          {/* Search results list */}
          {results.length > 0 ? (
            <View style={{
              marginHorizontal: 16, marginBottom: 12,
              backgroundColor: C.surface,
              borderRadius: 14,
              borderWidth: 1, borderColor: C.border,
              overflow: 'hidden',
              shadowColor: '#000', shadowOpacity: 0.08,
              shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}>
              {results.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => moveTo(item.lat, item.lng, item.display)}
                  activeOpacity={0.6}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    borderBottomWidth: i < results.length - 1 ? 1 : 0,
                    borderBottomColor: C.border,
                    gap: 10,
                  }}
                >
                  <MaterialCommunityIcons name="map-marker-outline" size={18} color={C.green} style={{ flexShrink: 0 }} />
                  <Text style={{ fontSize: 13, color: C.textDark, flex: 1, opacity: 0.85 }} numberOfLines={2}>{item.display}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : search && !searching ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
              <MaterialCommunityIcons name="magnify-close" size={40} color={C.textLight} />
              <Text style={{ fontSize: 14, color: C.textMid, marginTop: 8 }}>No places found</Text>
            </View>
          ) : null}

          {/* Map */}
          {results.length === 0 && (
            <View style={{ flex: 1, marginHorizontal: 16, marginVertical: 8, borderRadius: 14, overflow: 'hidden', minHeight: 220 }}>
              <MapPickerView
                lat={pin.lat}
                lng={pin.lng}
                onPinChange={(lat, lng) => {
                  setPin({ lat, lng });
                  reverseGeocode(lat, lng);
                }}
                style={{ flex: 1 }}
              />
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.addressRow}>
            <Text style={{ fontSize: 12, marginRight: 8 }}>📍</Text>
            <Text style={styles.addressText} numberOfLines={2}>{geocoding ? 'Finding address…' : (pinAddress || 'Use search or "My location"')}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingRight: 36,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    fontSize: 14,
    color: C.textDark,
    backgroundColor: C.surface,
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
    flex: 1,
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
