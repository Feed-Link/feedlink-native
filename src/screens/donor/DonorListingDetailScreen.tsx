import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
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

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Loading...</Text>
    </View>
  );

  if (!listing) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 17, color: C.textDark, fontWeight: '700' }}>Listing not found</Text>
    </View>
  );

  const pending = claims.filter((c: any) => c.status === 'pending');
  const confirmed = claims.find((c: any) => c.status === 'confirmed');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero / Photo gallery */}
        {listing.photos && listing.photos.length > 1 ? (
          <FlatList
            data={listing.photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={{ width: Dimensions.width, height: 220 }}>
                <Image source={{ uri: item }} style={{ width: '100%', height: 220 }} resizeMode="cover" />
              </View>
            )}
          />
        ) : (
          <View style={{ height: 200, backgroundColor: listing.photos?.[0] ? 'transparent' : C.tagAmber, alignItems: 'center', justifyContent: 'center', fontSize: 64, overflow: 'hidden' }}>
            {listing.photos?.[0] ? (
              <Image source={{ uri: listing.photos[0] }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
            ) : (
              <Text style={{ fontSize: 64 }}>🌾</Text>
            )}
          </View>
        )}

        <View style={{ padding: 16 }}>
          <Text style={{ fontWeight: '700', fontSize: 22, color: C.textDark, marginBottom: 8 }}>{listing.title}</Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <StatusBadge status={listing.status} />
            {listing.quantity && <Text style={{ fontSize: 13, color: C.textMid }}>{listing.quantity}</Text>}
          </View>

          {/* Info card */}
          <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 12 }}>
            {listing.address && <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 6 }}>📍 {listing.address}</Text>}
            {listing.expires_at && (
              <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 6 }}>⏱ Expires {new Date(listing.expires_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
            )}
            {listing.pickup_before && (
              <Text style={{ fontSize: 13, color: C.textMid }}>🚶 Pickup before {new Date(listing.pickup_before).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
            )}
          </View>

          {/* Claims */}
          {listing.status === 'active' && (
            <View>
              <Text style={{ fontWeight: '700', fontSize: 15, color: C.textDark, marginBottom: 10 }}>Pending requests ({pending.length})</Text>
              {pending.length === 0 ? (
                <Text style={{ fontSize: 13, color: C.textMid, marginBottom: 12 }}>No requests yet.</Text>
              ) : (
                pending.map((claim: any) => (
                  <View key={claim.id} style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <Avatar name={claim.recipient?.name} size={40} />
                      <View>
                        <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>{claim.recipient?.name}</Text>
                        {claim.recipient?.is_verified && <Text style={{ fontSize: 11, color: C.green }}>✓ Verified</Text>}
                      </View>
                      <StatusBadge status={claim.status} />
                    </View>
                    {claim.note && <Text style={{ fontSize: 12, color: C.textMid, marginBottom: 10 }}>{claim.note}</Text>}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Btn size="sm" onPress={() => doConfirm(claim.id)} style={{ backgroundColor: C.green, color: '#fff', flex: 1 }}>✓ Confirm</Btn>
                      <Btn size="sm" variant="outline" onPress={() => doReject(claim.id)} style={{ flex: 1 }}>
                        <Text style={{ color: C.red }}>✗ Reject</Text>
                      </Btn>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {confirmed && (
            <View style={{ backgroundColor: C.tagGreen, borderWidth: 1, borderColor: C.green, borderRadius: 12, padding: 12, marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.green, marginBottom: 6, textTransform: 'uppercase' }}>CONFIRMED RECIPIENT</Text>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Avatar name={confirmed.recipient?.name} size={40} color={C.green} />
                <View>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }}>{confirmed.recipient?.name}</Text>
                  {confirmed.note && <Text style={{ fontSize: 12, color: C.textMid }}>{confirmed.note}</Text>}
                </View>
              </View>
              {listing.status === 'claimed' && (
                <Btn size="sm" onPress={() => setConfirmModal('reopen')} style={{ marginTop: 10, backgroundColor: C.amber, color: '#fff' }}>Reopen listing</Btn>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      {(listing.status === 'active' || listing.status === 'claimed') && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
          padding: 12, paddingBottom: 12 + insets.bottom,
        }}>
          <Btn
            variant="outline"
            fullWidth
            onPress={() => setConfirmModal('cancel')}
            style={{ borderColor: C.border }}
          >
            <Text style={{ color: C.red }}>🗑 Cancel listing</Text>
          </Btn>
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

      {/* Bottom nav */}
      <BottomNavBar tabs={DONOR_TABS} active="/donor/listings" />
    </View>
  );
}
