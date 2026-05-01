import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { recipient } from '../../api/recipient';
import Btn from '../../components/Btn';
import Input from '../../components/Input';
import LocationPickerModal from '../../components/LocationPickerModal';
import TagChip from '../../components/TagChip';
import TextArea from '../../components/TextArea';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';

const ALL_TAGS = ['cooked', 'raw_ingredients', 'packaged', 'for_humans', 'for_animals', 'for_both'];
const STEPS = ['Details', 'Tags', 'Location'];

export default function RecipientCreateRequestScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = React.useState(1);
  const [form, setForm] = React.useState({
    title: '', description: '', quantity_needed: '', tags: [] as string[],
    needed_by: '', address: 'Thamel, Kathmandu', latitude: 27.7172, longitude: 85.3240,
  });
  const [loading, setLoading] = React.useState(false);
  const [submitError, setSubmitError] = React.useState(false);
  const [showLocationPicker, setShowLocationPicker] = React.useState(false);
  const [showNeededPicker, setShowNeededPicker] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date>(new Date());

  const set = (k: string) => (v: any) => {
    setSubmitError(false);
    setForm(p => ({ ...p, [k]: v }));
  };
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

  const next = () => {
    if (step === 1) {
      if (!form.title.trim()) return showToast('Title is required', 'error');
      if (!form.quantity_needed.trim()) return showToast('Quantity is required', 'error');
    }
    if (step === 2) {
      if (form.tags.length === 0) return showToast('Select at least one tag', 'error');
    }
    setStep(s => s + 1);
  };

  const submit = async () => {
    if (!form.needed_by) return showToast('Set a deadline', 'error');
    setLoading(true);
    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        quantity_needed: form.quantity_needed,
        tags: form.tags,
        needed_by: toLocalISO(form.needed_by),
        latitude: form.latitude,
        longitude: form.longitude,
        address: form.address,
      };
      await recipient.createRequest(payload);
      showToast('Request posted!', 'success');
      router.push('/recipient/home' as any);
    } catch (e: any) {
      showToast(e.message || 'Failed to post', 'error');
      setSubmitError(true);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : router.push('/recipient/home' as any)} style={{ marginRight: 12 }}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={C.textDark} />
          </TouchableOpacity>
          <Text style={{ fontWeight: '700', fontSize: 17, color: C.textDark, flex: 1 }}>New request</Text>
          <Text style={{ fontSize: 13, color: C.textMid, fontWeight: '600' }}>{step} / 3</Text>
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
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 4 }}>What do you need?</Text>
              <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 16, lineHeight: 20 }}>Describe the food you're looking for.</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, gap: 12 }}>
                <Input label="Title" value={form.title} onChangeText={set('title')} placeholder="e.g. Need rice for 10 people" required />
                <Input label="Quantity needed" value={form.quantity_needed} onChangeText={set('quantity_needed')} placeholder="e.g. 10 kg rice · 5 kg dal" required />
                <TextArea label="Description" value={form.description} onChange={set('description')} placeholder="Any details donors should know…" rows={3} />
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 4 }}>Food type</Text>
              <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 16, lineHeight: 20 }}>Help donors find your request.</Text>

              <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 }}>
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
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.textDark, marginBottom: 4 }}>Where & when?</Text>
              <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 14, lineHeight: 20 }}>Set a pickup location and deadline.</Text>

              {/* Location card */}
              <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 10 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 }}>Pickup location</Text>
                <TouchableOpacity onPress={() => setShowLocationPicker(true)} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: form.address ? C.green : C.border, backgroundColor: C.surface2, marginBottom: 10 }}>
                  <MaterialCommunityIcons name="map-marker-outline" size={18} color={form.address ? C.green : C.textMid} />
                  <Text style={{ flex: 1, fontSize: 13, color: form.address ? C.textDark : C.textLight, fontWeight: form.address ? '500' : '400' }} numberOfLines={1}>{form.address || 'Tap to set location'}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={15} color={C.textLight} />
                </TouchableOpacity>
              </View>

              {/* Schedule card */}
              <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>Deadline</Text>
                <TouchableOpacity onPress={() => { setTempDate(form.needed_by ? new Date(form.needed_by) : new Date()); setShowNeededPicker(true); }} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1.5, borderColor: form.needed_by ? C.green : C.border, backgroundColor: C.surface2 }}>
                  <MaterialCommunityIcons name="clock-alert-outline" size={16} color={form.needed_by ? C.green : C.textMid} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: C.textMid, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>Needed by</Text>
                    <Text style={{ fontSize: 13, color: form.needed_by ? C.textDark : C.textLight, fontWeight: form.needed_by ? '600' : '400', marginTop: 1 }}>
                      {form.needed_by ? formatDate(form.needed_by) : 'Tap to select'}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={15} color={C.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </TouchableWithoutFeedback>

      {/* Bottom bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border, padding: 16, paddingBottom: 16 + insets.bottom }}>
        <Btn fullWidth size="lg" onPress={step < 3 ? next : submit} disabled={loading} loading={step === 3 && loading}>
          {step < 3 ? 'Continue' : loading ? 'Posting…' : submitError ? 'Try Again' : 'Post request'}
        </Btn>
      </View>

      {/* Date picker modal */}
      {showNeededPicker && (
        <Modal transparent animationType="slide" visible onRequestClose={() => { setShowNeededPicker(false); }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} activeOpacity={1} onPress={() => { setShowNeededPicker(false); }} />
          <View style={{ backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: insets.bottom + 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border }}>
              <TouchableOpacity onPress={() => { setShowNeededPicker(false); }}>
                <Text style={{ fontSize: 15, color: C.textMid }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.textDark }}>Needed by</Text>
              <TouchableOpacity onPress={() => {
                setForm(p => ({ ...p, needed_by: toLocalSlice(tempDate) }));
                setShowNeededPicker(false);
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