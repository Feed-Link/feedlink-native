# FeedLink — Claude Code Context

## What This Project Is

**FeedLink** is a food-sharing mobile app that connects food donors with recipients in their local area. Donors post food listings (surplus cooked meals, raw ingredients, packaged food) and recipients claim them. Recipients can also post food requests that donors can accept.

The end goal is a **React Native + Expo** app targeting **iOS and Android natively**. The design was mocked up in HTML/CSS/JS and is being migrated to React Native. PWA/web is not a target.

---

## Current State

The working prototype lives in `design-reference/` (copied from the design bundle). The `feedlink-app/` directory is the **React Native / Expo project** being built from scratch based on that design.

There is no scaffolding yet in this directory — this is the blank slate for the RN implementation.

**Docs:** `docs/MEMORY.md` (quick resume), `docs/PROGRESS.md` (build checklist), `docs/AGENTS.md` (agent guide), `docs/CONVENTIONS.md` (codebase conventions — read this before structural changes).

---

## Design Reference

The HTML prototype covers all screens and should be treated as pixel-level truth for:
- Layout, spacing, component structure
- Color palette (see below)
- Navigation flow
- UX behavior (claim states, pagination, polling, etc.)

The prototype files are at `/tmp/feedlink/project/` (extracted session artifact — re-extract from the design bundle if needed).

---

## Color Palette

```
green:     rgb(22, 163, 74)    — primary brand, buttons, active states
greenDark: rgb(21, 128, 61)    — hover/pressed green
amber:     rgb(245, 158, 11)   — pending/warning states
textDark:  rgb(28, 25, 23)     — primary text
textMid:   rgb(120, 113, 108)  — secondary text / labels
textLight: rgb(168, 163, 158)  — placeholder / muted
border:    rgb(231, 229, 228)  — dividers
bg:        rgb(250, 250, 249)  — screen background
surface:   rgb(255, 255, 255)  — card/modal background
surface2:  rgb(245, 244, 243)  — input fill background
tagGreen:  rgb(220, 252, 228)  — selected tag bg
tagAmber:  rgb(254, 243, 196)  — amber tag bg
blue:      rgb(61, 133, 220)   — link/info
red:       rgb(220, 38, 38)    — destructive / error
```

Typography: **Inter** (400, 500, 600, 700, 800)

---

## API

- **Base URL:** `https://api.feedlink.tech/api`
- **Auth:** Laravel Passport — `Authorization: Bearer {access_token}`
- **Token expiry:** 1800s; refresh via `POST /auth/refresh-token`
- **Roles:** `donor` | `recipient` — stored in user profile, affects available routes

### Key flows
- Register → OTP verify → get token (register returns email, token comes after OTP)
- Login → if unverified, auto-resend OTP → redirect to verify screen
- `POST /upload/photo` first → collect URLs → include in listing payload
- Listings use `tags` array: `for_humans`, `for_animals`, `for_both`, `cooked`, `raw_ingredients`, `packaged`
- Timezone: server is `Asia/Kathmandu (UTC+5:45)` — always send local ISO with offset, never UTC (use `toLocalISO()` helper pattern)

### Listing statuses
`active` → `claimed` (donor confirms a claim) → `completed` (recipient marks collected) | `expired` | `cancelled`

### Claim statuses
`pending` → `confirmed` | `rejected`

---

## Screen Inventory

### Auth (shared)
- Splash → Onboarding (role picker) → Register → Verify OTP → Login → Forgot Password → Reset Password

### Donor
- Home (stats + active listings feed)
- My Listings (tabs: active / claimed / completed / expired / cancelled, with pagination)
- Create Listing (title, desc, quantity, tags, photos ×4, location picker, expires_at, pickup_before)
- Listing Detail (manage claims — confirm/reject, cancel listing, reopen)
- Map (nearby food requests as markers, tap → detail)
- Notifications (paginated, badge count via 30s polling)
- Profile / Edit Profile

### Recipient
- Home (nearby listings, list/map toggle, radius filter)
- Listing Detail (claim → pending → confirmed → mark collected)
- My Claims (with status badges)
- Map (listing markers, tap → detail popup → navigate)
- My Requests (CRUD)
- Create Request (location picker, tags same as donor, needed_by datetime)
- Request Detail (confirm/reject donor acceptance offers)
- Notifications (paginated)
- Profile / Edit Profile

---

## Key UX Decisions (from design chat)

1. **Claim button state**: After claiming, show "⏳ Claim pending" amber bar + "Cancel my claim" red button. "Claim" button only shows when no active claim exists. Load existing claims on mount to pre-populate state — do NOT rely on local state across navigations.

2. **Notification polling**: Poll `GET /notifications?per_page=1` every 30 seconds. Show toast when `unread_count` increases (except when already on notifications screen). Reset badge when notifications screen is opened.

3. **Photo upload**: Upload each photo to `POST /upload/photo` immediately on selection (before form submit). Collect returned URLs. Include in listing payload. Max 4 photos per listing.

4. **Location picker**: Full-screen Leaflet map modal with Nominatim search + reverse geocoding. "My location" GPS button. Resolves pin to human-readable `Neighbourhood, City` format. Used in both Create Listing and Create Request.

5. **Datetime timezone**: Server is Asia/Kathmandu. Send local ISO string with UTC offset (`2026-04-25T20:02:00+05:45`), never `.toISOString()` which outputs UTC.

6. **iOS safe areas**: Use `react-native-safe-area-context` (`SafeAreaView`, `useSafeAreaInsets`) on all screens. Bottom tab bar and headers must respect `top`/`bottom` insets on iPhone notch/Dynamic Island models.

---

## Target Tech Stack (React Native / Expo)

- **Framework**: Expo (managed workflow)
- **Navigation**: React Navigation (stack + bottom tabs)
- **Maps**: react-native-maps (Google Maps on Android, Apple Maps on iOS)
- **Location**: expo-location
- **Storage**: AsyncStorage for tokens/user
- **API calls**: fetch (same API, same patterns)
- **Icons**: `@expo/vector-icons` or lucide-react-native
- **Font**: Inter via `@expo-google-fonts/inter`
- **Safe areas**: react-native-safe-area-context
- **Image picker**: expo-image-picker (for photo upload)

---

## Important Notes

- The app supports **two distinct user roles** with completely separate navigation stacks — do not mix donor and recipient screens
- `recipient/requests` CRUD endpoints exist on the API but pagination is not guaranteed
- Listing `PUT` updates only allowed when `status = active`
- `GET /auth/logout` — GET not POST
- `POST /auth/register` returns email string in `data`, not token
- `POST /auth/login` returns `202 Accepted`
