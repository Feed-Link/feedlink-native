// src/screens/recipient/RecipientNotificationsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { notifications } from '../../api/client';
import Spinner from '../../components/Spinner';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICONS: Record<string, { icon: string; color: string; bgColor: string }> = {
  claim_confirmed:             { icon: 'check-circle-outline',   color: C.green, bgColor: C.tagGreen },
  claim_rejected:              { icon: 'close-circle-outline',   color: C.red,   bgColor: '#fee2e2' },
  pickup_completed:            { icon: 'check-decagram',         color: C.green, bgColor: C.tagGreen },
  request_accepted:            { icon: 'basket',              color: C.green, bgColor: C.tagGreen },
  acceptance_confirmed:        { icon: 'heart-circle-outline',   color: C.green, bgColor: C.tagGreen },
  acceptance_rejected:         { icon: 'heart-broken-outline',   color: C.red,   bgColor: '#fee2e2' },
  request_fulfilled:            { icon: 'clipboard-check-outline', color: C.green, bgColor: C.tagGreen },
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function RecipientNotificationsScreen() {
  const { showToast, setUnreadCount } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = React.useState<any[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(false);

  const loadFirst = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await notifications.getNotifications('?cursor=true&per_page=15');
      const data = res.data;
      setItems(data?.items || []);
      setUnread(data?.unread_count || 0);
      setNextCursor(data?.meta?.next_cursor || null);
      setHasMore(data?.meta?.has_more || false);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await notifications.getNotifications(`?cursor=${nextCursor}&per_page=15`);
      const data = res.data;
      setItems(prev => [...prev, ...(data?.items || [])]);
      setNextCursor(data?.meta?.next_cursor || null);
      setHasMore(data?.meta?.has_more || false);
    } catch (e: any) {
      showToast(e.message || 'Failed to load more', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notifications.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnread(0);
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  const markRead = async (id: string) => {
    try {
      await notifications.markRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const getNavTarget = (n: any): string | null => {
    let data = n.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = {}; } }
    if (!data || typeof data !== 'object') data = {};

    const listingId = data.listing_id || data.listingId || n.listing_id || n.listingId;
    const requestId = data.request_id || data.requestId || n.request_id || n.requestId;

    const listingTypes = ['claim_received', 'claim_confirmed', 'claim_rejected',
      'pickup_completed', 'listing_expired', 'listing_expired_uncollected',
      'listing_cancelled', 'listing_reopened'];

    if (listingTypes.includes(n.type) && listingId) {
      return `/recipient/listing-detail?id=${listingId}`;
    }
    if (['request_accepted', 'acceptance_confirmed', 'acceptance_rejected', 'request_fulfilled'].includes(n.type) && requestId) {
      return `/recipient/request-detail?id=${requestId}`;
    }
    return null;
  };

  React.useEffect(() => { setUnreadCount(0); loadFirst(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFirst(true)} tintColor={C.green} colors={[C.green]} />}
      >
        {/* Green header */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontWeight: '700', fontSize: 22, color: '#fff' }}>Notifications</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                {unread > 0 ? `${unread} unread` : 'All caught up'}
              </Text>
            </View>
            {unread > 0 && (
              <TouchableOpacity
                onPress={markAllRead}
                activeOpacity={0.7}
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 }}
              >
                <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.tagGreen, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="bell-check-outline" size={32} color={C.green} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>All caught up!</Text>
              <Text style={{ fontSize: 13, color: C.textMid }}>No notifications yet</Text>
            </View>
          ) : (
            <>
              {items.map((n: any) => {
                const iconDef = ICONS[n.type] || { icon: 'bell-outline', color: C.textMid, bgColor: C.surface2 };
                const isUnread = !n.read_at;

                return (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => {
                      if (isUnread) markRead(n.id);
                      const navTarget = getNavTarget(n);
                      if (navTarget) {
                        router.push(navTarget as any);
                      } else {
                        showToast(`Cannot open notification`, 'error');
                      }
                    }}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: C.surface,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 10,
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'flex-start',
                      borderWidth: 1,
                      borderColor: isUnread ? 'rgba(22,163,74,0.2)' : C.border,
                      borderLeftWidth: isUnread ? 3 : 1,
                      borderLeftColor: isUnread ? C.green : C.border,
                      shadowColor: '#000',
                      shadowOpacity: isUnread ? 0.06 : 0.03,
                      shadowRadius: 6,
                      elevation: isUnread ? 2 : 1,
                    }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: n.read_at ? C.surface2 : iconDef.bgColor, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MaterialCommunityIcons name={iconDef.icon as any} size={22} color={n.read_at ? C.textLight : iconDef.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: isUnread ? '700' : '600', fontSize: 14, color: C.textDark, marginBottom: 3 }}>{n.title}</Text>
                      <Text style={{ fontSize: 13, color: C.textMid, lineHeight: 18, marginBottom: 6 }}>{n.body}</Text>
                      <Text style={{ fontSize: 11, color: C.textLight, fontWeight: '500' }}>{timeAgo(n.created_at)}</Text>
                    </View>
                    {isUnread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.green, marginTop: 4, flexShrink: 0 }} />}
                  </TouchableOpacity>
                );
              })}

              {/* Load more */}
              {hasMore && (
                <TouchableOpacity
                  onPress={loadMore}
                  disabled={loadingMore}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 4, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }}
                >
                  {loadingMore
                    ? <ActivityIndicator size="small" color={C.green} />
                    : <>
                        <MaterialCommunityIcons name="chevron-down" size={18} color={C.green} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.green }}>Load more</Text>
                      </>
                  }
                </TouchableOpacity>
              )}

              {!hasMore && items.length > 0 && (
                <Text style={{ textAlign: 'center', fontSize: 12, color: C.textLight, paddingVertical: 16 }}>You've seen all notifications</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/notifications" />
    </View>
  );
}
