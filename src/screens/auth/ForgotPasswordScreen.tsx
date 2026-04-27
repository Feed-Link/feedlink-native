import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Green header */}
      <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingBottom: 48, paddingHorizontal: 20 }}>
        <TouchableOpacity onPress={() => router.push('/login' as any)} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <MaterialCommunityIcons name="lock-reset" size={28} color="#fff" />
        </View>
        <Text style={{ fontWeight: '800', fontSize: 24, color: '#fff' }}>Forgot password?</Text>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Enter your email and we'll send a reset code.</Text>
      </View>

      <View style={{ marginHorizontal: 20, marginTop: -24, backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}>
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="hello@example.com" keyboardType="email-address" />
        <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading} loading={loading}>
          {loading ? 'Sending…' : 'Send Reset Code'}
        </Btn>
      </View>
    </KeyboardAvoidingView>
  );
}
