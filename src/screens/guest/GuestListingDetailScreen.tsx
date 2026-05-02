import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { donor } from '../../api/donor';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import Spinner from '../../components/Spinner';

export default function GuestListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useApp();

  const [listing, setListing] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await donor.getListing(id);
        setListing(res.data);
      } catch (e: any) {
        showToast(e.message || 'Failed to load', 'error');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><Spinner /></View>;

  const statusColor = listing?.status === 'active' ? C.green : listing?.status === 'claimed' ? C.amber : C.textMid;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={C.textDark} />
            </TouchableOpacity>
            <Text style={{ fontWeight: '700', fontSize: 17, color: C.textDark, flex: 1 }}>Listing</Text>
            <View style={{ backgroundColor: statusColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: statusColor, textTransform: 'capitalize' }}>{listing?.status}</Text>
            </View>
          </View>
        </View>

        {(listing?.photos?.length > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: C.surface2, paddingVertical: 12 }} contentContainer={{ paddingHorizontal: 16, gap: 8 }}>
            {listing.photos.map((url: string, i: number) => (
              <Image key={i} source={{ uri: url }} style={{ width: 160, height: 160, borderRadius: 12 }} />
            ))}
          </ScrollView>
        )}

        <View style={{ padding: 16 }}>
          <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontWeight: '700', fontSize: 18, color: C.textDark, marginBottom: 8 }}>{listing?.title}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.green, marginBottom: 8 }}>{listing?.quantity}</Text>
            {listing?.description && <Text style={{ fontSize: 14, color: C.textMid, lineHeight: 20 }}>{listing.description}</Text>}
          </View>

          <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 12, textTransform: 'uppercase' }}>Details</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {(listing?.tags || []).map((tag: any, i: number) => (
                <View key={i} style={{ backgroundColor: C.tagGreen, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.green }}>{tag.name || tag.slug || tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.textMid, marginBottom: 12, textTransform: 'uppercase' }}>Location & Time</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={C.green} />
              <Text style={{ fontSize: 14, color: C.textDark }}>{listing?.address}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <MaterialCommunityIcons name="clock-alert-outline" size={18} color={C.amber} />
              <Text style={{ fontSize: 14, color: C.textDark }}>Expires: {listing?.expires_at ? new Date(listing.expires_at).toLocaleString() : 'N/A'}</Text>
            </View>
            {listing?.pickup_before && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="run-fast" size={18} color={C.blue} />
                <Text style={{ fontSize: 14, color: C.textDark }}>Pickup before: {new Date(listing.pickup_before).toLocaleString()}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}