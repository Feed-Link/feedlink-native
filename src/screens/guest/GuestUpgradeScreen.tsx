import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { useApp } from '../../context/AppContext';
import * as api from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C } from '../../theme';

export default function GuestUpgradeScreen() {
  const [form, setForm] = React.useState({ email: '', password: '', password_confirmation: '', contact: '' });
  const [loading, setLoading] = React.useState(false);
  const { showToast, setUser, setRole } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const update = (k: string) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.email || !form.password || !form.contact) return showToast('Fill all fields', 'error');
    if (form.password !== form.password_confirmation) return showToast('Passwords do not match', 'error');
    if (form.password.length < 6) return showToast('Password min 6 characters', 'error');
    if (form.contact.length > 10) return showToast('Contact max 10 digits', 'error');

    setLoading(true);
    try {
      await api.auth.upgradeGuest({
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        contact: form.contact,
      });

      showToast('Account upgraded! Please verify your email.', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      await AsyncStorage.setItem('fl_role', 'donor');
      setRole('donor');
      router.replace('/donor/home' as any);
    } catch (e: any) {
      showToast(e.message || 'Upgrade failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingBottom: 48, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <MaterialCommunityIcons name="account-plus-outline" size={28} color="#fff" />
          </View>
          <Text style={{ fontWeight: '800', fontSize: 26, color: '#fff' }}>Upgrade account</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>Convert to a full donor account</Text>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: -24, backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}>
          <Input label="Email" value={form.email} onChangeText={update('email')} placeholder="your@email.com" keyboardType="email-address" required />
          <Input label="Phone Number" value={form.contact} onChangeText={update('contact')} placeholder="98XXXXXXXX" keyboardType="phone-pad" required />
          <Input label="Password" value={form.password} onChangeText={update('password')} placeholder="Min 6 characters" secureTextEntry required />
          <Input label="Confirm Password" value={form.password_confirmation} onChangeText={update('password_confirmation')} placeholder="Same as password" secureTextEntry required />

          <View style={{ backgroundColor: C.tagGreen, borderRadius: 12, padding: 14, marginBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MaterialCommunityIcons name="information-outline" size={20} color={C.green} />
            <Text style={{ flex: 1, fontSize: 12, color: C.textDark, lineHeight: 17 }}>
              After upgrading, you'll need to verify your email with OTP. Your existing listings and data will be transferred.
            </Text>
          </View>

          <Btn fullWidth size="lg" variant="green" onPress={submit} disabled={loading || !form.email || !form.password || !form.contact} loading={loading}>
            {loading ? 'Upgrading...' : 'Upgrade to Donor'}
          </Btn>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 14, color: C.textMid, marginTop: 20, paddingBottom: insets.bottom + 24 }}>
          Or{' '}
          <Text style={{ color: C.green, fontWeight: '700' }} onPress={() => router.back()}>go back</Text>
          {' '}as guest
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}