import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { C } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import { useApp } from '../../context/AppContext';
import * as api from '../../api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GuestRegisterScreen() {
  const [form, setForm] = React.useState({ name: '', contact: '' });
  const [location, setLocation] = React.useState<{ lat: number; long: number } | null>(null);
  const [locationLabel, setLocationLabel] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [locationLoading, setLocationLoading] = React.useState(false);
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const update = (k: string) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const getLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Location permission needed', 'error');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const newLoc = { lat: loc.coords.latitude, long: loc.coords.longitude };
      setLocation(newLoc);
      
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const addr = geocode[0];
      const parts: string[] = [];
      if (addr.street && addr.street.trim()) parts.push(addr.street.trim());
      if (addr.city && addr.city.trim()) parts.push(addr.city.trim());
      if (addr.region && addr.region.trim()) parts.push(addr.region.trim());
      if (addr.country && addr.country.trim()) parts.push(addr.country.trim());
      const addrStr = parts.length > 0 ? parts.slice(0, 2).join(', ') : 'Location set';
      setLocationLabel(addrStr);
      showToast(addrStr, 'success');
    } catch (e: any) {
      showToast(e.message || 'Location failed', 'error');
    } finally {
      setLocationLoading(false);
    }
  };

  const submit = async () => {
    if (!form.name) {
      showToast('Please enter your name', 'error'); return;
    }
    setLoading(true);
    try {
      let loc = { lat: 27.7172, long: 85.3240 };
      if (location) {
        loc = { lat: location.lat, long: location.long };
      } else {
        try {
          const position = await Location.getCurrentPositionAsync({});
          loc = { lat: position.coords.latitude, long: position.coords.longitude };
        } catch (_) {}
      }

      const res = await api.auth.guestRegister({
        name: form.name,
        location: loc,
        contact: form.contact || undefined,
      });

      api.setTokens(res.data.access_token, res.data.refresh_token);
      await AsyncStorage.setItem('fl_role', 'guest');
      await AsyncStorage.setItem('fl_user', JSON.stringify({ name: form.name }));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace('/guest/home' as any);
    } catch (e: any) {
      showToast(e.message || 'Failed to continue', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: C.blue, paddingTop: insets.top + 16, paddingBottom: 48, paddingHorizontal: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <MaterialCommunityIcons name="food-outline" size={28} color="#fff" />
          </View>
          <Text style={{ fontWeight: '800', fontSize: 26, color: '#fff' }}>Quick Post</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>Post food without an account</Text>
        </View>

        <View style={{ marginHorizontal: 20, marginTop: -24, backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 }}>
          <Input label="Your Name" value={form.name} onChangeText={update('name')} placeholder="e.g. Party Host" required />
          <Input label="Phone (optional)" value={form.contact} onChangeText={update('contact')} placeholder="98XXXXXXXX" keyboardType="phone-pad" />

          <TouchableOpacity
            onPress={getLocation}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: C.surface2, borderRadius: 12, marginBottom: 24 }}
          >
            <MaterialCommunityIcons name={location ? "check-circle" : "crosshairs-gps"} size={22} color={location ? C.green : C.blue} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', fontSize: 14, color: C.textDark }}>{location ? 'Location set' : 'Use current location'}</Text>
              <Text style={{ fontSize: 12, color: locationLabel ? C.green : C.textMid }}>{locationLabel || 'Required for your listing'}</Text>
            </View>
            {locationLoading ? (
              <MaterialCommunityIcons name="loading" size={20} color={C.textMid} />
            ) : location ? (
              <MaterialCommunityIcons name="check" size={20} color={C.green} />
            ) : (
              <MaterialCommunityIcons name="chevron-right" size={20} color={C.textLight} />
            )}
          </TouchableOpacity>

          <Btn fullWidth size="lg" variant="blue" onPress={submit} disabled={loading || !form.name} loading={loading}>
            {loading ? 'Starting...' : 'Continue to Post'}
          </Btn>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 14, color: C.textMid, marginTop: 20, paddingBottom: insets.bottom + 24 }}>
          No account needed. We'll create a guest listing for you.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}