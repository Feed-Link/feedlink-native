import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { donor } from '../../api/donor';
import ScreenHeader from '../../components/ScreenHeader';
import StatusBadge from '../../components/StatusBadge';
import Avatar from '../../components/Avatar';
import Btn from '../../components/Btn';
import ConfirmModal from '../../components/ConfirmModal';
import BottomNavBar, { DONOR_TABS } from '../../components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DonorListingDetailScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const [listing, setListing] = React.useState<any>(null);
  const [claims, setClaims] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [confirmModal, setConfirmModal] = React.useState<string | null>(null);

  const load = async () => {
    try {
      const [l, c] = await Promise.all([
        donor.getListing(id),
        donor.getListingClaims(id),
      ]);
      setListing(l.data);
      setClaims(Array.isArray(c.data) ? c.data : []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { if (id) load(); }, [id]);

  const doConfirm = async (claimId: string) => {
    try {
      await donor.confirmClaim(id, claimId);
      showToast('Claim confirmed!', 'success');
      load();
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  const doReject = async (claimId: string) => {
    try {
      await donor.rejectClaim(id, claimId);
      showToast('Claim rejected', 'success');
      load();
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  const doCancel = async () => {
    try {
      await donor.deleteListing(id);
      showToast('Listing cancelled', 'success');
      router.push('/donor/listings' as any);
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  const doReopen = async () => {
    try {
      await donor.reopenListing(id);
      showToast('Listing reopened!', 'success');
      load();
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  const BOTTOM_NAV_HEIGHT = 60;
  const canCancel = listing?.status === 'active' || listing?.status === 'claimed';

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
      <MaterialCommunityIcons name="loading" size={32} color={C.textLight} />
    </View>
  );

  if (!listing) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
      <Text style={{ fontSize: 17, color: C.textDark, fontWeight: '700' }}>Listing not found</Text>
    </View>
  );

  const pending = claims.filter((c: any) => c.status === 'pending');
  const confirmed = claims.find((c: any) => c.status === 'confirmed');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Listing detail" onBack={() => router.push('/donor/listings' as any)} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + (canCancel ? 80 : 0) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo */}
        {listing.photos?.length > 1 ? (
          <FlatList
            data={listing.photos}
            horizontal pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={{ width, height: 220 }} resizeMode="cover" />
            )}
          />
        ) : listing.photos?.[0] ? (
          <Image source={{ uri: listing.photos[0] }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
        ) : (
          <View style={{ height: 180, backgroundColor: C.tagAmber, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="food" size={64} color="rgb(180,120,40)" />
          </View>
        )}

        <View style={{ padding: 16 }}>
          {/* Title + status */}
          <Text style={{ fontWeight: '700', fontSize: 22, color: C.textDark, marginBottom: 8 }}>{listing.title}</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <StatusBadge status={listing.status} />
            {listing.quantity && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <MaterialCommunityIcons name="package-variant" size={14} color={C.textMid} />
                <Text style={{ fontSize: 13, color: C.textMid }}>{listing.quantity}</Text>
              </View>
            )}
          </View>

          {/* Info card */}
          <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 14, marginBottom: 14, gap: 10 }}>
            {listing.address && (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color={C.green} style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 13, color: C.textDark, flex: 1, fontWeight: '500' }}>{listing.address}</Text>
              </View>
            )}
            {listing.expires_at && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={C.amber} />
                <Text style={{ fontSize: 13, color: C.textMid }}>
                  Expires {new Date(listing.expires_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
            {listing.pickup_before && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="walk" size={16} color={C.blue} />
                <Text style={{ fontSize: 13, color: C.textMid }}>
                  Pickup before {new Date(listing.pickup_before).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            )}
            {listing.pickup_instructions && (
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <MaterialCommunityIcons name="information-outline" size={16} color={C.textMid} style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 13, color: C.textMid, flex: 1 }}>{listing.pickup_instructions}</Text>
              </View>
            )}
          </View>

          {/* Pending claims */}
          {listing.status === 'active' && (
            <View style={{ marginBottom: 14 }}>
              <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark, marginBottom: 10 }}>
                Pending requests ({pending.length})
              </Text>
              {pending.length === 0 ? (
                <Text style={{ fontSize: 13, color: C.textMid }}>No requests yet.</Text>
              ) : (
                pending.map((claim: any) => (
                  <View key={claim.id} style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <Avatar name={claim.recipient?.name} size={40} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>{claim.recipient?.name}</Text>
                        {claim.recipient?.is_verified && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <MaterialCommunityIcons name="check-circle" size={12} color={C.green} />
                            <Text style={{ fontSize: 11, color: C.green }}>Verified</Text>
                          </View>
                        )}
                      </View>
                      <StatusBadge status={claim.status} />
                    </View>
                    {claim.note && <Text style={{ fontSize: 12, color: C.textMid, marginBottom: 10 }}>{claim.note}</Text>}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity
                        onPress={() => doConfirm(claim.id)}
                        style={{ flex: 1, height: 36, borderRadius: 99, backgroundColor: C.green, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <MaterialCommunityIcons name="check" size={16} color="#fff" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Confirm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => doReject(claim.id)}
                        style={{ flex: 1, height: 36, borderRadius: 99, backgroundColor: C.surface, borderWidth: 1.5, borderColor: 'rgb(250,202,202)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <MaterialCommunityIcons name="close" size={16} color={C.red} />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: C.red }}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Confirmed recipient */}
          {confirmed && (
            <View style={{ backgroundColor: C.tagGreen, borderWidth: 1, borderColor: C.green, borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.green, marginBottom: 8, textTransform: 'uppercase' }}>Confirmed Recipient</Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Avatar name={confirmed.recipient?.name} size={40} color={C.green} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>{confirmed.recipient?.name}</Text>
                  {confirmed.note && <Text style={{ fontSize: 12, color: C.textMid }}>{confirmed.note}</Text>}
                </View>
              </View>
              {listing.status === 'claimed' && (
                <TouchableOpacity
                  onPress={() => setConfirmModal('reopen')}
                  style={{ marginTop: 10, height: 36, borderRadius: 99, backgroundColor: C.amber, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Reopen listing</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Cancel button — sits above bottom nav */}
      {canCancel && (
        <View style={{
          position: 'absolute',
          bottom: BOTTOM_NAV_HEIGHT + insets.bottom,
          left: 0, right: 0,
          backgroundColor: C.surface,
          borderTopWidth: 1, borderTopColor: C.border,
          padding: 12,
        }}>
          <TouchableOpacity
            onPress={() => setConfirmModal('cancel')}
            style={{ height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgb(250,202,202)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.surface }}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={C.red} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.red }}>Cancel listing</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirm modals */}
      {confirmModal === 'cancel' && (
        <ConfirmModal
          title="Cancel listing?"
          message="This will notify the recipient if already claimed."
          confirmLabel="Cancel listing"
          danger
          onConfirm={doCancel}
          onCancel={() => setConfirmModal(null)}
        />
      )}
      {confirmModal === 'reopen' && (
        <ConfirmModal
          title="Reopen listing?"
          message="All claims will be restored to pending."
          confirmLabel="Reopen"
          onConfirm={doReopen}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <BottomNavBar tabs={DONOR_TABS} active="/donor/listings" />
    </View>
  );
}
