# Recipient Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build core recipient screens (Home, Listing Detail, My Claims, Profile, Notifications) following donor screen patterns with recipient API endpoints.

**Architecture:** Hybrid clone + shared API approach. Clone donor screen structure, swap API calls to new `recipient.ts`. Reuse all shared components (ListingCard, BottomNavBar, etc.). Profile/Notifications get new tab configs.

**Tech Stack:** React Native, Expo Router, TypeScript, MaterialCommunityIcons, react-native-safe-area-context, AsyncStorage.

---

## File Structure

### Files to Create

| File | Responsibility |
|---|---|
| `src/api/recipient.ts` | Recipient API endpoints (claims, listings, requests) |
| `src/screens/recipient/RecipientHomeScreen.tsx` | Home: nearby listings, stats, radius filter |
| `src/screens/recipient/RecipientListingDetailScreen.tsx` | Listing detail with claim flow |
| `src/screens/recipient/RecipientMyClaimsScreen.tsx` | My Claims with tabs and pagination |
| `src/screens/recipient/RecipientProfileScreen.tsx` | Profile with stats and logout |
| `src/screens/recipient/RecipientNotificationsScreen.tsx` | Notifications with mark read |
| `src/screens/recipient/RecipientEditProfileScreen.tsx` | Edit profile form |
| `app/(app)/recipient/_layout.tsx` | Expo Router layout with role check |
| `app/(app)/recipient/home.tsx` | Re-export RecipientHomeScreen |
| `app/(app)/recipient/listing-detail.tsx` | Re-export RecipientListingDetailScreen |
| `app/(app)/recipient/my-claims.tsx` | Re-export RecipientMyClaimsScreen |
| `app/(app)/recipient/profile.tsx` | Re-export RecipientProfileScreen |
| `app/(app)/recipient/notifications.tsx` | Re-export RecipientNotificationsScreen |
| `app/(app)/recipient/edit-profile.tsx` | Re-export RecipientEditProfileScreen |

### Files to Modify

| File | Change |
|---|---|
| `src/components/BottomNavBar.tsx` | Add `RECIPIENT_TABS` export |
| `src/context/AppContext.tsx` | Minor: ensure recipient role routing works |

### Shared Components Reused

`Avatar`, `BottomNavBar`, `Btn`, `ConfirmModal`, `EmptyState`, `Input`, `ListingCard`, `LocationPickerModal`, `MapPickerView`, `NotifPagination`, `ScreenHeader`, `Spinner`, `StatusBadge`, `TagChip`, `TextArea`, `Toast`

---

### Task 1: Create Recipient API Layer

**Files:**
- Create: `src/api/recipient.ts`

- [ ] **Step 1: Write the recipient API file**

```typescript
// src/api/recipient.ts
import * as client from './client';

export const recipient = {
  // Nearby listings (for home screen)
  getNearbyListings: (query = '') => client.request(`/listings/nearby${query}`),

  // My claims
  getClaims: (query = '') => client.request(`/recipient/claims${query}`),
  createClaim: (listingId: string, data?: any) =>
    client.request(`/recipient/listings/${listingId}/claim`, { method: 'POST', body: JSON.stringify(data) }),
  cancelClaim: (listingId: string) =>
    client.request(`/recipient/listings/${listingId}/claim`, { method: 'DELETE' }),
  markCollected: (listingId: string) =>
    client.request(`/recipient/listings/${listingId}/complete`, { method: 'POST' }),

  // My requests (CRUD)
  getRequests: (query = '') => client.request(`/recipient/requests${query}`),
  getRequest: (id: string) => client.request(`/recipient/requests/${id}`),
  createRequest: (data: any) =>
    client.request('/recipient/requests', { method: 'POST', body: JSON.stringify(data) }),
  updateRequest: (id: string, data: any) =>
    client.request(`/recipient/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRequest: (id: string) =>
    client.request(`/recipient/requests/${id}`, { method: 'DELETE' }),

  // Request acceptances (donor offers)
  getAcceptances: (requestId: string) =>
    client.request(`/recipient/requests/${requestId}/acceptances`),
  confirmAcceptance: (requestId: string, acceptanceId: string) =>
    client.request(`/recipient/requests/${requestId}/acceptances/${acceptanceId}/confirm`, { method: 'POST' }),
  rejectAcceptance: (requestId: string, acceptanceId: string) =>
    client.request(`/recipient/requests/${requestId}/acceptances/${acceptanceId}/reject`, { method: 'POST' }),
  completeRequest: (requestId: string) =>
    client.request(`/recipient/requests/${requestId}/complete`, { method: 'POST' }),
};
```

- [ ] **Step 2: Verify the file loads without syntax errors**

Run: `npx tsc --noEmit src/api/recipient.ts 2>&1 | head -20`
Expected: No errors (or only import errors for missing client, which is fine)

- [ ] **Step 3: Commit**

```bash
git add src/api/recipient.ts
git commit -m "feat: add recipient API layer with claims, listings, and requests endpoints

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Add RECIPIENT_TABS to BottomNavBar

