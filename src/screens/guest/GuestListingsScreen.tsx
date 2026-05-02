import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { donor } from '../../api/donor';
import ListingCard from '../../components/ListingCard';
import BottomNavBar, { GUEST_TABS } from '../../components/BottomNavBar';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';

export default function GuestListingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useApp();

  const [listings, setListings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState('active');

  const load = async () => {
    setLoading(true);
    try {
      const res = await donor.getListings(`?status=${status}&per_page=20`);
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, [status]);

  const tabs = ['active', 'claimed', 'completed', 'expired', 'cancelled'];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 16, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <Text style={{ fontWeight: '700', fontSize: 17, color: C.textDark }}>Your listings</Text>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab} onPress={() => setStatus(tab)} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: status === tab ? C.blue : 'transparent' }}>
            <Text style={{ fontSize: 12, fontWeight: status === tab ? '700' : '500', color: status === tab ? C.blue : C.textMid, textTransform: 'capitalize' }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 + insets.bottom }}>
        {loading ? null : listings.length === 0 ? (
          <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <MaterialCommunityIcons name="food-off-outline" size={36} color={C.textLight} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.textDark, marginTop: 8 }}>No {status} listings</Text>
          </View>
        ) : (
          listings.map((item: any) => (
            <ListingCard key={item.id} listing={item} onPress={() => router.push(`/guest/listing-detail?id=${item.id}` as any)} />
          ))
        )}
      </ScrollView>

      <BottomNavBar tabs={GUEST_TABS} active="/guest/listings" accentColor={C.blue} />
    </View>
  );
}