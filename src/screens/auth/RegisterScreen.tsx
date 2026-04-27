import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function RegisterScreen() {
  const { role: urlRole } = useLocalSearchParams<{ role?: string }>();
  const role = urlRole || 'donor';
  const [form, setForm] = React.useState({ name: '', email: '', contact: '', password: '', terms: false });
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const update = (k: string) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.contact || !form.password) {
      showToast('Please fill all fields', 'error'); return;
    }
    if (!form.terms) { showToast('Please accept the terms', 'error'); return; }
    if (form.contact.length > 10) { showToast('Contact max 10 digits', 'error'); return; }
    setLoading(true);
    try {
      await authApi.auth.register({
        name: form.name, email: form.email, contact: form.contact,
        password: form.password, role, location: { lat: 27.7172, long: 85.3240 }, terms_accepted: true,
      });
      showToast('Registered! Check your email for OTP.', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&context=register&role=${role}` as any);
    } catch (e: any) {
      showToast(e.message || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Green header */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingBottom: 48, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontWeight: '800', fontSize: 26, color: '#fff' }}>Create account</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <View style={{ backgroundColor: role === 'donor' ? 'rgba(255,255,255,0.2)' : 'rgba(245,158,11,0.3)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                {role === 'donor' ? 'Donor' : 'Recipient'}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>account</Text>
          </View>
        </View>

        {/* Form card */}
        <View style={{ marginHorizontal: 20, marginTop: -24, backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}>
          <Input label="Full Name" value={form.name} onChangeText={update('name')} placeholder="Samaya Mahate" required />
          <Input label="Email" value={form.email} onChangeText={update('email')} placeholder="hello@example.com" keyboardType="email-address" required />
          <Input label="Phone Number" value={form.contact} onChangeText={update('contact')} placeholder="98XXXXXXXX" keyboardType="phone-pad" required />
          <Input label="Password" value={form.password} onChangeText={update('password')} placeholder="Min 6 characters" secureTextEntry required />

          <TouchableOpacity onPress={() => update('terms')(!form.terms)} activeOpacity={0.7} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
            <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: form.terms ? C.green : C.border, backgroundColor: form.terms ? C.green : 'transparent', marginTop: 1, flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}>
              {form.terms && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
            </View>
            <Text style={{ fontSize: 13, color: C.textDark, flex: 1, lineHeight: 18 }}>
              I agree to the <Text style={{ color: C.green, fontWeight: '700' }}>Terms & Conditions</Text> and <Text style={{ color: C.green, fontWeight: '700' }}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading} loading={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </Btn>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 14, color: C.textMid, marginTop: 20, paddingBottom: insets.bottom + 24 }}>
          Already have an account?{' '}
          <Text style={{ color: C.amber, fontWeight: '700' }} onPress={() => router.push('/login' as any)}>Log in</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
