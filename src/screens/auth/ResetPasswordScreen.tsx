import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function ResetPasswordScreen() {
  const { email: urlEmail } = useLocalSearchParams<{ email?: string }>();
  const email = urlEmail || '';
  const [form, setForm] = React.useState({ otp: '', password: '', confirm: '' });
  const [loading, setLoading] = React.useState(false);
  const { showToast, setUser, setRole } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Green header */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingBottom: 48, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => router.push('/forgot-password' as any)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <MaterialCommunityIcons name="shield-key-outline" size={28} color="#fff" />
          </View>
          <Text style={{ fontWeight: '800', fontSize: 24, color: '#fff' }}>Create new password</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Enter the code sent to <Text style={{ fontWeight: '700', color: '#fff' }}>{email}</Text></Text>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: -24, backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}>
          <Input label="OTP Code" value={form.otp} onChangeText={update('otp')} placeholder="6-digit code" keyboardType="number-pad" />
          <Input label="New Password" value={form.password} onChangeText={update('password')} placeholder="Min 6 characters" secureTextEntry />
          <Input label="Confirm Password" value={form.confirm} onChangeText={update('confirm')} placeholder="Repeat password" secureTextEntry />
          <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading} loading={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </Btn>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
