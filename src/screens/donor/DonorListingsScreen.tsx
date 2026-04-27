import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import ListingCard from '../../components/ListingCard';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import NotifPagination from '../../components/NotifPagination';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'expired', label: 'Expired' },
  { key: '', label: 'All' },
];

const PER_PAGE = 10;

export default function DonorListingsScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = React.useState('active');
  const [listings, setListings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState<any>(null);

  const fetchListings = async (status: string, p: number) => {
    setLoading(true);
    try {
      const parts = [status ? `status=${status}` : '', `page=${p}`, `per_page=${PER_PAGE}`].filter(Boolean).join('&');
      const res = await donor.getListings(`?${parts}`);
      setListings(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta || null);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { setPage(1); }, [tab]);
  React.useEffect(() => { fetchListings(tab, page); }, [tab, page]);

  const lastPage = meta?.last_page || 1;
  const total = meta?.total || 0;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, backgroundColor: C.bg }}>
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontWeight: '700', fontSize: 20, color: C.textDark }}>My Listings</Text>
        </View>
        {/* Tab filter */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: tab === t.key ? C.green : C.surface2,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: tab === t.key ? '700' : '500',
                color: tab === t.key ? '#fff' : C.textMid,
              }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading ? (
          <Spinner />
        ) : listings.length === 0 ? (
          <EmptyState icon="📋" title="No listings" subtitle={tab ? `No ${tab} listings` : 'No listings yet'} />
        ) : (
          listings.map((l: any) => (
            <ListingCard
              key={l.id}
              listing={l}
              onPress={() => router.push(`/donor/listing-detail?id=${l.id}` as any)}
            />
          ))
        )}

        {!loading && lastPage > 1 && (
          <NotifPagination page={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onChange={p => setPage(p)} />
        )}
      </View>
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        onPress={() => router.push('/donor/create-listing' as any)}
        activeOpacity={0.7}
        style={{
          position: 'absolute',
          bottom: 85 + insets.bottom,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: C.green,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom nav */}
      <BottomNavBar tabs={DONOR_TABS} active="/donor/listings" />
    </View>
  );
}
