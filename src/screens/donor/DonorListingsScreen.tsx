import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import ListingCard from '../../components/ListingCard';
import Spinner from '../../components/Spinner';
import NotifPagination from '../../components/NotifPagination';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';

const TABS = [
  { key: 'active', label: 'Active', icon: 'fire' },
  { key: 'claimed', label: 'Claimed', icon: 'basket' },
  { key: 'expired', label: 'Expired', icon: 'clock-remove-outline' },
  { key: '', label: 'All', icon: 'list' },
  { key: 'drafts', label: 'Drafts', icon: 'file-outline' },
];

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest', icon: 'sort-clock-descending-outline' },
  { key: 'expiring', label: 'Expiring soon', icon: 'clock-alert-outline' },
];

const EMPTY_CONFIG: Record<string, { icon: string; title: string; subtitle: string }> = {
  active:  { icon: 'fire',            title: 'No active listings',  subtitle: 'Post a listing and start sharing food today' },
  claimed: { icon: 'basket',       title: 'No claimed listings', subtitle: 'When a recipient claims your food it shows here' },
  expired: { icon: 'clock-remove-outline', title: 'No expired listings', subtitle: 'Listings past their expiry date appear here' },
  drafts: { icon: 'file-outline', title: 'No drafts', subtitle: 'Save a listing draft to finish later' },
  '':      { icon: 'inbox-outline',     title: 'No listings yet',     subtitle: "You haven't posted any food listings yet" },
};

const PER_PAGE = 10;

export default function DonorListingsScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = React.useState('active');
  const [sort, setSort] = React.useState('newest');
  const [listings, setListings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState<any>(null);
  const [drafts, setDrafts] = React.useState<any[]>([]);

  const DRAFTS_KEY = 'fl_listing_drafts';

  const loadDrafts = async () => {
    try {
      const data = await AsyncStorage.getItem(DRAFTS_KEY);
      setDrafts(data ? JSON.parse(data) : []);
    } catch { setDrafts([]); }
  };

  const deleteDraft = async (id: string) => {
    Alert.alert('Delete draft?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = drafts.filter(d => d.id !== id);
          await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
          setDrafts(updated);
          showToast('Draft deleted', 'success');
        },
      },
    ]);
  };

  React.useEffect(() => { loadDrafts(); }, []);

  const fetchListings = async (status: string, p: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const sortParam = sort === 'expiring' ? '&sort=expires_at&direction=asc' : '';
      const parts = [status ? `status=${status}` : '', `page=${p}`, `per_page=${PER_PAGE}`].filter(Boolean).join('&');
      const res = await donor.getListings(`?${parts}${sortParam}`);
      setListings(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta || null);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (tab === 'drafts') {
      loadDrafts();
    } else {
      setPage(1);
      fetchListings(tab, 1);
    }
  }, [tab]);

  React.useEffect(() => {
    if (tab !== 'drafts') fetchListings(tab, page);
  }, [tab, page, sort]);

  const lastPage = meta?.last_page || 1;
  const total = meta?.total || 0;
  const empty = EMPTY_CONFIG[tab] || EMPTY_CONFIG[''];

  const sortedListings = React.useMemo(() => {
    if (sort === 'expiring') {
      return [...listings].sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime());
    }
    return listings;
  }, [listings, sort]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchListings(tab, page, true)}
            tintColor={C.green}
            colors={[C.green]}
          />
        }
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View>
              <Text style={{ fontWeight: '800', fontSize: 22, color: C.textDark }}>My Listings</Text>
              {total > 0 && !loading && (
                <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{total} listing{total !== 1 ? 's' : ''} {tab || 'total'}</Text>
              )}
            </View>
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

          {/* Sort - hide for drafts */}
          {tab !== 'drafts' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="sort-variant" size={14} color={C.textMid} />
              <Text style={{ fontSize: 12, color: C.textMid, fontWeight: '600', marginRight: 4 }}>Sort:</Text>
              {SORT_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => setSort(s.key)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, backgroundColor: sort === s.key ? C.tagGreen : C.surface2, borderWidth: 1, borderColor: sort === s.key ? C.green : 'transparent' }}
                >
                  <MaterialCommunityIcons name={s.icon as any} size={12} color={sort === s.key ? C.green : C.textMid} />
                  <Text style={{ fontSize: 12, fontWeight: sort === s.key ? '700' : '500', color: sort === s.key ? C.green : C.textMid }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {loading ? (
            <Spinner />
          ) : tab === 'drafts' ? (
            drafts.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
                <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  <MaterialCommunityIcons name="file-outline" size={32} color={C.textLight} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>No drafts</Text>
                <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 }}>Save a listing draft to finish later</Text>
              </View>
            ) : (
              drafts.map((d: any) => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => router.push(`/donor/create-listing?draft=${d.id}` as any)}
                  activeOpacity={0.85}
                  style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }} numberOfLines={1}>{d.title || 'Untitled draft'}</Text>
                    <Text style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>
                      Saved {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteDraft(d.id)}
                    style={{ padding: 8 }}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={20} color={C.red} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )
          ) : sortedListings.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <MaterialCommunityIcons name={empty.icon as any} size={32} color={C.textLight} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>{empty.title}</Text>
              <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 }}>{empty.subtitle}</Text>
              {tab === 'active' && (
                <TouchableOpacity
                  onPress={() => router.push('/donor/create-listing' as any)}
                  style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.green, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
                >
                  <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Post your first listing</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            sortedListings.map((l: any) => (
              <ListingCard
                key={l.id}
                listing={l}
                onPress={() => router.push(`/donor/listing-detail?id=${l.id}` as any)}
              />
            ))
          )}

          {!loading && tab !== 'drafts' && lastPage > 1 && (
            <NotifPagination page={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onChange={p => setPage(p)} />
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/donor/create-listing' as any)}
        activeOpacity={0.8}
        style={{ position: 'absolute', bottom: 76 + insets.bottom, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <BottomNavBar tabs={DONOR_TABS} active="/donor/listings" />
    </View>
  );
}
