import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { recipient } from '../../api/recipient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapPickerView from '../../components/MapPickerView';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import Spinner from '../../components/Spinner';

export default function RecipientMapScreen() {
  const { user, showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const lat = user?.latitude || 27.7172;
  const lng = user?.longitude || 85.3240;

  const [listings, setListings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  const [radius, setRadius] = React.useState(5);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const q = `?lat=${lat}&lng=${lng}&radius=${radius}`;
      const res = await recipient.getNearbyListings(q);
      let data = Array.isArray(res.data) ? res.data : [];
      if (filter) {
        data = data.filter((l: any) => l.tags?.some((t: any) => t.slug === filter));
      }
      setListings(data);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => { load(); }, [filter, radius]);

  const refresh = () => load(true);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Map — full bleed */}
      <View style={{ height: 380 + insets.top, position: 'relative' }}>
        <MapPickerView 
          lat={lat} 
          lng={lng} 
          markers={listings.map(l => ({ id: l.id, lat: l.latitude, lng: l.longitude, title: l.title }))}
          onMarkerPress={(id) => router.push(`/recipient/listing-detail?id=${id}` as any)}
          style={{ flex: 1 }} 
        />

        {/* Floating header */}
        <View style={{ position: 'absolute', top: insets.top + 12, left: 16, right: 16 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.tagGreen, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="food" size={18} color={C.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark }}>Nearby Food</Text>
                <Text style={{ fontSize: 11, color: C.textMid }}>Within {radius} km · {listings.length} found</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { k: '', l: 'All', icon: 'view-grid-outline' },
                { k: 'for_humans', l: 'Human', icon: 'account-outline' },
                { k: 'for_animals', l: 'Animal', icon: 'paw-outline' },
              ].map(f => (
                <TouchableOpacity
                  key={f.k}
                  onPress={() => setFilter(f.k)}
                  activeOpacity={0.7}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 10, backgroundColor: filter === f.k ? C.green : C.surface2 }}
                >
                  <MaterialCommunityIcons name={f.icon as any} size={13} color={filter === f.k ? '#fff' : C.textMid} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: filter === f.k ? '#fff' : C.textMid }}>{f.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Listings scroll */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.green} colors={[C.green]} />}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: C.textDark }}>Available food</Text>
          {!loading && listings.length > 0 && (
            <View style={{ backgroundColor: C.tagGreen, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.green }}>{listings.length} nearby</Text>
            </View>
          )}
        </View>

        {loading ? (
          <Spinner />
        ) : listings.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
            <MaterialCommunityIcons name="food-off" size={48} color={C.textLight} />
            <Text style={{ fontSize: 14, color: C.textMid }}>No food nearby</Text>
            <Text style={{ fontSize: 12, color: C.textLight, textAlign: 'center' }}>Try increasing the search radius</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {listings.map((l: any) => (
              <TouchableOpacity
                key={l.id}
                onPress={() => router.push(`/recipient/listing-detail?id=${l.id}` as any)}
                activeOpacity={0.85}
                style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 90, height: 90, backgroundColor: C.tagAmber, flexShrink: 0 }}>
                    {l.photos?.[0]
                      ? <Image source={{ uri: l.photos[0] }} style={{ width: 90, height: 90 }} resizeMode="cover" />
                      : <View style={{ width: 90, height: 90, alignItems: 'center', justifyContent: 'center' }}><MaterialCommunityIcons name="food" size={32} color="rgb(180,120,40)" /></View>
                    }
                  </View>
                  <View style={{ flex: 1, padding: 12, gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark, flex: 1 }} numberOfLines={1}>{l.title}</Text>
                      {l.distance_km && <Text style={{ fontSize: 11, color: C.green, fontWeight: '700' }}>{l.distance_km} km</Text>}
                    </View>
                    <Text style={{ fontSize: 12, color: C.textMid }} numberOfLines={1}>{l.quantity}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <MaterialCommunityIcons name="map-marker-outline" size={11} color={C.textLight} />
                      <Text style={{ fontSize: 11, color: C.textLight }} numberOfLines={1}>{l.address}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {l.tags?.slice(0, 3).map((t: any, i: number) => (
                        <View key={i} style={{ backgroundColor: C.tagGreen, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 }}>
                          <Text style={{ fontSize: 9, color: C.green, fontWeight: '600' }}>{t.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/map" />
    </View>
  );
}