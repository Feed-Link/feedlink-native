import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { C } from '../../theme';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import ScreenHeader from '../../components/ScreenHeader';
import { useApp } from '../../context/AppContext';
import * as authApi from '../../api/client';

export default function RegisterScreen() {
  const { role: urlRole } = useLocalSearchParams<{ role?: string }>();
  const role = urlRole || 'donor';
  const [form, setForm] = React.useState({ name: '', email: '', contact: '', password: '', terms: false });
  const [loading, setLoading] = React.useState(false);
  const { showToast } = useApp();
  const router = useRouter();

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
      router.push(`/auth/verify-otp?email=${encodeURIComponent(form.email)}&context=register&role=${role}` as any);
    } catch (e: any) {
      showToast(e.message || 'Registration failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Create Account" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Signing up as {role === 'donor' ? 'Donor' : 'Recipient'}</Text>
        </View>
        <Input label="Full Name" value={form.name} onChangeText={update('name')} placeholder="Samaya Mahate" required />
        <Input label="Email" value={form.email} onChangeText={update('email')} placeholder="hello@example.com" keyboardType="email-address" required />
        <Input label="Phone Number" value={form.contact} onChangeText={update('contact')} placeholder="98XXXXXXXX" keyboardType="phone-pad" required />
        <Input label="Password" value={form.password} onChangeText={update('password')} placeholder="Min 6 characters" secureTextEntry required />
        <TouchableOpacity style={styles.termsRow} onPress={() => update('terms')(!form.terms)} activeOpacity={0.7}>
          <View style={[styles.checkbox, form.terms && styles.checkboxChecked]}>
            {form.terms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.link}>Terms & Conditions</Text> and <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </TouchableOpacity>
        <Btn fullWidth size="lg" variant="amber" onPress={submit} disabled={loading}>
          {loading ? 'Creating…' : 'Create Account'}
        </Btn>
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink} onPress={() => router.push('/auth/login' as any)}>Log in</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 100 },
  roleBadge: {
    backgroundColor: C.tagAmber, borderRadius: 99, paddingVertical: 5, paddingHorizontal: 14,
    alignSelf: 'flex-start', marginBottom: 24,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: 'rgb(136,100,18)' },
  termsRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 24 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: C.border,
    marginTop: 2, flexShrink: 0, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: C.green, borderColor: C.green },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  termsText: { fontSize: 12, color: C.textDark, flex: 1, lineHeight: 18 },
  link: { color: C.green, fontWeight: '700' },
  loginText: { textAlign: 'center', fontSize: 14, color: C.textMid, marginTop: 20 },
  loginLink: { color: C.amber, fontWeight: '700' },
});
