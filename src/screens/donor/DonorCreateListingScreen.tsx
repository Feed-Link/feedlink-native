import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import { shared } from '../../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ScreenHeader from '../../components/ScreenHeader';
import Input from '../../components/Input';
import TextArea from '../../components/TextArea';
import TagChip from '../../components/TagChip';
import Btn from '../../components/Btn';
import LocationPickerModal from '../../components/LocationPickerModal';

const ALL_TAGS = ['cooked', 'raw_ingredients', 'packaged', 'for_humans', 'for_animals', 'for_both'];
const MAX_PHOTOS = 4;

export default function DonorCreateListingScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = React.useState({
    title: '', description: '', quantity: '', tags: [] as string[],
    photos: [] as string[], expires_at: '', pickup_before: '', pickup_instructions: '',
    address: 'Thamel, Kathmandu', latitude: 27.7172, longitude: 85.3240,
  });
  const [photosPreviews, setPhotosPreviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = React.useState(false);
  const [showPickupPicker, setShowPickupPicker] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(new Date());

  const set = (k: string) => (v: any) => setForm(p => ({ ...p, [k]: v }));
  const toggleTag = (tag: string) => setForm(p => ({
    ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
  }));

  const minExpiry = () => {
    const d = new Date(); d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  };

  const toLocalISO = (val: string) => {
    if (!val) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = new Date(val);
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const hh = pad(Math.floor(Math.abs(off) / 60));
    const mm = pad(Math.abs(off) % 60);
    return `${val}:00${sign}${hh}:${mm}`;
  };

  const toLocalSlice = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' · '
      + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handlePhotoSelect = async () => {
    const remaining = MAX_PHOTOS - photosPreviews.length;
    if (remaining <= 0) { showToast('Maximum 4 photos allowed', 'error'); return; }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Photo library permission is required', 'error');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.8,
      });
      if (res.canceled || !res.assets?.length) return;
      const newFiles = res.assets.slice(0, remaining);
      const placeholders = newFiles.map(f => ({ uri: f.uri, uploading: true, cloudUrl: null, error: false }));
      setPhotosPreviews(p => [...p, ...placeholders]);
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const formData = new FormData();
        // @ts-ignore
        formData.append('photo', { uri: file.uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
        try {
          const res = await shared.uploadPhoto(formData);
          const cloudUrl = res.data?.url;
          setPhotosPreviews(p => p.map((item, idx) =>
            idx === photosPreviews.length + i ? { ...item, uploading: false, cloudUrl } : item
          ));
          setForm(p => ({ ...p, photos: [...p.photos, cloudUrl] }));
        } catch {
          showToast('Photo upload failed', 'error');
          setPhotosPreviews(p => p.map((item, idx) =>
            idx === photosPreviews.length + i ? { ...item, uploading: false, error: true } : item
          ));
        }
      }
    } catch (e: any) { showToast(e.message || 'Photo selection failed', 'error'); }
  };

  const removePhoto = (idx: number) => {
    const removed = photosPreviews[idx];
    setPhotosPreviews(p => p.filter((_, i) => i !== idx));
    if (removed.cloudUrl) setForm(p => ({ ...p, photos: p.photos.filter(u => u !== removed.cloudUrl) }));
  };

  const submit = async () => {
    if (!form.title || !form.quantity) return showToast('Title and quantity required', 'error');
    if (form.tags.length === 0) return showToast('Select at least one tag', 'error');
    if (!form.expires_at) return showToast('Set expiry time', 'error');
    if (!form.pickup_before) return showToast('Set pickup deadline', 'error');
    if (photosPreviews.some(p => p.uploading)) return showToast('Photos still uploading…', 'error');
    setLoading(true);
    try {
      await donor.createListing({
        ...form,
        expires_at: toLocalISO(form.expires_at),
        pickup_before: toLocalISO(form.pickup_before),
      });
      showToast('Listing posted!', 'success');
      router.push('/donor/listings' as any);
    } catch (e: any) {
      showToast(e.message || 'Failed to post', 'error');
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="New listing" onBack={() => router.push('/donor/listings' as any)} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photos */}
        <View style={{ margin: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid, marginBottom: 10, textTransform: 'uppercase' }}>PHOTOS</Text>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {photosPreviews.map((photo, idx) => (
              <View key={idx} style={{ position: 'relative', width: 72, height: 72 }}>
                {photo.cloudUrl ? (
                  <Image source={{ uri: photo.uri }} style={{ width: 72, height: 72, borderRadius: 10 }} />
                ) : (
                  <View style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    {photo.uploading ? <Text style={{ fontSize: 12 }}>Uploading...</Text> : <Text style={{ fontSize: 12, color: C.red }}>Error</Text>}
                  </View>
                )}
                {!photo.uploading && (
                  <TouchableOpacity
                    onPress={() => removePhoto(idx)}
                    style={{
                      position: 'absolute', top: -6, right: -6,
                      width: 20, height: 20, borderRadius: 10,
                      backgroundColor: C.red, alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {photosPreviews.length < MAX_PHOTOS && (
              <TouchableOpacity
                onPress={handlePhotoSelect}
                style={{
                  width: 72, height: 72, borderRadius: 10,
                  borderWidth: 1.5, borderColor: C.border,
                  backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <Text style={{ fontSize: 22 }}>📷</Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid }}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={{ fontSize: 11, color: C.textLight, marginTop: 8 }}>Up to {MAX_PHOTOS} photos · JPG, PNG, WebP · max 5 MB each</Text>
        </View>

        {/* Basics */}
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid, marginBottom: 12, textTransform: 'uppercase' }}>BASICS</Text>
          <Input label="Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Fresh dal bhat for 4" required />
          <TextArea label="Description" value={form.description} onChange={set('description')} placeholder="Describe the food…" rows={2} />
          <Input label="Quantity" value={form.quantity} onChangeText={set('quantity')} placeholder="e.g. Serves 4 · 2 kg" required />
          <Input label="Pickup Instructions" value={form.pickup_instructions} onChangeText={set('pickup_instructions')} placeholder="e.g. Call before coming" />

          {/* Address / Location picker */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 6 }}>
              ADDRESS <Text style={{ color: C.red }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowLocationPicker(true)}
              activeOpacity={0.85}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface, }}
            >
              <Text style={{ fontSize: 18 }}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: form.address ? C.textDark : C.textLight, fontWeight: form.address ? '600' : '400' }}>
                  {form.address || 'Tap to set location'}
                </Text>
                <Text style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>Tap to choose on map or search</Text>
              </View>
              <Text style={{ fontSize: 14, color: C.textLight }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags */}
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid, marginBottom: 10, textTransform: 'uppercase' }}>
            TAGS <Text style={{ color: C.red }}>*</Text>
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ALL_TAGS.map(tag => (
              <TagChip key={tag} tag={tag} selected={form.tags.includes(tag)} onClick={() => toggleTag(tag)} />
            ))}
          </View>
        </View>

        {/* Timing */}
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid, marginBottom: 12, textTransform: 'uppercase' }}>TIMING</Text>

          {[
            { label: 'Expires at', key: 'expires_at', show: showExpiryPicker, open: () => { setTempDate(form.expires_at ? new Date(form.expires_at) : new Date()); setShowExpiryPicker(true); }, close: () => setShowExpiryPicker(false), confirm: () => { setForm(p => ({ ...p, expires_at: tempDate.toISOString().slice(0, 16) })); setShowExpiryPicker(false); } },
            { label: 'Pickup before', key: 'pickup_before', show: showPickupPicker, open: () => { setTempDate(form.pickup_before ? new Date(form.pickup_before) : new Date()); setShowPickupPicker(true); }, close: () => setShowPickupPicker(false), confirm: () => { setForm(p => ({ ...p, pickup_before: tempDate.toISOString().slice(0, 16) })); setShowPickupPicker(false); } },
          ].map(({ label, key, show, open, close, confirm }, i) => (
            <View key={key} style={{ marginBottom: i === 0 ? 14 : 0 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 6, textTransform: 'uppercase' }}>
                {label} <Text style={{ color: C.red }}>*</Text>
              </Text>
              <TouchableOpacity onPress={open} activeOpacity={0.8} style={{
                height: 48, borderRadius: 12, borderWidth: 1.5,
                borderColor: show ? C.green : C.border,
                paddingHorizontal: 14, backgroundColor: C.surface2,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Text style={{ fontSize: 14, color: (form as any)[key] ? C.textDark : C.textLight, fontWeight: (form as any)[key] ? '500' : '400' }}>
                  {(form as any)[key] ? formatDate((form as any)[key]) : `Select ${label.toLowerCase()}`}
                </Text>
                <Text style={{ fontSize: 16, color: C.textLight }}>🕐</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
        padding: 12, paddingBottom: 12 + insets.bottom,
      }}>
        <Btn
          fullWidth
          size="lg"
          onPress={submit}
          disabled={loading || photosPreviews.some(p => p.uploading)}
        >
          {loading ? 'Posting…' : photosPreviews.some(p => p.uploading) ? 'Uploading photos…' : 'Post listing'}
        </Btn>
      </View>

      {/* Date picker modal */}
      {(showExpiryPicker || showPickupPicker) && (
        <Modal transparent animationType="slide" visible onRequestClose={() => { setShowExpiryPicker(false); setShowPickupPicker(false); }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => { setShowExpiryPicker(false); setShowPickupPicker(false); }} />
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: insets.bottom + 8 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <TouchableOpacity onPress={() => { setShowExpiryPicker(false); setShowPickupPicker(false); }}>
                <Text style={{ fontSize: 15, color: C.textMid }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.textDark }}>
                {showExpiryPicker ? 'Expires at' : 'Pickup before'}
              </Text>
              <TouchableOpacity onPress={() => {
                const key = showExpiryPicker ? 'expires_at' : 'pickup_before';
                setForm(p => ({ ...p, [key]: toLocalSlice(tempDate) }));
                setShowExpiryPicker(false); setShowPickupPicker(false);
              }}>
                <Text style={{ fontSize: 15, color: C.green, fontWeight: '700' }}>Done</Text>
              </TouchableOpacity>
            </View>

            <DateTimePicker
              value={tempDate}
              mode="datetime"
              display="spinner"
              minimumDate={new Date()}
              onChange={(_, date) => { if (date) setTempDate(date); }}
              textColor={C.textDark}
              style={{ height: 216 }}
            />
          </View>
        </Modal>
      )}

      {showLocationPicker && (
        <LocationPickerModal
          lat={form.latitude} lng={form.longitude} address={form.address}
          onConfirm={(lat, lng, addr) => {
            setForm(p => ({ ...p, latitude: lat, longitude: lng, address: addr }));
            setShowLocationPicker(false);
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </View>
  );
}