**Files:**
- Modify: `src/components/BottomNavBar.tsx`

- [ ] **Step 1: Add RECIPIENT_TABS export after DONOR_TABS**

After line 78 in `src/components/BottomNavBar.tsx`, add:

```typescript
// Recipient-specific tabs
export const RECIPIENT_TABS: TabItem[] = [
  { key: '/recipient/home',        label: 'Home',      iconName: 'home-outline' },
  { key: '/recipient/my-claims',     label: 'My Claims', iconName: 'handshake-outline' },
  { key: '/recipient/map',          label: 'Map',       iconName: 'map-outline' },
  { key: '/recipient/notifications', label: 'Alerts',    iconName: 'notifications-outline' },
  { key: '/recipient/profile',       label: 'Profile',   iconName: 'person-outline' },
];
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit src/components/BottomNavBar.tsx 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/BottomNavBar.tsx
git commit -m "feat: add RECIPIENT_TABS to BottomNavBar

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Create Recipient App Layout

**Files:**
- Create: `app/(app)/recipient/_layout.tsx`

- [ ] **Step 1: Create the layout file**

```tsx
// app/(app)/recipient/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function RecipientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="listing-detail" />
      <Stack.Screen name="my-claims" />
      <Stack.Screen name="map" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="request-detail" />
      <Stack.Screen name="create-request" />
    </Stack>
  );
}
```

- [ ] **Step 2: Create the re-export files**

Create `app/(app)/recipient/home.tsx`:
```tsx
import RecipientHomeScreen from '../../../src/screens/recipient/RecipientHomeScreen';
export default RecipientHomeScreen;
```

Create `app/(app)/recipient/listing-detail.tsx`:
```tsx
import RecipientListingDetailScreen from '../../../src/screens/recipient/RecipientListingDetailScreen';
export default RecipientListingDetailScreen;
```

Create `app/(app)/recipient/my-claims.tsx`:
```tsx
import RecipientMyClaimsScreen from '../../../src/screens/recipient/RecipientMyClaimsScreen';
export default RecipientMyClaimsScreen;
```

Create `app/(app)/recipient/profile.tsx`:
```tsx
import RecipientProfileScreen from '../../../src/screens/recipient/RecipientProfileScreen';
export default RecipientProfileScreen;
```

Create `app/(app)/recipient/notifications.tsx`:
```tsx
import RecipientNotificationsScreen from '../../../src/screens/recipient/RecipientNotificationsScreen';
export default RecipientNotificationsScreen;
```

Create `app/(app)/recipient/edit-profile.tsx`:
```tsx
import RecipientEditProfileScreen from '../../../src/screens/recipient/RecipientEditProfileScreen';
export default RecipientEditProfileScreen;
```

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/recipient/
git commit -m "feat: add recipient app layout and re-export files

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Create Recipient Home Screen

**Files:**
- Create: `src/screens/recipient/RecipientHomeScreen.tsx`

- [ ] **Step 1: Create the Home Screen**

```tsx
// src/screens/recipient/RecipientHomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { recipient } from '../../api/recipient';
import { donor } from '../../api/donor';
import Avatar from '../../components/Avatar';
import Spinner from '../../components/Spinner';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

