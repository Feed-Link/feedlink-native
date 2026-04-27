import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapPickerView from '../../components/MapPickerView';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';
import Avatar from '../../components/Avatar';
import Spinner from '../../components/Spinner';

const TABS = [
  { k: '', l: 'All', icon: 'map-marker-multiple-outline' },
  { k: 'human', l: 'Human', icon: 'account-outline' },
  { k: 'animal', l: 'paw-outline', icon: 'paw-outline' },
];

export default function DonorMapScreen() {
  const { user, showToast } = useApp();
  const insets = useSafeAreaInsets();

  const lat = user?.latitude || 27.7172;
  const lng = user?.longitude || 85.3240;

  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [filter, setFilter] = React.useState('');
  const [offerTarget, setOfferTarget] = React.useState<any>(null);
  const [offerNote, setOfferNote] = React.useState('');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const q = `?lat=${lat}&lng=${lng}&radius=5${filter ? `&type=${filter}` : ''}`;
      const res = await donor.getRequests(q);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
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

      {/* Map — full bleed, filters float on top */}
      <View style={{ height: 380 + insets.top, position: 'relative' }}>
        <MapPickerView lat={lat} lng={lng} onPinChange={() => {}} style={{ flex: 1 }} />

        {/* Floating header — sits below notch */}
        <View style={{ position: 'absolute', top: insets.top + 12, left: 16, right: 16 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: C.tagGreen, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="map-marker-radius" size={18} color={C.green} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark }}>Nearby Requests</Text>
                <Text style={{ fontSize: 11, color: C.textMid }}>Within 5 km · {requests.length} found</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { k: '', l: 'All', icon: 'view-grid-outline' },
                { k: 'human', l: 'Human', icon: 'account-outline' },
                { k: 'animal', l: 'Animal', icon: 'paw-outline' },
              ].map(f => (
                <TouchableOpacity
                  key={f.k}
                  onPress={() => setFilter(f.k)}
                  activeOpacity={0.7}
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 7, borderRadius: 10, backgroundColor: filter === f.k ? C.green : C.surface2 }}
                >
                  <MaterialCommunityIcons name={f.icon as any} size={13} color={filter === f.k ? '#fff' : C.textMid} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: filter === f.k ? '#fff' : C.textMid }}>{f.l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Request list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.green} colors={[C.green]} />}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ fontWeight: '700', fontSize: 16, color: C.textDark }}>Food requests</Text>
          {!loading && requests.length > 0 && (
            <View style={{ backgroundColor: C.tagGreen, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.green }}>{requests.length} nearby</Text>
            </View>
          )}
        </View>

        {loading ? (
          <Spinner />
        ) : requests.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40, gap: 10 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="map-search-outline" size={30} color={C.textLight} />
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.textDark }}>No requests nearby</Text>
            <Text style={{ fontSize: 13, color: C.textMid }}>Try changing the filter</Text>
          </View>
        ) : (
          requests.map((r: any) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => setOfferTarget(r)}
              activeOpacity={0.85}
              style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}
            >
              <Avatar name={r.recipient?.name} size={46} color={C.green} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark, marginBottom: 2 }}>{r.recipient?.name}</Text>
                <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 6 }} numberOfLines={1}>{r.title} · {r.quantity_needed}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {r.distance_km != null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.tagGreen, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                      <MaterialCommunityIcons name="map-marker-outline" size={10} color={C.green} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.green }}>{r.distance_km.toFixed(1)} km</Text>
                    </View>
                  )}
                  {r.tags?.includes('for_animals') && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: C.tagAmber, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 }}>
                      <MaterialCommunityIcons name="paw-outline" size={10} color={C.amber} />
                      <Text style={{ fontSize: 10, fontWeight: '700', color: C.amber }}>Animals</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.tagGreen, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="hand-heart-outline" size={18} color={C.green} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Offer bottom sheet */}
      {offerTarget && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: insets.bottom + 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 18 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, backgroundColor: C.surface2, borderRadius: 14, padding: 12 }}>
            <Avatar name={offerTarget.recipient?.name} size={44} color={C.green} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark }}>{offerTarget.recipient?.name}</Text>
              <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{offerTarget.title} · {offerTarget.quantity_needed}</Text>
            </View>
            {offerTarget.distance_km != null && (
              <View style={{ backgroundColor: C.tagGreen, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.green }}>{offerTarget.distance_km.toFixed(1)} km</Text>
              </View>
            )}
          </View>

          <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMid, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Note (optional)</Text>
          <TextInput
            value={offerNote}
            onChangeText={setOfferNote}
            placeholder="e.g. I can deliver tomorrow morning..."
            placeholderTextColor={C.textLight}
            multiline
            numberOfLines={3}
            style={{ backgroundColor: C.surface2, borderRadius: 14, padding: 12, fontSize: 14, color: C.textDark, textAlignVertical: 'top', marginBottom: 16, minHeight: 80 }}
          />

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setOfferTarget(null)}
              style={{ flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMid }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={offerHelp}
              style={{ flex: 2, height: 50, borderRadius: 14, backgroundColor: C.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <MaterialCommunityIcons name="hand-heart-outline" size={18} color="#fff" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Send Offer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <BottomNavBar tabs={DONOR_TABS} active="/donor/map" />
    </View>
  );
}
