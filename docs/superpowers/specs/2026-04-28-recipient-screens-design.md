# Recipient Screens Design — FeedLink

**Date:** 2026-04-28  
**Status:** Approved  
**Scope:** Core flow — Home, Listing Detail, My Claims, Profile, Notifications

---

## 1. API Layer (`src/api/recipient.ts`)

New file mirroring `donor.ts` structure with recipient endpoints from API docs.

```typescript
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

**Key notes:**
- Claims use `listingId` (not `claimId`) per API docs
- Cancel claim = `DELETE /recipient/listings/{listingId}/claim`
- Mark collected = `POST /recipient/listings/{listingId}/complete`

---

## 2. Recipient Home Screen

**File:** `src/screens/recipient/RecipientHomeScreen.tsx`  
**Reuses:** `BottomNavBar`, `useSafeAreaInsets`, `MaterialCommunityIcons`, `ListingCard`, notification polling from AppContext.

**Layout (mirrors donor home):**
- Green header with greeting + notification bell (badge count from `unreadCount`)
- Stats row (3 cards): "Available" (nearby count), "My Claims" (active claims), "Requests" (active requests)
- Nearby listings section with list/map toggle and radius filter
- My Requests banner (links to My Requests screen)

**Features:**
- `GET /listings/nearby?lat=X&lng=Y&radius=5` for nearby listings
- Toggle between list view (`view-list`) and map view (`map`)
- Radius filter chips: 5km, 10km, 25km using `TagChip` component
- Pull-to-refresh via `RefreshControl`
- `GET /recipient/claims?status=pending` to check for active claims on mount

---

## 3. Recipient Listing Detail Screen

**File:** `src/screens/recipient/RecipientListingDetailScreen.tsx`  
**Reuses:** `TagChip`, `MapPickerView` (display mode), `MaterialCommunityIcons`, `ConfirmModal`.

**Layout (mirrors donor listing detail):**
- Photo carousel (first photo or placeholder icon)
- Title, description, quantity, tags, location with map pin, expiry countdown
- Claim state machine (loaded on mount, not local state)

**Claim Flow:**
1. **No active claim:** "Claim this food" green button → `POST /recipient/listings/{id}/claim`
2. **Pending claim:** Amber bar with `clock-outline` icon + "Claim pending" text + "Cancel my claim" red button → `DELETE /recipient/listings/{id}/claim`
3. **Confirmed claim:** "Mark as collected" green button → `POST /recipient/listings/{id}/complete`
4. **Completed:** Show "Collected" badge with `check-circle` icon

**Donor info:** Avatar, name, contact, "View Profile" link.

**No emojis** — all icons use `MaterialCommunityIcons`.

---

## 4. Recipient My Claims Screen

**File:** `src/screens/recipient/RecipientMyClaimsScreen.tsx`  
**Reuses:** `ListingCard` (with custom `actionLabel`), `NotifPagination`, `MaterialCommunityIcons`, `Spinner`, `EmptyState`.

**Layout (mirrors donor listings screen):**
- Tabs: `pending` | `confirmed` | `completed` | `All`
- Sort options: "Newest" | "Expiring soon"
- Claim cards via `ListingCard` with action buttons

**Claim Cards:**
- Pending: "Cancel claim" red button → `recipient.cancelClaim(listingId)`
- Confirmed: "Mark collected" green button → `recipient.markCollected(listingId)`
- Completed: Show "Collected" badge with date

**Empty states:** Per-tab illustrations with `MaterialCommunityIcons`.

**Pagination:** Reuse `NotifPagination` component.

---

## 5. Recipient Profile Screen

**File:** `src/screens/recipient/RecipientProfileScreen.tsx`  
**Reuses:** `Avatar`, `BottomNavBar`, `ConfirmModal`, `MaterialCommunityIcons`.

**Layout (near-identical to donor profile):**
- Green header with avatar, name, role badge showing "Recipient" (not "Donor")
- Stats row: "Collected" (completed pickups), "Active Claims", "Requests"
- Contact info: Email, phone
- Account actions: Edit Profile, About FeedLink
- Logout button with red styling + `ConfirmModal`

**Stats:** `GET /recipient/stats` (or derive from claims/requests count).

**BottomNavBar:** New `RECIPIENT_TABS` array with accentColor (green for consistency, or blue for differentiation — user chose green).

---

## 6. Recipient Notifications Screen

**File:** `src/screens/recipient/RecipientNotificationsScreen.tsx`  
**Reuses:** `BottomNavBar`, `MaterialCommunityIcons`, `RefreshControl`, `ActivityIndicator`.

**Layout (SAME as donor notifications screen):**
- Green header with unread count, "Mark all read" button
- Notification cards with icons, title, body, time ago
- Load more button for pagination
- Border left accent for unread notifications

**Icon Map (notification types → icons):**
- `claim_confirmed` → `check-circle-outline` (green)
- `claim_rejected` → `close-circle-outline` (red)
- `pickup_completed` → `check-decagram` (green)
- `request_accepted` → `handshake` (green, donor accepted their request)
- `acceptance_confirmed` → `heart-circle-outline` (green)
- `acceptance_rejected` → `heart-broken-outline` (red)
- `request_fulfilled` → `clipboard-check-outline` (green)

**Nav Targets:**
- Claim-related → `/recipient/listing-detail?id={listingId}`
- Request-related → `/recipient/request-detail?id={requestId}`

**Polling:** Same 30s interval from AppContext.

---

## 7. BottomNavBar Tabs for Recipient

**File:** `src/components/BottomNavBar.tsx` (add new export)

```typescript
export const RECIPIENT_TABS: TabItem[] = [
  { key: '/recipient/home',        label: 'Home',     iconName: 'home-outline' },
  { key: '/recipient/my-claims',     label: 'My Claims', iconName: 'handshake-outline' },
  { key: '/recipient/map',          label: 'Map',      iconName: 'map-outline' },
  { key: '/recipient/notifications', label: 'Alerts',   iconName: 'notifications-outline' },
  { key: '/recipient/profile',       label: 'Profile',  iconName: 'person-outline' },
];
```

**Accent color:** Green (same as donor for consistency).

---

## Implementation Approach: Hybrid Clone + Shared API

**Chosen approach:** Clone donor screen structure with recipient API calls. Reuse ALL shared components.

**Rationale:**
- Fastest to implement while maintaining pixel-perfect consistency
- Clear separation of donor/recipient flows (two distinct user roles)
- Minimal abstraction overhead

**Files to create:**
1. `src/api/recipient.ts` — New API layer
2. `src/screens/recipient/RecipientHomeScreen.tsx`
3. `src/screens/recipient/RecipientListingDetailScreen.tsx`
4. `src/screens/recipient/RecipientMyClaimsScreen.tsx`
5. `src/screens/recipient/RecipientProfileScreen.tsx`
6. `src/screens/recipient/RecipientNotificationsScreen.tsx`
7. `src/screens/recipient/RecipientEditProfileScreen.tsx` (reuse donor pattern)
8. `app/(app)/recipient/` — Expo Router directory with re-exports

**Shared components reused:**
- `Avatar`, `BottomNavBar`, `Btn`, `ConfirmModal`, `EmptyState`, `Input`, `ListingCard`, `LocationPickerModal`, `MapPickerView`, `NotifPagination`, `ScreenHeader`, `Spinner`, `StatusBadge`, `TagChip`, `TextArea`, `Toast`

**No emojis** — all icons use `MaterialCommunityIcons` from `@expo/vector-icons`.
