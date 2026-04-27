import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function LoginScreen() {
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const { showToast, setUser, setRole } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const update = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.email || !form.password) { showToast('Please fill all fields', 'error'); return; }
    setLoading(true);
    try {
      const res = await authApi.auth.login({ email: form.email, password: form.password });
      authApi.setTokens(res.data.access_token, res.data.refresh_token);
      const profile = await authApi.auth.getProfile();
      const userRole = profile.data?.roles?.[0] || 'donor';
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('fl_role', userRole);
      await AsyncStorage.setItem('fl_user', JSON.stringify(profile.data));
      setUser(profile.data);
      setRole(userRole);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showToast('Welcome back!', 'success');
      router.replace(`/${userRole}/home` as any);
    } catch (e: any) {
      const msg = (e.message || '').toLowerCase();
      const isUnverified = msg.includes('verif') || msg.includes('not verified') || msg.includes('email');
      if (isUnverified && form.email) {
        try { await authApi.auth.resendOtp({ email: form.email }); } catch (_) {}
        showToast('Please verify your email first. A code has been sent.', 'error');
        router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&context=login` as any);
      } else {
        showToast(e.message || 'Login failed', 'error');
      }
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Green header */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 32, paddingBottom: 48, alignItems: 'center' }}>
          <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <MaterialCommunityIcons name="leaf" size={36} color="#fff" />
          </View>
          <Text style={{ fontWeight: '800', fontSize: 26, color: '#fff' }}>Welcome back</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Log in to your FeedLink account</Text>
        </View>

        {/* Form card overlapping header */}
        <View style={{ marginHorizontal: 20, marginTop: -24, backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}>
          <Input label="Email" value={form.email} onChangeText={update('email')} placeholder="hello@example.com" keyboardType="email-address" />
          <Input label="Password" value={form.password} onChangeText={update('password')} placeholder="••••••••••" secureTextEntry />
          <TouchableOpacity onPress={() => router.push('/forgot-password' as any)} style={{ alignItems: 'flex-end', marginTop: -8, marginBottom: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.amber }}>Forgot password?</Text>
          </TouchableOpacity>
          <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading} loading={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </Btn>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 14, color: C.textMid, marginTop: 20, paddingBottom: insets.bottom + 24 }}>
          Don't have an account?{' '}
          <Text style={{ color: C.amber, fontWeight: '700' }} onPress={() => router.push('/onboarding' as any)}>Sign up</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
