# FeedLink — Build Progress

Track what's done and what's next. Check off items as they're completed.
Resume guide at the bottom.

---

## Project Setup

- [x] Scaffold Expo project (Expo Router file-based routing)
- [x] Install core dependencies (async-storage, expo-location, image-picker, fonts)
- [x] Install react-native-webview (map WebView fallback for Expo Go)
- [x] Set up folder structure (src/api, src/components, src/context, src/screens)
- [x] Set up theme/colors (`src/theme.ts`)
- [x] Set up API client (`src/api/client.ts`) — base URL, auth headers, Accept: application/json, token management
- [x] Set up AppContext — user, role, unreadCount, showToast, logout, notification polling
- [x] Toast rendered inside AppProvider (was missing — fixed)
- [x] Notification polling fixed (`getNotifications` not `notifications.list`)

---

## Auth Screens

- [x] Splash screen — vector leaf icon, ActivityIndicator, green bg
- [x] Onboarding / Role picker — green header, vector icons, donor/recipient cards
- [x] Register screen — green header overlapping card pattern, role badge
- [x] Verify OTP screen — progress dots, amber-filled boxes, disable until 6 digits
- [x] Login screen — green header + floating card, KeyboardAvoidingView
- [x] Forgot Password screen — consistent green header pattern
- [x] Reset Password screen — consistent green header pattern

---

## Shared Components

- [x] `Toast` — rendered in AppProvider, success/error/info
- [x] `Btn` — loading spinner prop, amber/green/danger/outline variants
- [x] `Input` — filled bg, label, required indicator
- [x] `TextArea` — multi-line input
- [x] `ScreenHeader` — title + back button
- [x] `BottomNavBar` — Donor variant (Home/Listings/Map/Alerts/Profile)
- [x] `TagChip` — multi-select food type tags
- [x] `ListingCard` — full-width thumbnail, time left, claims bar, address, vector icons
- [x] `StatusBadge` — active/claimed/completed/expired/cancelled
- [x] `EmptyState` — icon bubble + message
- [x] `Spinner`
- [x] `LocationPickerModal` — Photon geocoding search (Nepal bbox), GPS button, WebView map
- [x] `MapPickerView` — WebView + Leaflet map, same props interface as react-native-maps (easy swap later)
- [x] `Avatar`
- [x] `ConfirmModal`
- [x] `NotifPagination` — prev/next (replaced by cursor pagination in notifications)

---

## Donor Screens

- [x] Donor Home — time greeting, stats cards (glass style), pending claims section, nearby requests banner, pull to refresh
- [x] My Listings — sort by newest/expiring, filter tabs with icons, pull to refresh, FAB, per-tab empty states
- [x] Create Listing — 3-step form (Details → Tags & Photos → Location & Time), no scroll per step, keyboard dismiss
- [x] Listing Detail — photo hero, info card with vector icons, pending claims confirm/reject, cancel above nav bar
- [x] Donor Map — Leaflet WebView map, floating header card with filters, request list, offer bottom sheet
- [x] Donor Notifications — cursor pagination (`?cursor=true` then `next_cursor`), Load more button, pull to refresh
- [x] Donor Profile — green header with avatar, impact stats, contact rows, modern account/logout rows
- [x] Edit Profile — (route exists at `/donor/edit-profile`)

---

## Recipient Screens

- [ ] Recipient Home
- [ ] Listing Detail — Recipient
- [ ] My Claims
- [ ] Recipient Map
- [ ] My Requests
- [ ] Create Request
- [ ] Request Detail — Recipient
- [ ] Recipient Notifications
- [ ] Recipient Profile
- [ ] Edit Profile (shared)

---

## Features / Polish

- [x] `Accept: application/json` header on all API requests — fixes Laravel 302 redirect
- [x] Photo upload — permission request, correct index tracking, error handling
- [x] Timezone-safe datetime — `toLocalSlice()` stores local time, `toLocalISO()` adds offset for API
- [x] Notification bell badge — fixed polling, proper `unread_count` path, amber badge with green ring
- [x] Cursor pagination for notifications — `?cursor=true` first page, `next_cursor` token for subsequent
- [x] Pull to refresh — Home, Listings, Notifications, Map
- [x] Map via WebView + Leaflet (Expo Go compatible) — zoom controls bottom-right, green pin marker
- [x] MapPickerView architecture — drop-in swap for react-native-maps when dev build is ready
- [x] Photon geocoding (Komoot) — Nepal bbox filter, no API key required
- [x] Date picker — native iOS spinner in Modal, `tempDate` state, Cancel/Done, local timezone
- [x] 3-step create listing form — no scroll needed, keyboard dismiss on tap outside
- [x] iOS safe areas on all screens (`useSafeAreaInsets`)
- [ ] react-native-maps swap (when EAS dev build is ready — see MapPickerView.tsx comments)
- [ ] Token refresh on 401 interceptor
- [ ] Android back button handling
- [ ] Offline / error states on key screens
- [ ] App icon + splash screen assets

---

## Architecture Notes

### Routing
- Expo Router with route groups: `app/(auth)/` and `app/(app)/donor/`
- No nested `_layout.tsx` inside donor/ or recipient/ — breaks route discovery
- Route files are thin re-exports: `export default from '../../../src/screens/...'`

### Map strategy
- **Now (Expo Go):** `MapPickerView` uses `react-native-webview` + Leaflet
- **Later (dev build):** swap WebView block inside `MapPickerView` with `react-native-maps` — parent interface unchanged
- Comment in `MapPickerView.tsx` shows exact swap instructions

### Notifications pagination
- Uses cursor mode: `?cursor=true` (first), `?cursor=<token>` (next pages)
- `has_more` drives "Load more" button visibility
- Pull to refresh resets to `cursor=true`

---

## Resume Guide

1. Read `CLAUDE.md` — design context, colors, API reference, UX decisions
2. Read this file — check first unchecked item
3. Read `MEMORY.md` — quick orientation and critical rules
4. **Next up:** Recipient screens (start with Recipient Home)
