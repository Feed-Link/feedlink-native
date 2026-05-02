import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavBar, { GUEST_TABS } from '../../components/BottomNavBar';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';

export default function GuestProfileScreen() {
  const { user, logout, showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Guest Mode', 'Your listings will remain visible until they expire.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', onPress: logout },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}>
        <View style={{ backgroundColor: C.blue, paddingTop: insets.top + 16, paddingBottom: 24, paddingHorizontal: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <MaterialCommunityIcons name="account-circle-outline" size={36} color="#fff" />
            </View>
            <Text style={{ fontWeight: '700', fontSize: 20, color: '#fff' }}>{user?.name || 'Guest'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <MaterialCommunityIcons name="badge-account-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Guest account</Text>
            </View>
          </View>
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {[
            { label: 'Upgrade to full account', icon: 'arrow-up-bold', desc: 'Get your own account and manage listings', color: C.green, action: () => router.push('/guest/upgrade' as any) },
          ].map((item, i) => (
            <TouchableOpacity key={i} onPress={item.action} activeOpacity={0.7} style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.color + '15', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', fontSize: 15, color: C.textDark }}>{item.label}</Text>
                <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{item.desc}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={18} color={C.textLight} />
            </TouchableOpacity>
          ))}

          <View style={{ height: 16 }} />

          <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.red + '15', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="logout" size={22} color={C.red} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', fontSize: 15, color: C.red }}>Exit guest mode</Text>
              <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Go back to onboarding</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={C.textLight} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar tabs={GUEST_TABS} active="/guest/profile" accentColor={C.blue} />
    </View>
  );
}