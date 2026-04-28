import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { recipient } from '../../api/recipient';
import { donor } from '../../api/donor';
import Avatar from '../../components/Avatar';
import Spinner from '../../components/Spinner';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

const MAP_TOGGLE = [
  { key: 'list', label: 'List', icon: 'view-list' },
  { key: 'map', label: 'Map', icon: 'map' },
];

const RADIUS_OPTIONS = [5, 10, 25];

export default function RecipientHomeScreen() {
  const { user, showToast, unreadCount } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = React.useState<any>(null);
  const [nearbyListings, setNearbyListings] = React.useState<any[]>([]);
  const [activeClaims, setActiveClaims] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('list');
  const [radius, setRadius] = React.useState(5);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const userLat = user?.latitude || 27.7172;
      const userLng = user?.longitude || 85.3240;
      const [s, l, c] = await Promise.all([
        recipient.getClaims(),
        recipient.getNearbyListings(`?lat=${userLat}&lng=${userLng}&radius=${radius}&per_page=10`),
        recipient.getRequests('?status=open&per_page=1'),
      ]);
      setStats({ claims_active: s.data?.length || 0, requests_active: c.data?.length || 0 });
      setNearbyListings(Array.isArray(l.data) ? l.data : []);
      const active = (Array.isArray(s.data) ? s.data : []).filter((cl: any) => ['pending', 'confirmed'].includes(cl.status));
      setActiveClaims(active);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => { load(); }, [radius]);

  const name = user?.name?.split(' ')[0] || 'there';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const timeAgo = (iso: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.green} colors={[C.green]} />
        }
      >
        {/* Green header */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{greeting()}, {name}</Text>
              <Text style={{ fontWeight: '700', fontSize: 22, color: '#fff', marginTop: 2 }}>Every meal matters</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/recipient/notifications' as any)}
              activeOpacity={0.7}
              style={{ position: 'relative', width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: C.green }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            {[
              { label: 'Available', val: nearbyListings.length || '–', icon: 'map-marker-multiple', index: 0 },
              { label: 'My Claims', val: activeClaims.length || '–', icon: 'handshake', index: 1 },
              { label: 'Requests', val: stats?.requests_active ?? '–', icon: 'clipboard-text', index: 2 },
            ].map(s => (
              <TouchableOpacity
                key={s.label}
                onPress={() => {
                  if (s.label === 'My Claims') router.push('/recipient/my-claims' as any);
                }}
                activeOpacity={0.8}
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <MaterialCommunityIcons name={s.icon as any} size={24} color="#fff" style={{ marginBottom: 6 }} />
                <Text style={{ fontWeight: '800', fontSize: 22, color: '#fff', lineHeight: 24 }}>{s.val}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 4 }}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* View toggle + Radius filter */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {MAP_TOGGLE.map(t => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setViewMode(t.key)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: viewMode === t.key ? C.green : C.surface2 }}
                >
                  <Ionicons name={t.icon as any} size={14} color={viewMode === t.key ? '#fff' : C.textMid} />
                  <Text style={{ fontSize: 12, fontWeight: viewMode === t.key ? '700' : '500', color: viewMode === t.key ? '#fff' : C.textMid }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {RADIUS_OPTIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRadius(r)}
                  activeOpacity={0.7}
                  style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: radius === r ? C.green : C.surface2, borderWidth: 1, borderColor: radius === r ? C.green : 'transparent' }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: radius === r ? '#fff' : C.textMid }}>{r}km</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Listings */}
          {loading ? (
            <Spinner />
          ) : nearbyListings.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <MaterialCommunityIcons name="food-off" size={32} color={C.textLight} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>No listings nearby</Text>
              <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 }}>Try increasing the search radius or check back later</Text>
            </View>
          ) : viewMode === 'list' ? (
            nearbyListings.map((l: any) => (
              <TouchableOpacity
                key={l.id}
                onPress={() => router.push(`/recipient/listing-detail?id=${l.id}` as any)}
                activeOpacity={0.85}
                style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 90, height: 90, backgroundColor: C.tagAmber, flexShrink: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    {l.photos?.[0]
                      ? <Image source={{ uri: l.photos[0] }} style={{ width: 90, height: 90 }} resizeMode="cover" />
                      : <MaterialCommunityIcons name="food" size={32} color="rgb(180,120,40)" />
                    }
                  </View>
                  <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                    <View>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark, marginBottom: 4 }} numberOfLines={1}>{l.title}</Text>
                        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                          <View style={{ backgroundColor: C.surface2, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid }}>{l.distance_km ? `${l.distance_km.toFixed(1)}km` : '–'}</Text>
                          </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="package-variant-closed" size={12} color={C.textLight} />
                        <Text style={{ fontSize: 12, color: C.textLight }} numberOfLines={1}>{l.quantity || '—'}</Text>
                      </View>
                      {l.address && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <MaterialCommunityIcons name="map-marker-outline" size={12} color={C.textLight} />
                          <Text style={{ fontSize: 11, color: C.textLight }} numberOfLines={1}>{l.address.split(',')[0]}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialCommunityIcons name="map" size={48} color={C.textLight} />
              <Text style={{ fontSize: 14, color: C.textMid, marginTop: 12 }}>Map view coming soon</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/home" />
    </View>
  );
}
