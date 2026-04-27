import React from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Btn from '../../components/Btn';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function VerifyOTPScreen() {
  const { email: urlEmail, context: urlContext, role: urlRole, password: urlPass } = useLocalSearchParams<{
    email?: string; context?: string; role?: string; password?: string;
  }>();
  const email = urlEmail || '';
  const context = urlContext || 'register';
  const role = urlRole || 'donor';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast, setUser, setRole } = useApp();

  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [loading, setLoading] = React.useState(false);
  const [resendTimer, setResendTimer] = React.useState(45);
  const refs = React.useRef<TextInput[]>([]).current;

  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (i: number, v: string) => {
    const val = v.replace(/\D/g, '').slice(0, 1);
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5 && refs[i + 1]) refs[i + 1].focus();
  };

  const handleKey = (i: number, e: any) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[i] && i > 0 && refs[i - 1]) refs[i - 1].focus();
  };

  const submit = async () => {
    const code = otp.join('');
    if (code.length < 6) { showToast('Enter full 6-digit code', 'error'); return; }
    setLoading(true);
    try {
      let res;
      if (context === 'reset') {
        res = await authApi.auth.resetPassword({ email, otp: code, password: urlPass || '', password_confirmation: urlPass || '' });
      } else {
        res = await authApi.auth.verifyOtp({ email, otp: code });
      }
      if (res.data?.access_token) {
        authApi.setTokens(res.data.access_token, res.data.refresh_token);
        const profile = await authApi.auth.getProfile();
        const userRole = profile.data?.roles?.[0] || role;
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        await AsyncStorage.setItem('fl_role', userRole);
        await AsyncStorage.setItem('fl_user', JSON.stringify(profile.data));
        setUser(profile.data);
        setRole(userRole);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        showToast('Welcome to FeedLink!', 'success');
        router.replace(`/${userRole}/home` as any);
      } else {
        showToast('Verified!', 'success');
        router.push('/login' as any);
      }
    } catch (e: any) {
      showToast(e.message || 'Verification failed', 'error');
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      await authApi.auth.resendOtp({ email });
      setResendTimer(45);
      showToast('Code resent!', 'success');
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const backTarget = context === 'reset' ? '/forgot-password' : context === 'login' ? '/login' : '/register';
  const filledCount = otp.filter(v => v).length;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Green header */}
      <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingBottom: 48, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.push(backTarget as any)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <MaterialCommunityIcons name="email-check-outline" size={28} color="#fff" />
        </View>
        <Text style={{ fontWeight: '800', fontSize: 24, color: '#fff' }}>Verify your email</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
          We sent a 6-digit code to{'\n'}<Text style={{ fontWeight: '700', color: '#fff' }}>{email}</Text>
        </Text>
      </View>

      {/* Card */}
      <View style={{ marginHorizontal: 20, marginTop: -24, backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}>
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {otp.map((_, i) => (
            <View key={i} style={{ width: i < filledCount ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: i < filledCount ? C.amber : C.border }} />
          ))}
        </View>

        {/* OTP boxes */}
        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          {otp.map((v, i) => (
            <TextInput
              key={i}
              ref={r => { if (r) refs[i] = r; }}
              maxLength={1}
              value={v}
              onChangeText={val => handleChange(i, val)}
              onKeyPress={e => handleKey(i, e)}
              keyboardType="number-pad"
              textAlign="center"
              selectTextOnFocus
              style={{
                width: 46, height: 58, borderRadius: 14, borderWidth: 2,
                borderColor: v ? C.amber : C.border,
                backgroundColor: v ? C.tagAmber : C.surface2,
                fontSize: 24, fontWeight: '700', color: C.textDark, textAlign: 'center',
              }}
            />
          ))}
        </View>

        <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading || filledCount < 6} loading={loading}>
          {loading ? 'Verifying…' : 'Verify Code'}
        </Btn>

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          {resendTimer > 0 ? (
            <Text style={{ fontSize: 13, color: C.textMid }}>
              Resend code in <Text style={{ fontWeight: '700', color: C.textDark }}>{resendTimer}s</Text>
            </Text>
          ) : (
            <TouchableOpacity onPress={resend} activeOpacity={0.7}>
              <Text style={{ fontSize: 14, color: C.amber, fontWeight: '700' }}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