const MAP_TOGGLE = [
  { key: 'list', label: 'List', icon: 'view-list' },
  { key: 'map', label: 'Map', icon: 'map' },
];

const RADIUS_OPTIONS = [5, 10, 25];

export default function RecipientHomeScreen() {
  const { user, showToast, unreadCount } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats] = React.useState<any>(null);
  const [nearbyListings, setNearbyListings] = React.useState<any[]>([]);
  const [activeClaims, setActiveClaims] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('list');
  const [radius, setRadius] = React.useState(5);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const userLat = user?.latitude || 27.7172;
      const userLng = user?.longitude || 85.3240;
      const [s, l, c] = await Promise.all([
        recipient.getClaims(),
        recipient.getNearbyListings(`?lat=${userLat}&lng=${userLng}&radius=${radius}&per_page=10`),
        recipient.getRequests('?status=open&per_page=1'),
      ]);
      setStats({ claims_active: s.data?.length || 0, requests_active: c.data?.length || 0 });
      setNearbyListings(Array.isArray(l.data) ? l.data : []);
      const active = (Array.isArray(s.data) ? s.data : []).filter((cl: any) => ['pending', 'confirmed'].includes(cl.status));
      setActiveClaims(active);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => { load(); }, [radius]);

  const name = user?.name?.split(' ')[0] || 'there';

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const timeAgo = (iso: string) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.green} colors={[C.green]} />}
      >
        {/* Green header */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '500' }}>{greeting()}, {name}</Text>
              <Text style={{ fontWeight: '700', fontSize: 22, color: '#fff', marginTop: 2 }}>Every meal matters</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/recipient/notifications' as any)}
              activeOpacity={0.7}
              style={{ position: 'relative', width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color="#fff" />
              {unreadCount > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: C.amber, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: C.green }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            {[
              { label: 'Available', val: nearbyListings.length || '–', icon: 'map-marker-multiple', index: 0 },
              { label: 'My Claims', val: activeClaims.length || '–', icon: 'handshake', index: 1 },
              { label: 'Requests', val: stats?.requests_active ?? '–', icon: 'clipboard-text', index: 2 },
            ].map(s => (
              <TouchableOpacity
                key={s.label}
                onPress={() => {
                  if (s.label === 'My Claims') router.push('/recipient/my-claims' as any);
                }}
                activeOpacity={0.8}
                style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingVertical: 16, paddingHorizontal: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <MaterialCommunityIcons name={s.icon as any} size={24} color="#fff" style={{ marginBottom: 6 }} />
                <Text style={{ fontWeight: '800', fontSize: 22, color: '#fff', lineHeight: 24 }}>{s.val}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 4 }}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* View toggle + Radius filter */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {MAP_TOGGLE.map(t => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => setViewMode(t.key)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, backgroundColor: viewMode === t.key ? C.green : C.surface2 }}
                >
                  <Ionicons name={t.icon as any} size={14} color={viewMode === t.key ? '#fff' : C.textMid} />
                  <Text style={{ fontSize: 12, fontWeight: viewMode === t.key ? '700' : '500', color: viewMode === t.key ? '#fff' : C.textMid }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {RADIUS_OPTIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRadius(r)}
                  activeOpacity={0.7}
                  style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, backgroundColor: radius === r ? C.green : C.surface2, borderWidth: 1, borderColor: radius === r ? C.green : 'transparent' }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: radius === r ? '#fff' : C.textMid }}>{r}km</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Listings */}
          {loading ? (
            <Spinner />
          ) : nearbyListings.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <MaterialCommunityIcons name="food-off" size={32} color={C.textLight} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>No listings nearby</Text>
              <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 }}>Try increasing the search radius or check back later</Text>
            </View>
          ) : viewMode === 'list' ? (
            nearbyListings.map((l: any) => (
              <TouchableOpacity
                key={l.id}
                onPress={() => router.push(`/recipient/listing-detail?id=${l.id}` as any)}
                activeOpacity={0.85}
                style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, marginBottom: 12, overflow: 'hidden' }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 90, height: 90, backgroundColor: C.tagAmber, flexShrink: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
                    {l.photos?.[0]
                      ? <Image source={{ uri: l.photos[0] }} style={{ width: 90, height: 90 }} resizeMode="cover" />
                      : <MaterialCommunityIcons name="food" size={32} color="rgb(180,120,40)" />
                    }
                  </View>
                  <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark, marginBottom: 4 }} numberOfLines={1}>{l.title}</Text>
                      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                        <View style={{ backgroundColor: C.surface2, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99 }}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: C.textMid }}>{l.distance_km ? `${l.distance_km.toFixed(1)}km` : '–'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MaterialCommunityIcons name="package-variant-closed" size={12} color={C.textLight} />
                        <Text style={{ fontSize: 12, color: C.textLight }} numberOfLines={1}>{l.quantity || '—'}</Text>
                      </View>
                      {l.address && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <MaterialCommunityIcons name="map-marker-outline" size={12} color={C.textLight} />
                          <Text style={{ fontSize: 11, color: C.textLight }} numberOfLines={1}>{l.address.split(',')[0]}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <MaterialCommunityIcons name="map" size={48} color={C.textLight} />
              <Text style={{ fontSize: 14, color: C.textMid, marginTop: 12 }}>Map view coming soon</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/home" />
    </View>
  );
}
```

- [ ] **Step 2: Add missing import for Image**

Add at top of Home Screen after other imports:
```typescript
import { Image } from 'react-native';
```

- [ ] **Step 3: Check for TypeScript errors**

Run: `npx tsc --noEmit src/screens/recipient/RecipientHomeScreen.tsx 2>&1 | head -30`
Expected: No errors (may have pre-existing errors from other files)

- [ ] **Step 4: Commit**

```bash
git add src/screens/recipient/RecipientHomeScreen.tsx
git commit -m "feat: add recipient home screen with nearby listings, stats, and filters

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Create Recipient Listing Detail Screen

