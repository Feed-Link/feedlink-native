import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useGlobalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shared } from '../../api/client';
import { donor } from '../../api/donor';
import Btn from '../../components/Btn';
import Input from '../../components/Input';
import LocationPickerModal from '../../components/LocationPickerModal';
import TagChip from '../../components/TagChip';
import TextArea from '../../components/TextArea';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';

const ALL_TAGS = ['cooked', 'raw_ingredients', 'packaged', 'for_humans', 'for_animals', 'for_both'];
const MAX_PHOTOS = 4;
const STEPS = ['Details', 'Tags', 'Schedule'];
const DRAFTS_KEY = 'fl_listing_drafts';

interface Draft {
  id: string;
  form: any;
  photosPreviews: any[];
  createdAt: string;
  title: string;
}

export default function DonorCreateListingScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useGlobalSearchParams();
  const draftIdParam = params.draft as string | undefined;

  const [editingDraftId, setEditingDraftId] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(1);
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

  React.useEffect(() => {
    if (draftIdParam) {
      (async () => {
        const drafts = await loadDrafts();
        const draft = drafts.find(d => d.id === draftIdParam);
        if (draft) {
          setEditingDraftId(draft.id);
          setForm(draft.form);
          setPhotosPreviews(draft.photosPreviews);
        }
      })();
    }
  }, [draftIdParam]);

  const loadDrafts = async (): Promise<Draft[]> => {
    try {
      const data = await AsyncStorage.getItem(DRAFTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  };

  const saveDraft = async () => {
    if (!form.title.trim() && !form.quantity.trim()) return;
    const drafts = await loadDrafts();
    const draft: Draft = {
      id: editingDraftId || `draft_${Date.now()}`,
      form,
      photosPreviews,
      createdAt: new Date().toISOString(),
      title: form.title,
    };
    let updated: Draft[];
    if (editingDraftId) {
      updated = drafts.map(d => d.id === editingDraftId ? draft : d);
    } else {
      updated = [draft, ...drafts];
      setEditingDraftId(draft.id);
    }
    await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
  };

  const deleteDraft = async (id?: string) => {
    const targetId = id || editingDraftId;
    if (!targetId) return;
    const drafts = await loadDrafts();
    const updated = drafts.filter(d => d.id !== targetId);
    await AsyncStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    if (editingDraftId === targetId) {
      setEditingDraftId(null);
      setForm({
        title: '', description: '', quantity: '', tags: [], photos: [], expires_at: '', pickup_before: '', pickup_instructions: '',
        address: 'Thamel, Kathmandu', latitude: 27.7172, longitude: 85.3240,
      });
      setPhotosPreviews([]);
      setStep(1);
    }
  };

  const restoreDraft = async (draft: Draft) => {
    setEditingDraftId(draft.id);
    setForm(draft.form);
    setPhotosPreviews(draft.photosPreviews);
    setStep(1);
  };

  const set = (k: string) => (v: any) => setForm(p => ({ ...p, [k]: v }));
  const toggleTag = (tag: string) => setForm(p => ({
    ...p, tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
  }));

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
      if (status !== 'granted') { showToast('Photo library permission required', 'error'); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, quality: 0.8 });
      if (res.canceled || !res.assets?.length) return;
      const newFiles = res.assets.slice(0, remaining);
      const prevLen = photosPreviews.length;
      const placeholders = newFiles.map(f => ({ uri: f.uri, uploading: true, cloudUrl: null, error: false }));
      setPhotosPreviews(p => [...p, ...placeholders]);
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const targetIdx = prevLen + i;
        const formData = new FormData();
        // @ts-ignore
        formData.append('photo', { uri: file.uri, name: 'photo.jpg', type: 'image/jpeg' } as any);
        try {
          const r = await shared.uploadPhoto(formData);
          const cloudUrl = r?.data?.url || r?.url;
          if (!cloudUrl) throw new Error('No URL returned');
          setPhotosPreviews(p => p.map((item, idx) =>
            idx === targetIdx ? { ...item, uploading: false, cloudUrl } : item
          ));
          setForm(p => ({ ...p, photos: [...p.photos, cloudUrl] }));
        } catch (e: any) {
          showToast(e.message || 'Photo upload failed', 'error');
          setPhotosPreviews(p => p.map((item, idx) =>
            idx === targetIdx ? { ...item, uploading: false, error: true } : item
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

  const next = () => {
    if (step === 1) {
      if (!form.title.trim()) return showToast('Title is required', 'error');
      if (!form.quantity.trim()) return showToast('Quantity is required', 'error');
    }
    if (step === 2) {
      if (form.tags.length === 0) return showToast('Select at least one tag', 'error');
      if (photosPreviews.some(p => p.uploading)) return showToast('Photos still uploading…', 'error');
    }
    setStep(s => s + 1);
  };

  const submit = async () => {
    if (!form.expires_at) return showToast('Set expiry time', 'error');
    setLoading(true);
    try {
      const payload: any = {
        ...form,
        expires_at: toLocalISO(form.expires_at),
      };
      if (form.pickup_before) payload.pickup_before = toLocalISO(form.pickup_before);
      await donor.createListing(payload);
      if (editingDraftId) await deleteDraft();
      showToast('Listing posted!', 'success');
      router.push('/donor/listings' as any);
    } catch (e: any) {
      showToast(e.message || 'Failed to post', 'error');
    } finally { setLoading(false); }
  };

  const saveAndExit = async () => {
    await saveDraft();
    showToast('Draft saved', 'success');
    router.push('/donor/listings' as any);
  };

  const confirmExit = () => {
    if (form.title.trim() || form.quantity.trim()) {
      Alert.alert(
        'Save draft?',
        'Do you want to save your progress as a draft?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => router.push('/donor/listings' as any) },
          { text: 'Save draft', onPress: saveAndExit },
        ]
      );
    } else {
      router.push('/donor/listings' as any);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={confirmExit} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={C.textDark} />
          </TouchableOpacity>
          <Text style={{ fontWeight: '700', fontSize: 17, color: C.textDark, flex: 1 }}>
            {editingDraftId ? 'Continue draft' : 'New listing'}
          </Text>
          {(form.title.trim() || form.quantity.trim()) && (
            <TouchableOpacity onPress={saveDraft} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: C.surface2, borderRadius: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.green }}>Save</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Step indicators */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {STEPS.map((label, i) => {
            const s = i + 1;
            const done = step > s;
            const active = step === s;
            return (
              <React.Fragment key={s}>
                <TouchableOpacity
                  onPress={() => { if (done) setStep(s); }}
                  activeOpacity={done ? 0.7 : 1}
                  style={{ alignItems: 'center', gap: 4 }}
                >
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: done ? C.green : active ? C.green : C.surface2, alignItems: 'center', justifyContent: 'center', borderWidth: done || active ? 0 : 1.5, borderColor: C.border }}>
                    {done
                      ? <MaterialCommunityIcons name="check" size={14} color="#fff" />
                      : <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : C.textLight }}>{s}</Text>
                    }
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: active ? '700' : '500', color: active ? C.green : done ? C.textMid : C.textLight, width: 60, textAlign: 'center' }} numberOfLines={1}>{label}</Text>
                </TouchableOpacity>
                {i < STEPS.length - 1 && (
                  <View style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: done ? C.green : C.border, marginBottom: 14 }} />
                )}
              </React.Fragment>

            );
          })}
        </View>
      </View>

      {/* Step content */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 + insets.bottom }}>

        {step === 1 && (
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 4 }}>What are you sharing?</Text>
            <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 16, lineHeight: 20 }}>Give your listing a clear title so recipients know what to expect.</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 12 }}>
              <Input label="Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Fresh dal bhat for 4 people" required />
              <Input label="Quantity" value={form.quantity} onChangeText={set('quantity')} placeholder="e.g. Serves 4 · 2 kg" required />
              <TextArea label="Description" value={form.description} onChange={set('description')} placeholder="Any details recipients should know…" rows={3} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 4 }}>Tags & Photos</Text>
            <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 16, lineHeight: 20 }}>Help recipients filter and find your listing faster.</Text>

            <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.textDark }}>Food type <Text style={{ color: C.red }}>*</Text></Text>
                <Text style={{ fontSize: 12, color: form.tags.length > 0 ? C.green : C.textLight }}>{form.tags.length} selected</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ALL_TAGS.map(tag => (
                  <TagChip key={tag} tag={tag} selected={form.tags.includes(tag)} onClick={() => toggleTag(tag)} />
                ))}
              </View>
            </View>

            <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.textDark }}>Photos</Text>
                <Text style={{ fontSize: 12, color: C.textLight }}>{photosPreviews.length} / {MAX_PHOTOS}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                {photosPreviews.map((photo, idx) => (
                  <View key={idx} style={{ position: 'relative', width: 76, height: 76 }}>
                    <Image source={{ uri: photo.uri }} style={{ width: 76, height: 76, borderRadius: 12 }} />
                    {photo.uploading && (
                      <View style={{ position: 'absolute', inset: 0, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="loading" size={20} color="#fff" />
                      </View>
                    )}
                    {!photo.uploading && (
                      <TouchableOpacity onPress={() => removePhoto(idx)} style={{ position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="close" size={13} color="#fff" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {photosPreviews.length < MAX_PHOTOS && (
                  <TouchableOpacity onPress={handlePhotoSelect} style={{ width: 76, height: 76, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, borderStyle: 'dashed', backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <MaterialCommunityIcons name="camera-plus-outline" size={24} color={C.textMid} />
                    <Text style={{ fontSize: 10, fontWeight: '600', color: C.textMid }}>Add photo</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={{ fontSize: 11, color: C.textLight, marginTop: 12 }}>First photo appears as the listing thumbnail</Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 4 }}>Where & when?</Text>
            <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 14, lineHeight: 20 }}>Set a pickup location and how long the listing stays active.</Text>

            {/* Location card */}
            <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Location</Text>
              <TouchableOpacity onPress={() => setShowLocationPicker(true)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: form.address ? C.green : C.border, backgroundColor: C.surface2, marginBottom: 10 }}>
                <MaterialCommunityIcons name="map-marker-outline" size={18} color={form.address ? C.green : C.textMid} />
                <Text style={{ flex: 1, fontSize: 13, color: form.address ? C.textDark : C.textLight, fontWeight: form.address ? '500' : '400' }} numberOfLines={1}>{form.address || 'Tap to set location'}</Text>
                <MaterialCommunityIcons name="chevron-right" size={15} color={C.textLight} />
              </TouchableOpacity>
              <Input label="Pickup instructions (optional)" value={form.pickup_instructions} onChangeText={set('pickup_instructions')} placeholder="e.g. Ring bell, call before coming" />
            </View>

            {/* Schedule card */}
            <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>Schedule <Text style={{ color: C.textMid, fontSize: 10 }}>(pickup deadline optional, defaults to +2h)</Text></Text>
              {[
                { label: 'Expires at', key: 'expires_at', icon: 'clock-alert-outline' as const, open: () => { setTempDate(form.expires_at ? new Date(form.expires_at) : new Date()); setShowExpiryPicker(true); } },
                { label: 'Pickup before', key: 'pickup_before', icon: 'run-fast' as const, open: () => { setTempDate(form.pickup_before ? new Date(form.pickup_before) : new Date()); setShowPickupPicker(true); } },
              ].map(({ label, key, icon, open }, i) => (
                <TouchableOpacity key={key} onPress={open} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: (form as any)[key] ? C.green : C.border, backgroundColor: C.surface2, marginBottom: i === 0 ? 8 : 0 }}>
                  <MaterialCommunityIcons name={icon} size={16} color={(form as any)[key] ? C.green : C.textMid} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: C.textMid, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</Text>
                    <Text style={{ fontSize: 13, color: (form as any)[key] ? C.textDark : C.textLight, fontWeight: (form as any)[key] ? '600' : '400', marginTop: 1 }}>
                      {(form as any)[key] ? formatDate((form as any)[key]) : 'Tap to select'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={15} color={C.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </View>
      </TouchableWithoutFeedback>

      {/* Bottom bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, padding: 16, paddingBottom: 16 + insets.bottom }}>
        <Btn fullWidth size="lg" onPress={step < 3 ? next : submit} disabled={loading} loading={step === 3 && loading}>
          {step < 3 ? 'Continue' : loading ? 'Posting…' : 'Post listing'}
        </Btn>
      </View>

      {/* Date picker modal */}
      {(showExpiryPicker || showPickupPicker) && (
        <Modal transparent animationType="slide" visible onRequestClose={() => { setShowExpiryPicker(false); setShowPickupPicker(false); }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => { setShowExpiryPicker(false); setShowPickupPicker(false); }} />
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: insets.bottom + 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <TouchableOpacity onPress={() => { setShowExpiryPicker(false); setShowPickupPicker(false); }}>
                <Text style={{ fontSize: 15, color: C.textMid }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.textDark }}>
                {showExpiryPicker ? 'Listing expires at' : 'Pickup deadline'}
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
    </KeyboardAvoidingView>
  );
}
