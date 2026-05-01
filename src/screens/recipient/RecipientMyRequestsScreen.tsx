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
  { key: 'open', label: 'Open', icon: 'clock-outline' },
  { key: 'accepted', label: 'Accepted', icon: 'check-circle-outline' },
  { key: 'fulfilled', label: 'Fulfilled', icon: 'check-decagram' },
  { key: '', label: 'All', icon: 'list' },
];

const EMPTY_CONFIG: Record<string, { icon: string; title: string; subtitle: string }> = {
  open:       { icon: 'clock-outline',   title: 'No open requests',   subtitle: 'Post a request to get food donations' },
  accepted:  { icon: 'check-circle-outline', title: 'No accepted requests', subtitle: 'When a donor accepts your request it shows here' },
  fulfilled: { icon: 'check-decagram',   title: 'No fulfilled requests',subtitle: 'Fulfilled requests appear here' },
  '':         { icon: 'inbox-outline',   title: 'No requests yet',    subtitle: "You haven't posted any food requests yet" },
};

const PER_PAGE = 10;

export default function RecipientMyRequestsScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = React.useState('open');
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);

  const fetchRequests = async ( pg = 1, isRefresh = false ) => {
    if (isRefresh) setRefreshing(true); else if (pg === 1) setLoading(true);
    try {
      const query = `?page=${pg}&per_page=${PER_PAGE}${tab ? `&status=${tab}` : ''}`;
      const res = await recipient.getRequests(query);
      const data = Array.isArray(res.data) ? res.data : [];
      if (pg === 1) {
        setRequests(data);
      } else {
        setRequests(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PER_PAGE);
      setPage(pg);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => { setPage(1); setHasMore(true); fetchRequests(1); }, [tab]);

  const loadMore = () => {
    if (!loading && !refreshing && hasMore) fetchRequests(page + 1);
  };

  const refresh = () => {
    setPage(1); setHasMore(true); fetchRequests(1, true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700', fontSize: 20, color: C.textDark }}>My Requests</Text>
          <TouchableOpacity onPress={() => router.push('/recipient/create-request' as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: C.green, borderRadius: 99 }}>
            <MaterialCommunityIcons name="plus" size={16} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>New</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12, marginHorizontal: -16, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {TABS.map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, backgroundColor: tab === t.key ? C.green : C.surface2, borderWidth: tab === t.key ? 0 : 1, borderColor: C.border }}
              >
                <MaterialCommunityIcons name={t.icon as any} size={15} color={tab === t.key ? '#fff' : C.textMid} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: tab === t.key ? '#fff' : C.textMid }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.green} />}
        onScrollEndReached={loadMore}
      >
        {loading ? (
          <Spinner />
        ) : requests.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name={EMPTY_CONFIG[tab]?.icon || 'inbox-outline'} size={32} color={C.textLight} />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>{EMPTY_CONFIG[tab]?.title || 'No requests'}</Text>
            <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center' }}>{EMPTY_CONFIG[tab]?.subtitle}</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {requests.map((r: any) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => router.push(`/recipient/request-detail?id=${r.id}` as any)}
                activeOpacity={0.85}
                style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, gap: 10 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark, flex: 1 }} numberOfLines={1}>{r.title}</Text>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, backgroundColor: r.status === 'open' ? C.tagGreen : r.status === 'accepted' ? C.tagAmber : C.surface2 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: r.status === 'open' ? C.green : C.textMid, textTransform: 'capitalize' }}>{r.status}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="map-marker-outline" size={13} color={C.textMid} />
                    <Text style={{ fontSize: 12, color: C.textMid }} numberOfLines={1}>{r.address || 'No address'}</Text>
                  </View>
                  {r.distance_km && (
                    <Text style={{ fontSize: 12, color: C.green, fontWeight: '600' }}>{r.distance_km} km</Text>
                  )}
                </View>
                {r.needed_by && (
                  <Text style={{ fontSize: 11, color: C.textLight }}>
                    Needed by {new Date(r.needed_by).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
            {hasMore && (
              <NotifPagination onPress={loadMore} loading={loading} />
            )}
          </View>
        )}
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/my-requests" />
    </View>
  );
}