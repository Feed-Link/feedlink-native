import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '../../theme';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function ResetPasswordScreen() {
  const { email: urlEmail } = useLocalSearchParams<{ email?: string }>();
  const email = urlEmail || '';
  const [form, setForm] = React.useState({ otp: '', password: '', confirm: '' });
  const [loading, setLoading] = React.useState(false);
  const { showToast, setUser, setRole } = useApp();
  const router = useRouter();

  const update = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.otp || !form.password || !form.confirm) { showToast('Fill all fields', 'error'); return; }
    if (form.password !== form.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 6) { showToast('Password min 6 characters', 'error'); return; }
    setLoading(true);
    try {
      const res = await authApi.auth.resetPassword({
        email, otp: form.otp, password: form.password, password_confirmation: form.confirm,
      });
      if (res.data?.access_token) {
        authApi.setTokens(res.data.access_token, res.data.refresh_token);
        const profile = await authApi.auth.getProfile();
        const userRole = profile.data?.roles?.[0] || 'donor';
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem('fl_role', userRole);
        await AsyncStorage.setItem('fl_user', JSON.stringify(profile.data));
        setUser(profile.data);
        setRole(userRole);
        showToast('Password reset!', 'success');
        router.replace(`/${userRole}/home` as any);
      }
    } catch (e: any) {
      showToast(e.message || 'Reset failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Create New Password" onBack={() => router.push('/forgot-password' as any)} />
      <View style={styles.body}>
        <Text style={styles.heading}>Create New Password</Text>
        <Text style={styles.subheading}>Enter the 6-digit code from your email.</Text>
        <View style={styles.form}>
          <Input label="OTP Code" value={form.otp} onChangeText={update('otp')} placeholder="000000" keyboardType="number-pad" />
          <Input label="New Password" value={form.password} onChangeText={update('password')} placeholder="Min 6 characters" secureTextEntry />
          <Input label="Confirm Password" value={form.confirm} onChangeText={update('confirm')} placeholder="Repeat password" secureTextEntry />
        </View>
        <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading}>
          {loading ? 'Resetting…' : 'Reset Password'}
        </Btn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  body: { padding: 32, paddingHorizontal: 24 },
  heading: { fontWeight: '700', fontSize: 22, color: C.textDark, marginBottom: 8 },
  subheading: { fontSize: 14, color: C.textMid, marginBottom: 24 },
  form: { marginBottom: 20 },
});
