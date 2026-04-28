import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { recipient } from '../../api/recipient';
import { donor } from '../../api/donor';
import Spinner from '../../components/Spinner';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBadge from '../../components/StatusBadge';
import TagChip from '../../components/TagChip';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'react-native';

export default function RecipientListingDetailScreen() {
  const { user, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [listing, setListing] = React.useState<any>(null);
  const [myClaim, setMyClaim] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [lRes, cRes] = await Promise.all([
        recipient.getNearbyListings(`?per_page=100`),
        recipient.getClaims(),
      ]);
      const listings = Array.isArray(lRes.data) ? lRes.data : [];
      const found = listings.find((l: any) => l.id === id) || null;
      setListing(found);
      const claims = Array.isArray(cRes.data) ? cRes.data : [];
      const myClaim = claims.find((c: any) => c.food_listing_id === id);
      setMyClaim(myClaim || null);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { if (id) load(); }, [id]);

  const handleClaim = async () => {
    setActionLoading(true);
    try {
      await recipient.createClaim(id, { note: '' });
      showToast('Claim submitted!', 'success');
      load();
    } catch (e: any) {
      showToast(e.message || 'Failed to claim', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClaim = async () => {
    Alert.alert('Cancel Claim', 'Are you sure you want to cancel your claim?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, cancel', style: 'destructive', onPress: async () => {
        setActionLoading(true);
        try {
          await recipient.cancelClaim(id);
          showToast('Claim cancelled', 'info');
          load();
        } catch (e: any) {
          showToast(e.message || 'Failed to cancel', 'error');
        } finally {
          setActionLoading(false);
        }
      }},
    ]);
  };

  const handleMarkCollected = async () => {
    setActionLoading(true);
    try {
      await recipient.markCollected(id);
      showToast('Marked as collected!', 'success');
      load();
    } catch (e: any) {
      showToast(e.message || 'Failed to mark collected', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const timeLeft = listing?.expires_at ? (() => {
    const diff = new Date(listing.expires_at).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h left` : `${m}m left`;
  })() : null;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Listing Detail" />
      {loading ? (
        <Spinner />
      ) : !listing ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={C.textLight} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>Listing not found</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo */}
          <View style={{ width: '100%', height: 240, backgroundColor: C.tagAmber, alignItems: 'center', justifyContent: 'center' }}>
            {listing.photos?.[0]
              ? <Image source={{ uri: listing.photos[0] }} style={{ width: '100%', height: 240 }} resizeMode="cover" />
              : <MaterialCommunityIcons name="food" size={64} color="rgb(180,120,40)" />
            }
          </View>

          <View style={{ padding: 16 }}>
            {/* Title + Status */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontWeight: '800', fontSize: 20, color: C.textDark }}>{listing.title}</Text>
              </View>
              <StatusBadge status={listing.status} />
            </View>

            {/* Time left */}
            {timeLeft && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={C.amber} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.amber }}>{timeLeft}</Text>
              </View>
            )}

            {/* Description */}
            {listing.description && (
              <Text style={{ fontSize: 14, color: C.textMid, lineHeight: 22, marginBottom: 16 }}>{listing.description}</Text>
            )}

            {/* Quantity + Tags */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="package-variant-closed" size={16} color={C.textMid} />
                <Text style={{ fontSize: 14, color: C.textDark, fontWeight: '600' }}>{listing.quantity}</Text>
              </View>
            </View>
            {listing.tags?.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {listing.tags.map((t: any) => (
                  <TagChip key={t.slug} label={t.name} active={false} onPress={() => {}} />
                ))}
              </View>
            )}

            {/* Location */}
            {listing.address && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <MaterialCommunityIcons name="map-marker" size={16} color={C.green} />
                <Text style={{ fontSize: 13, color: C.textMid }}>{listing.address}</Text>
              </View>
            )}

            {/* Claim state */}
            {!myClaim && listing.status === 'active' && (
              <TouchableOpacity
                onPress={handleClaim}
                disabled={actionLoading}
                activeOpacity={0.85}
                style={{ backgroundColor: C.green, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 }}
              >
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{actionLoading ? 'Claiming...' : 'Claim this food'}</Text>
              </TouchableOpacity>
            )}

            {myClaim?.status === 'pending' && (
              <View style={{ marginTop: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.tagAmber, padding: 10, borderRadius: 8 }}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={C.amber} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.amber, flex: 1 }}>Claim pending</Text>
                </View>
                <TouchableOpacity
                  onPress={handleCancelClaim}
                  disabled={actionLoading}
                  activeOpacity={0.85}
                  style={{ backgroundColor: 'rgb(254,242,242)', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgb(250,202,202)' }}
                >
                  <Text style={{ color: C.red, fontSize: 14, fontWeight: '700' }}>Cancel my claim</Text>
                </TouchableOpacity>
              </View>
            )}

            {myClaim?.status === 'confirmed' && (
              <View style={{ marginTop: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.tagGreen, padding: 10, borderRadius: 8 }}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={C.green} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.green, flex: 1 }}>Claim confirmed — ready for pickup</Text>
                </View>
                <TouchableOpacity
                  onPress={handleMarkCollected}
                  disabled={actionLoading}
                  activeOpacity={0.85}
                  style={{ backgroundColor: C.green, paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{actionLoading ? 'Marking...' : 'Mark as collected'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {myClaim?.status === 'collected' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.tagGreen, padding: 10, borderRadius: 8, marginTop: 12 }}>
                <MaterialCommunityIcons name="check-circle" size={16} color={C.green} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.green }}>Collected</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/home" />
    </View>
  );
}
