# FeedLink — Build Progress

Track what's done and what's next. Check off items as they're completed.
Resume guide at the bottom.

---

## Project Setup

- [] Scaffold Expo project (existing Expo Router setup)
- [] Install core dependencies (async-storage, maps, image-picker, fonts)
- [] Install map/location deps (react-native-maps, expo-location)
- [] Install media deps (expo-image-picker)
- [] Install font (@expo-google-fonts/inter)
- [] Set up folder structure (src/api, src/components, src/context, src/utils)
- [] Set up theme/colors file (`src/theme.ts`) — colors, spacing, radius, typography
- [] Set up API client (`src/api/client.ts`) — base URL, auth headers, token refresh, 401 handler, all endpoints
- [] Set up AsyncStorage auth helpers (token management in client.ts)
- [] Set up navigation skeleton (root stack + auth/donor/recipient groups)
- [] Set up AppContext (`src/context/AppContext.tsx`) — user, role, unreadCount, navigate, showToast, logout
- [] Set up notification polling (30s interval in AppContext)

---

## Auth Screens

- [] Splash screen (logo + loading, auto-check auth)
- [] Onboarding / Role picker (donor vs recipient)
- [] Register screen (name, email, phone, password, terms)
- [] Verify OTP screen (6-digit code, handles register/login/reset contexts)
- [] Login screen (auto-redirect to OTP if unverified)
- [] Forgot Password screen (email input → sends reset code)
- [] Reset Password screen (OTP + new password confirmation)

---

## Shared Components

- [] `Toast` component (success / error / info styles)
- [] `Btn` component (green, amber, red, outline variants, loading state)
- [] `Input` component (filled bg, label, required indicator, helper text)
- [] `ScreenHeader` (title, optional back button, safe-area top inset)
- [] `BottomNavBar` — Donor variant (Home / Listings / Map / Alerts / Profile)
- [] `BottomNavBar` — Recipient variant (Home / Claims / Map / Requests / Profile)
- [] `TextArea` (similar to Input but multi-line)
- [] `TagChip` (audience + food state groups, multi-select)
- [] `ListingCard` (thumbnail, title, quantity, tags, distance, status badge)
- [] `StatusBadge` (active / claimed / completed / expired / cancelled)
- [] `EmptyState` (icon in rounded container + message)
- [] `Spinner` / loading overlay
- [] `LocationPickerModal` (map + search + GPS + reverse geocode)
- [] `NotifPagination` (prev/next + page pills)

---

## Donor Screens

- [] Donor Home (stats card + active listings feed)
- [] My Listings (filter tabs: active/claimed/completed/expired/cancelled, pagination)
- [] Create Listing (title, desc, quantity, tags, photos ×4, location picker, expires_at, pickup_before, pickup_instructions)
- [] Listing Detail — Donor (photo gallery/hero, claims list, confirm/reject claim, cancel listing, reopen listing)
- [] Donor Map (nearby food requests as markers, tap → popup → navigate to detail)
- [] Donor Notifications (paginated list, mark read, mark all read)
- [] Donor Profile (stats summary, edit link, logout)
- [] Edit Profile (name, contact, profile photo)

---

## Recipient Screens

- [ ] Recipient Home (nearby listings, list/map toggle, radius filter)
- [ ] Listing Detail — Recipient (photo gallery, claim button → pending state → confirmed → mark collected)
- [ ] My Claims (list with status badges, paginated)
- [ ] Recipient Map (listing markers, tap → popup → navigate)
- [ ] My Requests (list of own requests, CRUD)
- [ ] Create Request (title, desc, quantity, food type, tags, location picker, needed_by)
- [ ] Request Detail — Recipient (view acceptances, confirm/reject donor offers)
- [ ] Recipient Notifications (paginated, badge reset on open)
- [ ] Recipient Profile (edit link, logout)
- [ ] Edit Profile (shared with donor, same component)

---

## Features / Polish