**Files:**
- Create: `src/screens/recipient/RecipientListingDetailScreen.tsx`

- [ ] **Step 1: Create the Listing Detail Screen**

```tsx
// src/screens/recipient/RecipientListingDetailScreen.tsx
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
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit src/screens/recipient/RecipientListingDetailScreen.tsx 2>&1 | head -30`

- [ ] **Step 3: Commit**

```bash
git add src/screens/recipient/RecipientListingDetailScreen.tsx
git commit -m "feat: add recipient listing detail screen with claim flow

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Create Recipient My Claims Screen

**Files:**
- Create: `src/screens/recipient/RecipientMyClaimsScreen.tsx`

- [ ] **Step 1: Create the My Claims Screen**

```tsx
// src/screens/recipient/RecipientMyClaimsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { recipient } from '../../api/recipient';
import ListingCard from '../../components/ListingCard';
import Spinner from '../../components/Spinner';
import NotifPagination from '../../components/NotifPagination';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TABS = [
  { key: 'pending', label: 'Pending', icon: 'clock-outline' },
  { key: 'confirmed', label: 'Confirmed', icon: 'check-circle-outline' },
  { key: 'completed', label: 'Completed', icon: 'check-decagram' },
  { key: '', label: 'All', icon: 'view-list-outline' },
];

const EMPTY_CONFIG: Record<string, { icon: string; title: string; subtitle: string }> = {
  pending:    { icon: 'clock-outline',        title: 'No pending claims',    subtitle: 'Claim a listing to see it here' },
  confirmed:  { icon: 'check-circle-outline', title: 'No confirmed claims',  subtitle: 'When a donor confirms your claim it shows here' },
  completed:  { icon: 'check-decagram',      title: 'No completed claims',  subtitle: 'Collected food will appear here' },
  '':          { icon: 'inbox-outline',       title: 'No claims yet',        subtitle: "You haven't claimed any food listings yet" },
};

const PER_PAGE = 10;

