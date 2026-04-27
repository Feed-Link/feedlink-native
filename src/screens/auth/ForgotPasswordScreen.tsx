import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../theme';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useApp();
  const router = useRouter();

  const submit = async () => {
    if (!email) { showToast('Enter your email', 'error'); return; }
    setLoading(true);
    try {
      await authApi.auth.forgotPassword({ email });
      showToast('Reset code sent!', 'success');
      router.push(`/reset-password?email=${encodeURIComponent(email)}` as any);
    } catch (e: any) {
      showToast(e.message || 'Failed to send reset code', 'error');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Reset Password" onBack={() => router.push('/login' as any)} />
      <View style={styles.body}>
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subheading}>Enter your email and we'll send you a reset code.</Text>
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="hello@example.com" keyboardType="email-address" />
        <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading}>
          {loading ? 'Sending…' : 'Send Reset Code'}
        </Btn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  body: { padding: 32, paddingHorizontal: 24 },
  heading: { fontWeight: '700', fontSize: 22, color: C.textDark, marginBottom: 8 },
  subheading: { fontSize: 14, color: C.textMid, marginBottom: 32 },
});
