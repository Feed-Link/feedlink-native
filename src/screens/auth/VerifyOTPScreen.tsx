import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '../../theme';
import Btn from '../../components/Btn';
import ScreenHeader from '../../components/ScreenHeader';
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
    if (e.nativeEvent.key === 'Backspace' && !otp[i] && i > 0 && refs[i - 1]) {
      refs[i - 1].focus();
    }
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

  return (
    <View style={styles.container}>
      <ScreenHeader title="Verify Email" onBack={() => router.push(backTarget as any)} />
      <View style={styles.body}>
        <Text style={styles.heading}>Verify your email</Text>
        <Text style={styles.subheading}>We sent a 6-digit code to <Text style={{ fontWeight: '700' }}>{email}</Text></Text>
        <View style={styles.otpRow}>
          {otp.map((v, i) => (
            <TextInput
              key={i}
              ref={r => { if (r) refs[i] = r; }}
              maxLength={1}
              value={v}
              onChangeText={val => handleChange(i, val)}
              onKeyPress={e => handleKey(i, e)}
              style={[styles.otpBox, v ? styles.otpBoxFilled : {}]}
              keyboardType="number-pad"
              textAlign="center"
              fontSize={22}
              fontWeight="700"
              color={C.textDark}
              selectTextOnFocus
            />
          ))}
        </View>
        <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading}>
          {loading ? 'Verifying…' : 'Verify'}
        </Btn>
        <View style={styles.resendRow}>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>Resend code in {resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={resend} activeOpacity={0.7}>
              <Text style={styles.resendLink}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  body: { padding: 32, paddingHorizontal: 24 },
  heading: { fontWeight: '700', fontSize: 22, color: C.textDark, marginBottom: 8 },
  subheading: { fontSize: 14, color: C.textMid, marginBottom: 32 },
  otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 32 },
  otpBox: {
    width: 46, height: 60, borderRadius: 12, borderWidth: 2, borderColor: C.border,
    backgroundColor: C.surface, fontSize: 22, fontWeight: '700', textAlign: 'center',
  },
  otpBoxFilled: { borderColor: C.amber },
  resendRow: { marginTop: 20, alignItems: 'center' },
  resendTimer: { color: C.textMid, fontWeight: '700', fontSize: 14 },
  resendLink: { color: C.amber, fontWeight: '700', fontSize: 14 },
});
