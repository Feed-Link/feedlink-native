import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';
import Avatar from '../../components/Avatar';
import Btn from '../../components/Btn';
import EmptyState from '../../components/EmptyState';

const TABS = [
  { k: '', l: 'All' },
  { k: 'human', l: 'Human' },
  { k: 'animal', l: 'Animal' },
];

export default function DonorMapScreen() {
  const { user, showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const lat = user?.latitude || 27.7172;
  const lng = user?.longitude || 85.3240;

  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('');
  const [offerTarget, setOfferTarget] = React.useState<any>(null);
  const [offerNote, setOfferNote] = React.useState('');
  const mapRef = React.useRef<any>(null);

  const load = async () => {
    setLoading(true);
    try {
      const q = `?lat=${lat}&lng=${lng}&radius=5${filter ? `&status=${filter}` : ''}`;
      const res = await donor.getRequests(q);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, [filter]);

  const offerHelp = async () => {
    if (!offerTarget) return;
    try {
      await donor.acceptRequest(offerTarget.id, { note: offerNote });
      showToast('Offer sent!', 'success');
      setOfferTarget(null);
      setOfferNote('');
      load();
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, backgroundColor: C.bg }}>
        <Text style={{ fontWeight: '700', fontSize: 20, color: C.textDark, marginBottom: 10 }}>Nearby Requests</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {TABS.map(f => (
            <TouchableOpacity
              key={f.k}
              onPress={() => setFilter(f.k)}
              style={{
                paddingHorizontal: 16, paddingVertical: 6,
                borderRadius: 99,
                borderWidth: filter === f.k ? 1 : 1,
                borderColor: filter === f.k ? C.green : C.border,
                backgroundColor: filter === f.k ? C.green : C.surface,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: filter === f.k ? '#fff' : C.textDark }}>{f.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Map */}
      <View style={{ height: 280, backgroundColor: C.surface2, marginTop: 10 }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        >
          {requests.map((r: any) => r.latitude && r.longitude && (
            <Marker
              key={r.id}
              coordinate={{ latitude: r.latitude, longitude: r.longitude }}
              title={r.title}
              description={`${r.quantity_needed || ''} • ${r.address || ''}`}
              onCalloutPress={() => router.push(`/recipient/request-detail?id=${r.id}` as any)}
            />
          ))}
        </MapView>
      </View>

      {/* List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark, marginBottom: 8 }}>Nearby Requests</Text>
        {loading ? (
          <Text style={{ textAlign: 'center', padding: 20, color: C.textMid }}>Loading...</Text>
        ) : requests.length === 0 ? (
          <EmptyState icon="🔍" title="No requests nearby" subtitle="Try changing the filter" />
        ) : (
          requests.map((r: any) => (
            <View key={r.id} style={{
              backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
              borderRadius: 12, padding: 12, marginBottom: 10,
              flexDirection: 'row', gap: 12, alignItems: 'center',
            }}>
              <Avatar name={r.recipient?.name} size={44} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>{r.recipient?.name}</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                  {r.distance_km != null && (
                    <Text style={{ fontSize: 10, fontWeight: '700', color: C.green, backgroundColor: C.tagGreen, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>{r.distance_km.toFixed(1)} km</Text>
                  )}
                </View>
                <Text style={{ fontSize: 12, color: C.textMid }}>{r.title} · {r.quantity_needed}</Text>
              </View>
              <Btn size="sm" onPress={() => setOfferTarget(r)} style={{ backgroundColor: C.green, color: '#fff', flexShrink: 0 }}>Offer Help</Btn>
            </View>
          ))
        )}
      </ScrollView>

      {/* Offer Sheet */}
      {offerTarget && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: 20, paddingBottom: insets.bottom + 20,
        }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 16 }} />
          <Text style={{ fontWeight: '700', fontSize: 16, color: C.textDark, marginBottom: 8 }}>Offer to: {offerTarget.recipient?.name}</Text>
          <Text style={{ fontSize: 14, color: C.textMid, marginBottom: 14 }}>{offerTarget.title} · {offerTarget.quantity_needed}</Text>
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 6, textTransform: 'uppercase' }}>NOTE (OPTIONAL)</Text>
            <TextInput
              value={offerNote}
              onChangeText={setOfferNote}
              placeholder="I can deliver tomorrow morning..."
              placeholderTextColor={C.textLight}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: C.surface2, borderRadius: 14, padding: 12,
                fontSize: 14, color: C.textDark, textAlignVertical: 'top',
              }}
            />
          </View>
          <Btn fullWidth size="lg" onPress={offerHelp} style={{ backgroundColor: C.green, color: '#fff' }}>Send Offer</Btn>
          <TouchableOpacity onPress={() => setOfferTarget(null)} style={{ marginTop: 10, alignItems: 'center' }}>
            <Text style={{ color: C.textMid }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom nav */}
      <BottomNavBar tabs={DONOR_TABS} active="/donor/map" />
    </View>
  );
}
