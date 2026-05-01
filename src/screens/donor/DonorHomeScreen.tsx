import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import Avatar from '../../components/Avatar';
import Spinner from '../../components/Spinner';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DonorHomeScreen() {
  const { user, showToast, unreadCount } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = React.useState<any>(null);
  const [pendingListings, setPendingListings] = React.useState<any[]>([]);
  const [nearbyRequestCount, setNearbyRequestCount] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const userLat = user?.latitude || 27.7172;
      const userLng = user?.longitude || 85.3240;
      const [s, l, r] = await Promise.all([
        donor.getStats(),
        donor.getListings('?status=active&per_page=10'),
        donor.getRequests(`?lat=${userLat}&lng=${userLng}&radius=5&per_page=1`),
      ]);
      setStats(s.data);
      const withClaims = (Array.isArray(l.data) ? l.data : []).filter((li: any) => li.claims_count > 0);
      setPendingListings(withClaims);
      setNearbyRequestCount(r.meta?.total ?? r.data?.length ?? 0);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const name = user?.name?.split(' ')[0] || 'there';
  const scaleAnims = React.useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]).current;

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

  const handleStatPress = (index: number, status: string) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    router.push(`/donor/listings?status=${status}` as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.green} colors={[C.green]} />}
      >
        {/* Green header */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{greeting()}, {name}</Text>
              <Text style={{ fontWeight: '700', fontSize: 22, color: '#fff', marginTop: 2 }}>Every meal shared matters</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/donor/notifications' as any)}
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
              { label: 'Active', val: stats?.listings_active ?? '–', icon: 'fire', status: 'active', index: 0 },
              { label: 'Claimed', val: stats?.listings_claimed ?? '–', icon: 'basket', status: 'claimed', index: 1 },
              { label: 'Done', val: stats?.listings_completed ?? '–', icon: 'check-decagram', status: 'completed', index: 2 },
            ].map(s => (
              <Animated.View key={s.label} style={{ flex: 1, transform: [{ scale: scaleAnims[s.index] }] }}>
                <TouchableOpacity
                  onPress={() => handleStatPress(s.index, s.status)}
                  activeOpacity={0.8}
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                >
                  <MaterialCommunityIcons name={s.icon as any} size={24} color="#fff" style={{ marginBottom: 6 }} />
                  <Text style={{ fontWeight: '800', fontSize: 22, color: '#fff', lineHeight: 24 }}>{s.val}</Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 4 }}>{s.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* Post new listing CTA */}
          <TouchableOpacity
            onPress={() => router.push('/donor/create-listing' as any)}
            activeOpacity={0.85}
            style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.tagGreen, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="plus" size={24} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>Post new listing</Text>
              <Text style={{ fontSize: 12, color: C.textMid }}>Share surplus food in a minute</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textLight} />
          </TouchableOpacity>

          {/* Pending claims section */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontWeight: '700', fontSize: 16, color: C.textDark }}>Needs your attention</Text>
              {pendingListings.length > 0 && (
                <View style={{ backgroundColor: C.amber, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{pendingListings.length}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={() => router.push('/donor/listings' as any)} activeOpacity={0.7}>
              <Text style={{ fontSize: 13, color: C.green, fontWeight: '600' }}>All listings</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Spinner />
          ) : pendingListings.length === 0 ? (
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="check-circle-outline" size={36} color={C.green} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.textDark }}>All clear!</Text>
              <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center' }}>No pending claims right now. You're all caught up.</Text>
            </View>
          ) : (
            pendingListings.map((listing: any) => (
              <TouchableOpacity
                key={listing.id}
                onPress={() => router.push(`/donor/listing-detail?id=${listing.id}` as any)}
                activeOpacity={0.85}
                style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }} numberOfLines={1}>{listing.title}</Text>
                    <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{listing.quantity}</Text>
                  </View>
                  <View style={{ backgroundColor: C.tagAmber, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="account-clock-outline" size={12} color={C.amber} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.amber }}>{listing.claims_count} pending</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <MaterialCommunityIcons name="information-outline" size={13} color={C.textLight} />
                    <Text style={{ fontSize: 12, color: C.textLight }}>Tap to review claims</Text>
                  </View>
                  {listing.latest_claim_at && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color={C.textLight} />
                      <Text style={{ fontSize: 11, color: C.textLight }}>{timeAgo(listing.latest_claim_at)}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
          {/* Nearby requests banner */}
          {nearbyRequestCount !== null && nearbyRequestCount > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/donor/map' as any)}
              activeOpacity={0.85}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginTop: 12 }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.tagAmber, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MaterialCommunityIcons name="map-marker-multiple-outline" size={20} color={C.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>
                  {nearbyRequestCount} food request{nearbyRequestCount > 1 ? 's' : ''} nearby
                </Text>
                <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Recipients need food within 5 km</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={C.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <BottomNavBar tabs={DONOR_TABS} active="/donor/home" />
    </View>
  );
}