- [ ] Token refresh on 401 (interceptor in API client)
- [ ] Photo upload flow (pick → POST /upload/photo → collect URL → attach to form)
- [ ] Timezone-safe datetime inputs (`toLocalISO()` helper, no UTC conversion)
- [ ] Claim state persistence (fetch existing claims on mount, don't rely on local state)
- [ ] Notification badge polling (30s, toast on new, reset on open)
- [ ] Map markers with popup + navigate (emoji icon, title/qty/address)
- [ ] Android back button handling (navigate to home, not back stack)
- [ ] iOS safe areas on all screens (useSafeAreaInsets)
- [ ] Offline / error states on key screens
- [ ] App icon + splash screen assets (icons already in design-reference/icons/)

---

## Suggested Folder Structure

```
feedlink-app/
├── design-reference/       ← HTML prototype (source of truth for design)
│   ├── index.html
│   ├── js/
│   └── uploads/
├── src/
│   ├── api/
│   │   ├── client.ts       ← base fetch, auth headers, token refresh
│   │   ├── auth.ts
│   │   ├── donor.ts
│   │   ├── recipient.ts
│   │   └── shared.ts
│   ├── components/
│   │   ├── Btn.tsx
│   │   ├── Input.tsx
│   │   ├── TagChip.tsx
│   │   ├── ListingCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ScreenHeader.tsx
│   │   ├── BottomNavBar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Toast.tsx
│   │   ├── LocationPickerModal.tsx
│   │   └── NotifPagination.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── VerifyOTPScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── ResetPasswordScreen.tsx
│   │   ├── donor/
│   │   │   ├── DonorHomeScreen.tsx
│   │   │   ├── DonorListingsScreen.tsx
│   │   │   ├── CreateListingScreen.tsx
│   │   │   ├── DonorListingDetailScreen.tsx
│   │   │   ├── DonorMapScreen.tsx
│   │   │   ├── DonorNotificationsScreen.tsx
│   │   │   ├── DonorProfileScreen.tsx
│   │   │   └── EditProfileScreen.tsx
│   │   └── recipient/
│   │       ├── RecipientHomeScreen.tsx
│   │       ├── RecipientListingDetailScreen.tsx
│   │       ├── MyClaimsScreen.tsx
│   │       ├── RecipientMapScreen.tsx
│   │       ├── MyRequestsScreen.tsx
│   │       ├── CreateRequestScreen.tsx
│   │       ├── RequestDetailScreen.tsx
│   │       ├── RecipientNotificationsScreen.tsx
│   │       ├── RecipientProfileScreen.tsx
│   │       └── EditProfileScreen.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── DonorNavigator.tsx
│   │   └── RecipientNavigator.tsx
│   ├── context/
│   │   └── AppContext.tsx
│   ├── hooks/
│   │   ├── useToast.ts
│   │   └── useNotificationPoll.ts
│   ├── utils/
│   │   ├── toLocalISO.ts   ← timezone-safe datetime
│   │   └── storage.ts      ← AsyncStorage wrappers
│   └── theme.ts            ← colors, typography, spacing
├── assets/
│   └── icons/              ← copy from design-reference/icons/
├── CLAUDE.md
├── AGENTS.md
├── Progress.md             ← this file
└── memory.md               ← session resume guide
```

---

## Resume Guide

When picking this up in a new session:

1. Read `CLAUDE.md` — full design context, screen inventory, API reference, UX decisions
2. Read `Progress.md` (this file) — check what's done, pick the next unchecked block
3. Check `design-reference/index.html` for the exact HTML/CSS of any screen you're about to build
4. Check `design-reference/js/` — `shared.jsx`, `donor.jsx`, `recipient.jsx`, `auth.jsx`, `api.js`
5. Ask Claude: *"Let's implement [screen/feature name]"* — it has full context from CLAUDE.md

**Build order recommendation:**
Project Setup → Shared Components → Auth Screens → Donor Screens → Recipient Screens → Polish
