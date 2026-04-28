// src/screens/recipient/RecipientMyClaimsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { recipient } from '../../api/recipient';
import Spinner from '../../components/Spinner';
import NotifPagination from '../../components/NotifPagination';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TABS = [
  { key: 'pending', label: 'Pending', icon: 'clock-outline' },
  { key: 'confirmed', label: 'Confirmed', icon: 'check-circle-outline' },
  { key: 'completed', label: 'Completed', icon: 'check-decagram' },
  { key: '', label: 'All', icon: 'view-list-outline' },
];

const EMPTY_CONFIG: Record<string, { icon: string; title: string; subtitle: string }> = {
  pending:    { icon: 'clock-outline',        title: 'No pending claims',    subtitle: 'Claim a listing to see it here' },
  confirmed:  { icon: 'check-circle-outline', title: 'No confirmed claims',  subtitle: 'When a donor confirms your claim it shows here' },
  completed:  { icon: 'check-decagram',      title: 'No completed claims',  subtitle: 'Collected food will appear here' },
  '':          { icon: 'inbox-outline',       title: 'No claims yet',        subtitle: "You haven't claimed any food listings yet" },
};

const PER_PAGE = 10;

export default function RecipientMyClaimsScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = React.useState('pending');
  const [claims, setClaims] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState<any>(null);

  const fetchClaims = async (status: string, p: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const parts = [status ? `status=${status}` : '', `page=${p}`, `per_page=${PER_PAGE}`].filter(Boolean).join('&');
      const res = await recipient.getClaims(`?${parts}`);
      setClaims(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta || null);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => { setPage(1); }, [tab]);
  React.useEffect(() => { fetchClaims(tab, page); }, [tab, page]);

  const lastPage = meta?.last_page || 1;
  const total = meta?.total || 0;
  const empty = EMPTY_CONFIG[tab] || EMPTY_CONFIG[''];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex:1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchClaims(tab, page, true)} tintColor={C.green} colors={[C.green]} />
        }
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontWeight: '800', fontSize: 22, color: C.textDark }}>My Claims</Text>
            {total > 0 && !loading && (
              <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{total} claim{total !== 1 ? 's' : ''} {tab || 'total'}</Text>
            )}
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
            {TABS.map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: tab === t.key ? C.green : C.surface2 }}
              >
                <MaterialCommunityIcons name={t.icon as any} size={15} color={tab === t.key ? '#fff' : C.textMid} />
                <Text style={{ fontSize: 14, fontWeight: tab === t.key ? '700' : '500', color: tab === t.key ? '#fff' : C.textMid }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {loading ? (
            <Spinner />
          ) : claims.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <MaterialCommunityIcons name={empty.icon as any} size={32} color={C.textLight} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>{empty.title}</Text>
              <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 }}>{empty.subtitle}</Text>
            </View>
          ) : (
            claims.map((c: any) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(`/recipient/listing-detail?id=${c.food_listing_id}` as any)}
                activeOpacity={0.85}
                style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }} numberOfLines={1}>{c.listing?.title || 'Listing'}</Text>
                  </View>
                  <View style={{ backgroundColor: c.status === 'confirmed' ? C.tagGreen : c.status === 'pending' ? C.tagAmber : C.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.status === 'confirmed' ? C.green : c.status === 'pending' ? C.amber : C.textMid }}>{c.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {!loading && lastPage > 1 && (
            <NotifPagination page={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onChange={p => setPage(p)} />
          )}
        </View>
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/my-claims" />
    </View>
  );
}