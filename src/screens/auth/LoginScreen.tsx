import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { C } from '../../theme';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function LoginScreen() {
  const [form, setForm] = React.useState({ email: '', password: '' });
  const [loading, setLoading] = React.useState(false);
  const { showToast, setUser, setRole } = useApp();
  const router = useRouter();

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
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>🌿</Text>
        </View>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Log in to your FeedLink account</Text>

        <View style={styles.form}>
          <Input label="Email" value={form.email} onChangeText={update('email')} placeholder="hello@example.com" keyboardType="email-address" />
          <Input label="Password" value={form.password} onChangeText={update('password')} placeholder="••••••••••" secureTextEntry />
          <TouchableOpacity style={styles.forgotRow} onPress={() => router.push('/forgot-password' as any)}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>
          <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading}>
            {loading ? 'Logging in…' : 'Log In'}
          </Btn>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => router.push('/onboarding' as any)}>Sign up</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  body: { paddingTop: 60, paddingHorizontal: 24, alignItems: 'center' },
  logoBox: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: C.amber,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  logoText: { fontSize: 32 },
  heading: { fontWeight: '700', fontSize: 26, color: C.textDark, marginBottom: 4 },
  subheading: { fontSize: 14, color: C.textMid, marginBottom: 32 },
  form: { width: '100%' },
  forgotRow: { alignItems: 'flex-end', marginTop: -8, marginBottom: 20 },
  forgotLink: { fontSize: 14, fontWeight: '700', color: C.amber },
  signupText: { textAlign: 'center', fontSize: 14, color: C.textMid, marginTop: 20 },
  signupLink: { color: C.amber, fontWeight: '700' },
});
