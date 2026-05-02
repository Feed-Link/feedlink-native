import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Spinner from '../../components/Spinner';
import BottomNavBar, { GUEST_TABS } from '../../components/BottomNavBar';

export default function GuestHomeScreen() {
  const { user, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [listings, setListings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await donor.getListings('?status=active,claimed,completed&per_page=20');
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  const name = user?.name?.split(' ')[0] || 'there';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.green} colors={[C.green]} />}
      >
        <View style={{ backgroundColor: C.blue, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>Welcome, {name}</Text>
              <Text style={{ fontWeight: '700', fontSize: 22, color: '#fff', marginTop: 2 }}>Ready to share?</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/guest/upgrade' as any)}
              activeOpacity={0.7}
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => router.push('/guest/create-listing' as any)}
            activeOpacity={0.85}
            style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(61,133,220,0.1)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="plus" size={24} color={C.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>Post new listing</Text>
              <Text style={{ fontSize: 12, color: C.textMid }}>Share surplus food quickly</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={C.textLight} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontWeight: '700', fontSize: 16, color: C.textDark }}>Your listings</Text>
          </View>

          {loading ? (
            <Spinner />
          ) : listings.length === 0 ? (
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 24, alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="food-off-outline" size={36} color={C.textLight} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.textDark }}>No listings yet</Text>
              <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center' }}>Post your first listing to get started</Text>
            </View>
          ) : (
            listings.map((listing: any) => (
              <TouchableOpacity
                key={listing.id}
                onPress={() => router.push(`/guest/listing-detail?id=${listing.id}` as any)}
                activeOpacity={0.85}
                style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }} numberOfLines={1}>{listing.title}</Text>
                    <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{listing.quantity}</Text>
                  </View>
                  <View style={{ 
                    backgroundColor: listing.status === 'active' ? 'rgba(61,133,220,0.1)' : listing.status === 'claimed' ? C.tagAmber : C.surface2,
                    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: listing.status === 'active' ? C.blue : listing.status === 'claimed' ? C.amber : C.textMid, textTransform: 'capitalize' }}>
                      {listing.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <BottomNavBar tabs={GUEST_TABS} active="/guest/home" accentColor={C.blue} />
    </View>
  );
}