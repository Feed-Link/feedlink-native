import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import ScreenHeader from '../../components/ScreenHeader';
import * as client from '../../api/client';

export default function DonorEditProfileScreen() {
  const { user, setUser, showToast } = useApp();
  const router = useRouter();

  const [form, setForm] = React.useState({
    name: user?.name || '',
    contact: user?.contact || '',
  });
  const [loading, setLoading] = React.useState(false);

  const update = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name) { showToast('Name is required', 'error'); return; }
    setLoading(true);
    try {
      const res = await client.request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('fl_user', JSON.stringify(res.data));
      setUser(res.data);
      showToast('Profile updated!', 'success');
      router.push('/donor/profile' as any);
    } catch (e: any) {
      showToast(e.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Edit Profile" onBack={() => router.push('/donor/profile' as any)} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Full Name"
          value={form.name}
          onChange={update('name')}
          placeholder="Your name"
          required
        />
        <Input
          label="Phone Number"
          value={form.contact}
          onChange={update('contact')}
          placeholder="98XXXXXXXX"
        />
        <Btn
          fullWidth
          size="lg"
          onPress={submit}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </Btn>
      </ScrollView>
    </View>
  );
}
