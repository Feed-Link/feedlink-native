// src/screens/recipient/RecipientProfileScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { recipient } from '../../api/recipient';
import { auth, clearTokens } from '../../api/client';
import Avatar from '../../components/Avatar';
import ConfirmModal from '../../components/ConfirmModal';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RecipientProfileScreen() {
  const { user, setUser, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = React.useState<any>(null);
  const [confirmLogout, setConfirmLogout] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      recipient.getClaims(),
      recipient.getRequests(),
    ]).then(([cRes, rRes]) => {
      const claims = Array.isArray(cRes.data) ? cRes.data : [];
      const requests = Array.isArray(rRes.data) ? rRes.data : [];
      setStats({
        collected: claims.filter((c: any) => c.status === 'collected').length,
        active_claims: claims.filter((c: any) => ['pending', 'confirmed'].includes(c.status)).length,
        requests: requests.length,
      });
    }).catch(() => {});
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }} showsVerticalScrollIndicator={false}>

        {/* Green header with avatar */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 64, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', fontSize: 17, color: '#fff', alignSelf: 'flex-start', marginBottom: 20 }}>Profile</Text>
          <View style={{ position: 'relative' }}>
            <Avatar name={user?.name} size={84} color={C.green} />
            <TouchableOpacity
              onPress={() => router.push('/recipient/edit-profile' as any)}
              activeOpacity={0.8}
              style={{ position: 'absolute', bottom: 0, right: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 }}
            >
              <MaterialCommunityIcons name="pencil" size={14} color={C.green} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontWeight: '700', fontSize: 18, color: '#fff', marginTop: 12 }}>{user?.name}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Recipient</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -28 }}>

          {/* Stats */}
          {stats && (
            <View style={{ backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Your Impact</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[
                  { label: 'Collected', val: stats.collected ?? 0, icon: 'check-decagram', nav: null },
                  { label: 'Active Claims', val: stats.active_claims ?? 0, icon: 'basket', nav: '/recipient/my-claims' },
                  { label: 'Requests', val: stats.requests ?? 0, icon: 'clipboard-text', nav: '/recipient/create-request' },
                ].map(s => (
                  <TouchableOpacity key={s.label} onPress={() => s.nav && router.push(s.nav as any)} activeOpacity={s.nav ? 0.7 : 1} style={{ flex: 1, backgroundColor: C.bg, borderRadius: 14, padding: 12, alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.tagGreen, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialCommunityIcons name={s.icon as any} size={16} color={C.green} />
                    </View>
                    <Text style={{ fontWeight: '800', fontSize: 22, color: C.textDark }}>{s.val}</Text>
                    <Text style={{ fontSize: 10, color: C.textMid, fontWeight: '600', textAlign: 'center' }}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Contact info */}
          <View style={{ backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            {[
              { icon: 'email-outline', label: 'Email', value: user?.email || '–' },
              { icon: 'phone-outline', label: 'Phone', value: user?.contact || '–' },
            ].map((row, i) => (
              <View key={row.label}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name={row.icon as any} size={18} color={C.textMid} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: C.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>{row.label}</Text>
                    <Text style={{ fontSize: 14, color: C.textDark, fontWeight: '500', marginTop: 1 }}>{row.value}</Text>
                  </View>
                </View>
                {i === 0 && <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 16 }} />}
              </View>
            ))}
          </View>

          {/* Account actions */}
          <View style={{ backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            {[
              { icon: 'account-edit-outline', label: 'Edit profile', color: C.textDark, action: () => router.push('/recipient/edit-profile' as any) },
              { icon: 'information-outline', label: 'About FeedLink', color: C.textDark, action: () => {} },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <TouchableOpacity onPress={item.action} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: item.color }}>{item.label}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={C.textLight} />
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 16 }} />}
              </View>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={() => setConfirmLogout(true)}
            activeOpacity={0.8}
            style={{ backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: 'rgb(250,202,202)', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgb(254,242,242)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="logout" size={18} color={C.red} />
            </View>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.red }}>Log out</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="rgb(250,202,202)" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/profile" />

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
