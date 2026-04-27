import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../theme';
import { useApp } from '../../context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function SplashScreen() {
  const router = useRouter();
  const { role } = useApp();

  React.useEffect(() => {
    const t = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      router.replace(role ? `/${role}/home` as any : '/onboarding' as any);
    }, 2000);
    return () => clearTimeout(t);
  }, [role]);

  return (
    <View style={{ flex: 1, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <View style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="leaf" size={48} color="#fff" />
      </View>
      <Text style={{ fontWeight: '800', fontSize: 34, color: '#fff', letterSpacing: -0.5 }}>FeedLink</Text>
      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', maxWidth: 240, lineHeight: 20 }}>
        Share food. Reduce waste. Feed your community.
      </Text>
      <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" style={{ marginTop: 24 }} />
    </View>
  );
}
