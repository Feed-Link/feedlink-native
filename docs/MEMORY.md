# FeedLink — Project Memory

Quick-reference for resuming work across sessions.

---

## What This App Is

**FeedLink** — food sharing app. Donors post surplus food; recipients claim it. Recipients can also post food requests that donors fulfill. Two completely separate user roles/flows.

- **API base:** `https://api.feedlink.tech/api`
- **Auth:** Laravel Passport Bearer token. Refresh every 1800s via `POST /auth/refresh-token`.
- **Roles:** `donor` | `recipient` — stored in AsyncStorage after login
- **Server timezone:** Asia/Kathmandu (UTC+5:45) — critical for datetime fields

---

## Current State (as of Apr 27 2026)

All **donor screens are complete** with full UI/UX polish. Recipient screens not started yet.

**What's built:**
- Full auth flow (splash → onboarding → register → OTP → login → forgot/reset)
- All 8 donor screens: Home, Listings, Create Listing (3-step), Listing Detail, Map, Notifications, Profile, Edit Profile
- All shared components including `MapPickerView` (WebView + Leaflet)

**What's next:** Recipient screens — start with Recipient Home.

---

## Where Things Live

| Path | What it is |
|---|---|
| `CLAUDE.md` | Full context — colors, screen list, API reference, UX decisions |
| `docs/PROGRESS.md` | Build checklist + architecture notes + resume guide |
| `docs/MEMORY.md` | This file — quick reference |
| `src/api/client.ts` | Base fetch client — all auth, shared, notifications endpoints |
| `src/api/donor.ts` | All donor API endpoints |
| `src/context/AppContext.tsx` | Global state — user, role, toast, unreadCount, notification polling |
| `src/components/MapPickerView.tsx` | WebView+Leaflet map — swap-ready for react-native-maps |
| `src/components/LocationPickerModal.tsx` | Location picker with Photon search + GPS + map |

---

## Color Palette (quick ref)

| Name | Value | Use |
|---|---|---|
| green | `#16a34a` | Brand, primary buttons, active states |
| amber | `#f59e0b` | Auth screens, pending/warning |
| red | `#dc2626` | Destructive / error |
| bg | `#fafaf9` | Screen background |
| surface | `#ffffff` | Cards |
| surface2 | `#f5f4f3` | Input fills |
| textDark | `#1c1917` | Primary text |
| textMid | `#78716c` | Secondary text |
| tagGreen | `#dcfce4` | Green tag background |
| tagAmber | `#fef3c7` | Amber tag background |

Font: **Inter** (400–800 weights)

---

## Critical Implementation Rules

### API — always include Accept header
```ts
headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
```
Without it, Laravel returns 302 redirect instead of JSON.

### Timezone — never use .toISOString()
```ts
// Store locally (for display):
const toLocalSlice = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Send to API (with offset):
const toLocalISO = (val: string) => {
  const d = new Date(val);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const hh = pad(Math.floor(Math.abs(off) / 60));
  const mm = pad(Math.abs(off) % 60);
  return `${val}:00${sign}${hh}:${mm}`;
};
```

### Notifications — cursor pagination
```
First page:  GET /notifications?cursor=true&per_page=15
Next pages:  GET /notifications?cursor=<next_cursor token>
Response:    data.items, data.unread_count, data.meta.next_cursor, data.meta.has_more
```

### Map — current architecture
- `MapPickerView` uses WebView + Leaflet (works in Expo Go)
- Props: `lat`, `lng`, `onPinChange(lat, lng)`, `style`
- To swap to react-native-maps: replace WebView block in `MapPickerView.tsx` only — all parents stay the same
- See migration comment in the file

### Location search
- Uses Photon (Komoot) — `https://photon.komoot.io/api/?q=...&bbox=80.058,26.347,88.201,29.305`
- Nepal bbox baked in, no API key needed
- Reverse geocode: `https://photon.komoot.io/reverse?lon=...&lat=...&limit=1`

### Photo upload
```ts
// Upload immediately on select, before form submit
const formData = new FormData();
formData.append('photo', { uri, name: 'photo.jpg', type: 'image/jpeg' });
const res = await shared.uploadPhoto(formData); // includes Accept + Auth headers
const url = res?.data?.url || res?.url;
```

### Route structure
```
app/(auth)/           ← auth screens
app/(app)/donor/      ← donor screens
app/(app)/recipient/  ← recipient screens (to be built)
```
**Never add `_layout.tsx` inside donor/ or recipient/ folders** — breaks Expo Router route discovery.

### Claim state (recipient — for when building recipient screens)
Always fetch user's existing claims on mount. Never rely on local state across navigations.
Show "Claim pending" amber bar + Cancel button when active claim exists. Show Claim button only when no active claim.

---

## Tags Enum
```
for_humans | for_animals | for_both       (Audience)
cooked | raw_ingredients | packaged       (Food State)
```
Same tags for both Create Listing AND Create Request.

---

## Listing Status Flow
```
active → claimed (donor confirms) → completed (recipient marks collected)
       → expired (auto by server)
       → cancelled (donor cancels)
```

---

## Session Resume Steps
1. Read this file for quick orientation
2. Open `docs/PROGRESS.md` — find first unchecked item (Recipient screens)
3. Check `design-reference/` for the HTML prototype of the screen you're building
4. Build, check off, repeat
