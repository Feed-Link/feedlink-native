import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import ListingCard from '../../components/ListingCard';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';
import { Ionicons } from '@expo/vector-icons';

export default function DonorHomeScreen() {
  const { user, showToast, unreadCount } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = React.useState<any>(null);
  const [listings, setListings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const [s, l] = await Promise.all([
          donor.getStats(),
          donor.getListings('?status=active&per_page=3'),
        ]);
        setStats(s.data);
        setListings(Array.isArray(l.data) ? l.data : []);
      } catch (e: any) { showToast(e.message || 'Failed to load', 'error'); }
      finally { setLoading(false); }
    })();
  }, []);

  const name = user?.name?.split(' ')[0] || 'there';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Green header */}
        <View style={{
          backgroundColor: C.green,
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}>
          {/* User greeting + notification bell */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>Hi, {name}</Text>
              <Text style={{ fontWeight: '700', fontSize: 22, color: '#fff', marginTop: 2 }}>Share food today</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/donor/notifications' as any)}
              activeOpacity={0.7}
              style={{
                position: 'relative',
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="notifications-outline" size={20} color="#fff" />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 16, height: 16, borderRadius: 8,
                  backgroundColor: 'rgb(220,175,38)',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats cards */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
            {[
              { label: 'Active', val: stats?.listings_active ?? '–' },
              { label: 'Claimed', val: stats?.listings_completed ? stats.listings_active + 1 : '–' },
              { label: 'Done', val: stats?.listings_completed ?? '–' },
            ].map(s => (
              <View key={s.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', fontSize: 22, color: '#fff' }}>{s.val}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ padding: 16, paddingTop: 16 }}>
          {/* Post new listing CTA */}
          <TouchableOpacity
            onPress={() => router.push('/donor/create-listing' as any)}
            activeOpacity={0.85}
            style={{
              backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
              borderRadius: 16, padding: 14, flexDirection: 'row',
              alignItems: 'center', gap: 14, marginBottom: 16,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.tagGreen, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text style={{ fontSize: 22 }}>➕</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>Post new listing</Text>
              <Text style={{ fontSize: 12, color: C.textMid }}>Share surplus food in a minute</Text>
            </View>
            <Text style={{ fontSize: 20, color: C.textLight }}>›</Text>
          </TouchableOpacity>

          {/* Active listings section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark }}>Your active listings</Text>
            <TouchableOpacity onPress={() => router.push('/donor/listings' as any)} activeOpacity={0.7}>
              <Text style={{ fontSize: 13, color: C.green, fontWeight: '700' }}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Spinner />
          ) : listings.length === 0 ? (
            <EmptyState icon={<Ionicons name="storefront-outline" size={36} color={C.textLight} />} title="No active listings" subtitle="Post your first listing to get started" />
          ) : (
            listings.map((l: any) => (
              <ListingCard
                key={l.id}
                listing={l}
                onPress={() => router.push(`/donor/listing-detail?id=${l.id}` as any)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <BottomNavBar tabs={DONOR_TABS} active="/donor/home" />
    </View>
  );
}