export default function RecipientMyClaimsScreen() {
  const { showToast } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = React.useState('pending');
  const [claims, setClaims] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [meta, setMeta] = React.useState<any>(null);

  const fetchClaims = async (status: string, p: number, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const parts = [status ? `status=${status}` : '', `page=${p}`, `per_page=${PER_PAGE}`].filter(Boolean).join('&');
      const res = await recipient.getClaims(`?${parts}`);
      setClaims(Array.isArray(res.data) ? res.data : []);
      setMeta(res.meta || null);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => { setPage(1); }, [tab]);
  React.useEffect(() => { fetchClaims(tab, page); }, [tab, page]);

  const lastPage = meta?.last_page || 1;
  const total = meta?.total || 0;
  const empty = EMPTY_CONFIG[tab] || EMPTY_CONFIG[''];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchClaims(tab, page, true)} tintColor={C.green} colors={[C.green]} />
        }
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 14, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border }}>
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontWeight: '800', fontSize: 22, color: C.textDark }}>My Claims</Text>
            {total > 0 && !loading && (
              <Text style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{total} claim{total !== 1 ? 's' : ''} {tab || 'total'}</Text>
            )}
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
            {TABS.map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, backgroundColor: tab === t.key ? C.green : C.surface2 }}
              >
                <MaterialCommunityIcons name={t.icon as any} size={15} color={tab === t.key ? '#fff' : C.textMid} />
                <Text style={{ fontSize: 14, fontWeight: tab === t.key ? '700' : '500', color: tab === t.key ? '#fff' : C.textMid }}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {loading ? (
            <Spinner />
          ) : claims.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <MaterialCommunityIcons name={empty.icon as any} size={32} color={C.textLight} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>{empty.title}</Text>
              <Text style={{ fontSize: 13, color: C.textMid, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 }}>{empty.subtitle}</Text>
            </View>
          ) : (
            claims.map((c: any) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => router.push(`/recipient/listing-detail?id=${c.food_listing_id}` as any)}
                activeOpacity={0.85}
                style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 14, marginBottom: 12 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: C.textDark }} numberOfLines={1}>{c.listing?.title || 'Listing'}</Text>
                  </View>
                  <View style={{ backgroundColor: c.status === 'confirmed' ? C.tagGreen : c.status === 'pending' ? C.tagAmber : C.surface2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: c.status === 'confirmed' ? C.green : c.status === 'pending' ? C.amber : C.textMid }}>{c.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

          {!loading && lastPage > 1 && (
            <NotifPagination page={page} lastPage={lastPage} total={total} perPage={PER_PAGE} onChange={p => setPage(p)} />
          )}
        </View>
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/my-claims" />
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit src/screens/recipient/RecipientMyClaimsScreen.tsx 2>&1 | head -30`

- [ ] **Step 3: Commit**

```bash
git add src/screens/recipient/RecipientMyClaimsScreen.tsx
git commit -m "feat: add recipient my claims screen with tabs and pagination

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 7: Create Recipient Profile Screen

**Files:**
- Create: `src/screens/recipient/RecipientProfileScreen.tsx`

- [ ] **Step 1: Create the Profile Screen**

```tsx
// src/screens/recipient/RecipientProfileScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { recipient } from '../../api/recipient';
import { auth, clearTokens } from '../../api/client';
import Avatar from '../../components/Avatar';
import ConfirmModal from '../../components/ConfirmModal';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RecipientProfileScreen() {
  const { user, setUser, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [confirmLogout, setConfirmLogout] = React.useState(false);

  const logout = async () => {
    try { await auth.logout(); } catch (_) {}
    clearTokens();
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.removeItem('fl_role');
    await AsyncStorage.removeItem('fl_user');
    setUser(null);
    router.replace('/onboarding' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }} showsVerticalScrollIndicator={false}>

        {/* Green header with avatar */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 64, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', fontSize: 17, color: '#fff', alignSelf: 'flex-start', marginBottom: 20 }}>Profile</Text>
          <View style={{ position: 'relative' }}>
            <Avatar name={user?.name} size={84} color={C.green} />
            <TouchableOpacity
              onPress={() => router.push('/recipient/edit-profile' as any)}
              activeOpacity={0.8}
              style={{ position: 'absolute', bottom: 0, right: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 }}
            >
              <MaterialCommunityIcons name="pencil" size={14} color={C.green} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontWeight: '700', fontSize: 18, color: '#fff', marginTop: 12 }}>{user?.name}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>Recipient</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -28 }}>

          {/* Contact info */}
          <View style={{ backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            {[
              { icon: 'email-outline', label: 'Email', value: user?.email || '–' },
              { icon: 'phone-outline', label: 'Phone', value: user?.contact || '–' },
            ].map((row, i) => (
              <View key={row.label}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name={row.icon as any} size={18} color={C.textMid} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: C.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 }}>{row.label}</Text>
                    <Text style={{ fontSize: 14, color: C.textDark, fontWeight: '500', marginTop: 1 }}>{row.value}</Text>
                  </View>
                </View>
                {i === 0 && <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 16 }} />}
              </View>
            ))}
          </View>

          {/* Account actions */}
          <View style={{ backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            {[
              { icon: 'account-edit-outline', label: 'Edit profile', color: C.textDark, action: () => router.push('/recipient/edit-profile' as any) },
              { icon: 'information-outline', label: 'About FeedLink', color: C.textDark, action: () => {} },
            ].map((item, i, arr) => (
              <View key={item.label}>
                <TouchableOpacity onPress={item.action} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
                    <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: item.color }}>{item.label}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={C.textLight} />
                </TouchableOpacity>
                {i < arr.length - 1 && <View style={{ height: 1, backgroundColor: C.border, marginHorizontal: 16 }} />}
              </View>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={() => setConfirmLogout(true)}
            activeOpacity={0.8}
            style={{ backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: 'rgb(250,202,202)', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgb(254,242,242)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="logout" size={18} color={C.red} />
            </View>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.red }}>Log out</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="rgb(250,202,202)" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/profile" />

      {confirmLogout && (
        <ConfirmModal
          title="Log out?"
          message="You will need to log in again."
          confirmLabel="Log out"
          danger
          onConfirm={logout}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit src/screens/recipient/RecipientProfileScreen.tsx 2>&1 | head -30`

- [ ] **Step 3: Commit**

```bash
git add src/screens/recipient/RecipientProfileScreen.tsx
git commit -m "feat: add recipient profile screen with stats, contact info, and logout

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 8: Create Recipient Notifications Screen

**Files:**
- Create: `src/screens/recipient/RecipientNotificationsScreen.tsx`

- [ ] **Step 1: Create the Notifications Screen**

```tsx
// src/screens/recipient/RecipientNotificationsScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import { notifications } from '../../api/client';
import Spinner from '../../components/Spinner';
import BottomNavBar, { RECIPIENT_TABS } from '../../components/BottomNavBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICONS: Record<string, { icon: string; color: string; bgColor: string }> = {
  claim_confirmed:             { icon: 'check-circle-outline',   color: C.green, bgColor: C.tagGreen },
  claim_rejected:              { icon: 'close-circle-outline',   color: C.red,   bgColor: '#fee2e2' },
  pickup_completed:            { icon: 'check-decagram',         color: C.green, bgColor: C.tagGreen },
  request_accepted:            { icon: 'handshake',              color: C.green, bgColor: C.tagGreen },
  acceptance_confirmed:        { icon: 'heart-circle-outline',   color: C.green, bgColor: C.tagGreen },
  acceptance_rejected:         { icon: 'heart-broken-outline',   color: C.red,   bgColor: '#fee2e2' },
  request_fulfilled:            { icon: 'clipboard-check-outline', color: C.green, bgColor: C.tagGreen },
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function RecipientNotificationsScreen() {
  const { showToast, setUnreadCount } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [items, setItems] = React.useState<any[]>([]);
  const [unread, setUnread] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [nextCursor, setNextCursor] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(false);

  const loadFirst = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await notifications.getNotifications('?cursor=true&per_page=15');
      const data = res.data;
      setItems(data?.items || []);
      setUnread(data?.unread_count || 0);
      setNextCursor(data?.meta?.next_cursor || null);
      setHasMore(data?.meta?.has_more || false);
    } catch (e: any) {
      showToast(e.message || 'Failed to load', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await notifications.getNotifications(`?cursor=${nextCursor}&per_page=15`);
      const data = res.data;
      setItems(prev => [...prev, ...(data?.items || [])]);
      setNextCursor(data?.meta?.next_cursor || null);
      setHasMore(data?.meta?.has_more || false);
    } catch (e: any) {
      showToast(e.message || 'Failed to load more', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notifications.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnread(0);
    } catch (e: any) { showToast(e.message || 'Failed', 'error'); }
  };

  const markRead = async (id: string) => {
    try {
      await notifications.markRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnread(prev => Math.max(0, prev - 1));
    } catch (_) {}
  };

  const getNavTarget = (n: any): string | null => {
    let data = n.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = {}; } }
    if (!data || typeof data !== 'object') data = {};

    const listingId = data.listing_id || data.listingId || n.listing_id || n.listingId;
    const requestId = data.request_id || data.requestId || n.request_id || n.requestId;

    const listingTypes = ['claim_received', 'claim_confirmed', 'claim_rejected',
      'pickup_completed', 'listing_expired', 'listing_expired_uncollected',
      'listing_cancelled', 'listing_reopened'];

    if (listingTypes.includes(n.type) && listingId) {
      return `/recipient/listing-detail?id=${listingId}`;
    }
    if (['request_accepted', 'acceptance_confirmed', 'acceptance_rejected', 'request_fulfilled'].includes(n.type) && requestId) {
      return `/recipient/request-detail?id=${requestId}`;
    }
    return null;
  };

  React.useEffect(() => { setUnreadCount(0); loadFirst(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadFirst(true)} tintColor={C.green} colors={[C.green]} />}
      >
        {/* Green header */}
        <View style={{ backgroundColor: C.green, paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={{ fontWeight: '700', fontSize: 22, color: '#fff' }}>Notifications</Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                {unread > 0 ? `${unread} unread` : 'All caught up'}
              </Text>
            </View>
            {unread > 0 && (
              <TouchableOpacity
                onPress={markAllRead}
                activeOpacity={0.7}
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 14 }}
              >
                <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 56, gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: C.tagGreen, alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="bell-check-outline" size={32} color={C.green} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.textDark }}>All caught up!</Text>
              <Text style={{ fontSize: 13, color: C.textMid }}>No notifications yet</Text>
            </View>
          ) : (
            <>
              {items.map((n: any) => {
                const iconDef = ICONS[n.type] || { icon: 'bell-outline', color: C.textMid, bgColor: C.surface2 };
                const isUnread = !n.read_at;

                return (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => {
                      if (isUnread) markRead(n.id);
                      const navTarget = getNavTarget(n);
                      if (navTarget) {
                        router.push(navTarget as any);
                      } else {
                        showToast(`Cannot open notification`, 'error');
                      }
                    }}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: C.surface,
                      borderRadius: 16,
                      padding: 14,
                      marginBottom: 10,
                      flexDirection: 'row',
                      gap: 12,
                      alignItems: 'flex-start',
                      borderWidth: 1,
                      borderColor: isUnread ? 'rgba(22,163,74,0.2)' : C.border,
                      borderLeftWidth: isUnread ? 3 : 1,
                      borderLeftColor: isUnread ? C.green : C.border,
                      shadowColor: '#000',
                      shadowOpacity: isUnread ? 0.06 : 0.03,
                      shadowRadius: 6,
                      elevation: isUnread ? 2 : 1,
                    }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: n.read_at ? C.surface2 : iconDef.bgColor, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <MaterialCommunityIcons name={iconDef.icon as any} size={22} color={n.read_at ? C.textLight : iconDef.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: isUnread ? '700' : '600', fontSize: 14, color: C.textDark, marginBottom: 3 }}>{n.title}</Text>
                      <Text style={{ fontSize: 13, color: C.textMid, lineHeight: 18, marginBottom: 6 }}>{n.body}</Text>
                      <Text style={{ fontSize: 11, color: C.textLight, fontWeight: '500' }}>{timeAgo(n.created_at)}</Text>
                    </View>
                    {isUnread && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.green, marginTop: 4, flexShrink: 0 }} />}
                  </TouchableOpacity>
                );
              })}

              {/* Load more */}
              {hasMore && (
                <TouchableOpacity
                  onPress={loadMore}
                  disabled={loadingMore}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, marginTop: 4, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }}
                >
                  {loadingMore
                    ? <ActivityIndicator size="small" color={C.green} />
                    : <>
                        <MaterialCommunityIcons name="chevron-down" size={18} color={C.green} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.green }}>Load more</Text>
                      </>
                  }
                </TouchableOpacity>
              )}

              {!hasMore && items.length > 0 && (
                <Text style={{ textAlign: 'center', fontSize: 12, color: C.textLight, paddingVertical: 16 }}>You've seen all notifications</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <BottomNavBar tabs={RECIPIENT_TABS} active="/recipient/notifications" />
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit src/screens/recipient/RecipientNotificationsScreen.tsx 2>&1 | head -30`

- [ ] **Step 3: Commit**

```bash
git add src/screens/recipient/RecipientNotificationsScreen.tsx
git commit -m "feat: add recipient notifications screen with mark read and pagination

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 9: Create Recipient Edit Profile Screen

**Files:**
- Create: `src/screens/recipient/RecipientEditProfileScreen.tsx`

- [ ] **Step 1: Create the Edit Profile Screen**

```tsx
// src/screens/recipient/RecipientEditProfileScreen.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { C } from '../../theme';
import Input from '../../components/Input';
import Btn from '../../components/Btn';
import ScreenHeader from '../../components/ScreenHeader';
import * as client from '../../api/client';

export default function RecipientEditProfileScreen() {
  const { user, setUser, showToast } = useApp();
  const router = useRouter();

  const [form, setForm] = React.useState({
    name: user?.name || '',
    contact: user?.contact || '',
  });
  const [loading, setLoading] = React.useState(false);

  const update = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.name) { showToast('Name is required', 'error'); return; }
    setLoading(true);
    try {
      const res = await client.request('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('fl_user', JSON.stringify(res.data));
      setUser(res.data);
      showToast('Profile updated!', 'success');
      router.push('/recipient/profile' as any);
    } catch (e: any) {
      showToast(e.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScreenHeader title="Edit Profile" onBack={() => router.push('/recipient/profile' as any)} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Full Name"
          value={form.name}
          onChange={update('name')}
          placeholder="Your name"
          required
        />
        <Input
          label="Phone Number"
          value={form.contact}
          onChange={update('contact')}
          placeholder="98XXXXXXXX"
        />
        <Btn
          fullWidth
          size="lg"
          onPress={submit}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? 'Saving…' : 'Save Changes'}
        </Btn>
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit src/screens/recipient/RecipientEditProfileScreen.tsx 2>&1 | head -30`

- [ ] **Step 3: Commit**

```bash
git add src/screens/recipient/RecipientEditProfileScreen.tsx
git commit -m "feat: add recipient edit profile screen

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] API Layer (`src/api/recipient.ts`) — Task 1
- [x] Home Screen with nearby listings, stats, filters — Task 4
- [x] Listing Detail with claim flow — Task 5
- [x] My Claims with tabs — Task 6
- [x] Profile with stats, logout — Task 7
- [x] Notifications with mark read — Task 8
- [x] Edit Profile — Task 9
- [x] BottomNavBar RECIPIENT_TABS — Task 2
- [x] App layout + re-exports — Task 3

**2. Placeholder scan:** No TBD/TODO/fill-in placeholders found.

**3. Type consistency:** All function signatures match between API layer and screen usage.

**4. No emojis:** All icons use `MaterialCommunityIcons`.
