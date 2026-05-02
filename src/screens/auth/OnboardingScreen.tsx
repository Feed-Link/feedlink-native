import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Btn from '../../components/Btn';

const OPTIONS = [
  { value: 'donor', title: 'Donate Food', sub: 'I have surplus food to share with others', icon: 'hand-heart-outline', color: C.green, bg: C.tagGreen },
  { value: 'recipient', title: 'Receive Food', sub: "I'm looking for food for myself or my community", icon: 'account-heart-outline', color: C.amber, bg: C.tagAmber },
  { value: 'guest', title: 'Quick Post', sub: 'Post food without creating an account', icon: 'food-outline', color: C.blue, bg: 'rgba(61,133,220,0.1)' },
];

export default function OnboardingScreen() {
  const [role, setRole] = React.useState('donor');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSelect = (v: string) => {
    setRole(v);
    Haptics.selectionAsync().catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Green header */}
      <View style={{ backgroundColor: C.green, paddingTop: insets.top + 32, paddingBottom: 40, alignItems: 'center', paddingHorizontal: 24 }}>
        <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <MaterialCommunityIcons name="leaf" size={36} color="#fff" />
        </View>
        <Text style={{ fontWeight: '800', fontSize: 26, color: '#fff', letterSpacing: -0.5 }}>FeedLink</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>How would you like to join?</Text>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 28 }}>
        <Text style={{ fontWeight: '800', fontSize: 22, color: C.textDark, marginBottom: 6 }}>I want to…</Text>
        <Text style={{ fontSize: 14, color: C.textMid, marginBottom: 24 }}>Pick how you'd like to use FeedLink.</Text>

        <View style={{ gap: 14 }}>
          {OPTIONS.map(opt => {
            const selected = role === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.85}
                style={{
                  borderRadius: 20, padding: 20, borderWidth: 2,
                  flexDirection: 'row', alignItems: 'center', gap: 16,
                  borderColor: selected ? opt.color : C.border,
                  backgroundColor: selected ? (opt.value === 'donor' ? 'rgba(22,163,74,0.04)' : opt.value === 'recipient' ? 'rgba(245,158,11,0.04)' : 'rgba(61,133,220,0.04)') : C.surface,
                }}
              >
                <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: selected ? opt.bg : C.surface2, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name={opt.icon as any} size={28} color={selected ? opt.color : C.textMid} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 16, color: C.textDark }}>{opt.title}</Text>
                  <Text style={{ fontSize: 13, color: C.textMid, marginTop: 4 }}>{opt.sub}</Text>
                </View>
                {selected && (
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: opt.color, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name="check" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 24, gap: 14 }}>
        <Btn fullWidth size="lg" variant={role === 'guest' ? 'blue' : 'amber'} onPress={() => router.push(role === 'guest' ? '/guest-register' as any : `/register?role=${role}` as any)}>
          Continue
        </Btn>
        <Text style={{ textAlign: 'center', fontSize: 14, color: C.textMid }}>
          Already have an account?{' '}
          <Text style={{ color: C.amber, fontWeight: '700' }} onPress={() => router.push('/login' as any)}>Log in</Text>
        </Text>
      </View>
    </View>
  );
}
