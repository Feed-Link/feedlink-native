import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import { auth, clearTokens } from '../../api/client';
import Avatar from '../../components/Avatar';
import Btn from '../../components/Btn';
import ConfirmModal from '../../components/ConfirmModal';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';

export default function DonorProfileScreen() {
  const { user, setUser, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = React.useState<any>(null);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  React.useEffect(() => {
    donor.getStats().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const logout = async () => {
    try { await auth.logout(); } catch (_) {}
    clearTokens();
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem('fl_role');
    await AsyncStorage.removeItem('fl_user');
    setUser(null);
    router.replace('/onboarding' as any);
  };

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
          paddingTop: insets.top + 12,
          paddingHorizontal: 16,
          paddingBottom: 80,
        }}>
          <Text style={{ fontWeight: '700', fontSize: 20, color: '#fff' }}>Profile</Text>
        </View>

        {/* Profile card */}
        <View style={{ paddingHorizontal: 16, marginTop: -52 }}>
          <View style={{
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 24,
            padding: 16,
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              <Avatar name={user?.name} size={64} color={C.green} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 17, color: C.textDark }}>{user?.name}</Text>
                <View style={{
                  backgroundColor: C.tagGreen,
                  borderRadius: 99,
                  paddingHorizontal: 12,
                  paddingVertical: 3,
                  marginTop: 4,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.green }}>Donor</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/donor/edit-profile' as any)}
                activeOpacity={0.7}
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  backgroundColor: C.surface2,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16 }}>✏️</Text>
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: C.surface2, borderRadius: 8, padding: 6, marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: C.textDark }}>✉ {user?.email || '–'}</Text>
            </View>
            <View style={{ backgroundColor: C.surface2, borderRadius: 8, padding: 6 }}>
              <Text style={{ fontSize: 12, color: C.textDark }}>📞 {user?.contact || '–'}</Text>
            </View>
          </View>

          {/* Stats */}
          {stats && (
            <View style={{
              backgroundColor: C.surface,
              borderWidth: 1,
              borderColor: C.border,
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid, marginBottom: 12, textTransform: 'uppercase' }}>IMPACT</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { label: 'Completed', val: stats.listings_completed },
                  { label: 'Recipients', val: stats.unique_recipients_served },
                  { label: 'Active', val: stats.listings_active },
                ].map(s => (
                  <View key={s.label} style={{ flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 10, alignItems: 'center' }}>
                    <Text style={{ fontWeight: '700', fontSize: 22, color: C.green }}>{s.val}</Text>
                    <Text style={{ fontSize: 10, color: C.textMid, fontWeight: '600' }}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Account */}
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid, marginBottom: 8, textTransform: 'uppercase' }}>ACCOUNT</Text>
          <View style={{
            backgroundColor: C.surface,
            borderWidth: 1,
            borderColor: C.border,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            {[
              { label: 'Edit profile', action: () => router.push('/donor/edit-profile' as any) },
              { label: 'About FeedLink', action: () => {} },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <TouchableOpacity
                  onPress={item.action}
                  activeOpacity={0.7}
                  style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>{item.label}</Text>
                  <Text style={{ fontSize: 18, color: C.textLight }}>›</Text>
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 16 }} />}
              </View>
            ))}
          </View>

          <Btn
            variant="danger"
            size="lg"
            fullWidth
            onPress={() => setConfirmLogout(true)}
            style={{ borderColor: 'rgb(250,202,202)' }}
          >Log out</Btn>
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <BottomNavBar tabs={DONOR_TABS} active="/donor/profile" />

      {/* Logout confirmation modal */}
      {confirmLogout && (
        <ConfirmModal
          title="Log out?"
          message="You will need to log in again."
          confirmLabel="Log out"
          danger
          onConfirm={logout}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </View>
  );
}
