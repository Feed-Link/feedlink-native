import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { notifications } from '../../api/client';
import EmptyState from '../../components/EmptyState';
import Spinner from '../../components/Spinner';
import NotifPagination from '../../components/NotifPagination';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICONS: Record<string, { icon: string; color: string }> = {
  claim_received: { icon: 'package-variant', color: C.green },
  claim_confirmed: { icon: 'check-circle', color: C.green },
  claim_rejected: { icon: 'close-circle', color: C.red },
  pickup_completed: { icon: 'check-all', color: C.green },
  listing_expired_uncollected: { icon: 'clock-alert', color: C.amber },
  request_accepted: { icon: 'handshake', color: C.green },
  acceptance_confirmed: { icon: 'check-circle', color: C.green },
  acceptance_rejected: { icon: 'close-circle', color: C.red },
  listing_cancelled: { icon: 'trash-can', color: C.red },
  listing_reopened: { icon: 'refresh', color: C.green },
};

const PER_PAGE = 15;

export default function DonorNotificationsScreen() {
  const { showToast, setUnreadCount } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = React.useState<any[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState<any>(null);

  const load = async (p = page) => {
    setLoading(true);
    try {
      const res = await notifications.getNotifications(`?page=${p}&per_page=${PER_PAGE}`);
      setItems(res.data?.items || []);
      setUnread(res.data?.unread_count || 0);
      setMeta(res.data?.meta || null);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear badge when screen is open
  React.useEffect(() => { setUnreadCount(0); }, []);

  React.useEffect(() => { load(page); }, [page]);

  const markAllRead = async () => {
    try {
      await notifications.markAllRead();
      load(page);
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  const markRead = async (id: string) => {
    try {
      await notifications.markRead(id);
      load(page);
    } catch (_) {}
  };

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
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: C.bg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: '700', fontSize: 22, color: C.textDark }}>Notifications</Text>
              {unread > 0 && (
                <Text style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>{unread} unread</Text>
              )}
            </View>
            {unread > 0 && (
              <TouchableOpacity onPress={markAllRead} activeOpacity={0.6} style={{ paddingVertical: 8, paddingHorizontal: 12 }}>
                <Text style={{ fontSize: 13, color: C.green, fontWeight: '600' }}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <EmptyState icon={<MaterialCommunityIcons name="bell-off" size={36} color={C.textLight} />} title="No notifications" subtitle="You're all caught up!" />
          ) : (
            items.map((n: any) => {
              const iconDef = ICONS[n.type] || { icon: 'bell', color: C.textMid };
              return (
                <TouchableOpacity
                  key={n.id}
                  onPress={() => markRead(n.id)}
                  activeOpacity={0.6}
                  style={{
                    backgroundColor: C.surface,
                    borderWidth: 1,
                    borderColor: C.border,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 12,
                    flexDirection: 'row',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  <View style={{
                    width: 44, height: 44, borderRadius: 10,
                    backgroundColor: n.read_at ? C.surface2 : `${iconDef.color}15`,
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <MaterialCommunityIcons name={iconDef.icon as any} size={22} color={n.read_at ? C.textLight : iconDef.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14, color: C.textDark, marginBottom: 4 }}>{n.title}</Text>
                    <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 6, lineHeight: 18 }}>{n.body}</Text>
                    <Text style={{ fontSize: 11, color: C.textLight }}>{new Date(n.created_at).toLocaleString()}</Text>
                  </View>
                  {!n.read_at && (
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.green, flexShrink: 0, marginTop: 2 }} />
                  )}
                </TouchableOpacity>
              );
            })
          )}

          {!loading && lastPage > 1 && (
            <NotifPagination page={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onChange={p => setPage(p)} />
          )}
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <BottomNavBar tabs={DONOR_TABS} active="/donor/notifications" />
    </View>
  );
}
