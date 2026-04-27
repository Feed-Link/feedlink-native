import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { C } from '../../theme';
import { useApp } from '../../context/AppContext';

export default function SplashScreen() {
  const router = useRouter();
  const { role } = useApp();

  React.useEffect(() => {
    const t = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      if (role) {
        router.replace(`/${role}/home` as any);
      } else {
        router.replace('/auth/onboarding' as any);
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [role]);

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>🌿</Text>
      </View>
      <Text style={styles.title}>FeedLink</Text>
      <Text style={styles.subtitle}>Share food. Reduce waste. Feed your community.</Text>
      <View style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    background: `linear-gradient(${C.green} 0%, ${C.greenDark} 100%)`,
    backgroundColor: C.green,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48,
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    fontWeight: '800',
    fontSize: 32,
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 260,
  },
  spinner: {
    marginTop: 32,
    width: 36,
    height: 36,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: 18,
  },
});
