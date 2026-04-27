# FeedLink — Agent Instructions

## Project Overview

**FeedLink** is a food-sharing app — donors post surplus food, recipients claim it. It also supports food requests (recipients post what they need, donors offer to fulfill).

This directory is the **React Native / Expo** implementation of a design that was prototyped in HTML/CSS/JS. Read `CLAUDE.md` for full project context before starting any work.

---

## Source of Truth

The HTML prototype (in `/tmp/feedlink/project/` — extracted from design bundle) is the **pixel-level design reference**. If you need to re-extract it, the gzip bundle was fetched from the design URL. All screen layouts, spacing, colors, and UX behavior should match the prototype exactly.

## Codebase Conventions

**Read `docs/CONVENTIONS.md` before making structural changes** (new routes, folder moves, import path changes). It documents:
- Expo Router: groups `(folder)` vs regular folders, URL patterns, `<Slot />` vs `<Stack />`
- Path aliases: `@/*` → project root (use instead of relative paths)
- Folder structure rules: route files are thin re-exports from `src/screens/`
- Component, styling, API, and git conventions
- Things that break navigation (and how to fix them)

---

## Architecture

### Role-based navigation
The app has two completely separate user flows:
- **Donor flow** — post listings, manage claims, browse requests
- **Recipient flow** — browse listings, claim food, post requests

Role is stored after login (`localStorage`/`AsyncStorage` key `fl_role`). Route after login: `donor-home` or `recipient-home`.

### API pattern
All API calls follow this shape:
```json
{ "status_code": 200, "message": "...", "data": {} }
```
Always read `response.data`, not `response` directly.

Auth: `Authorization: Bearer {access_token}`. On 401, attempt refresh via `POST /auth/refresh-token` with `refresh_token`. On refresh failure, logout and redirect to login.

### Timezone handling
**CRITICAL**: Server timezone is `Asia/Kathmandu (UTC+5:45)`.
- Never use `.toISOString()` for `expires_at`, `pickup_before`, `needed_by`
- Always send local ISO with offset: `2026-04-25T20:02:00+05:45`
- Use this helper pattern:
```js
function toLocalISO(dateStr) {
  const d = new Date(dateStr);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
  const mm = String(Math.abs(off) % 60).padStart(2, '0');
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${hh}:${mm}`;
}
```

---

## Component Conventions

### Colors (`C` object / theme)
```
green: #16a34a  (brand, primary buttons, active)
amber: #f59e0b  (pending, warning)
red:   #dc2626  (destructive, error)
bg:    #fafaf9  (screen bg)
surface: #ffffff (cards)
surface2: #f5f4f3 (input fills)
textDark: #1c1917
textMid:  #78716c
```

### Cards
Soft shadow: `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)`, `border-radius: 18px`. No border.

### Inputs
Filled `surface2` background, no border, green focus ring: `box-shadow: 0 0 0 4px rgba(22,163,74,0.1)`.

### Bottom navigation
Frosted glass: `backdrop-filter: blur(16px)`, semi-transparent bg. `box-sizing: border-box` with `env(safe-area-inset-bottom)` padding.

### Tags (food type chips)
Two groups — **Audience**: for_humans / for_animals / for_both | **Food State**: cooked / raw_ingredients / packaged
Displayed as selectable chips, consistent across Create Listing AND Create Request forms.

---

## Screen-Specific Rules

### Listing claim flow (recipient)
- On mount of listing detail: fetch user's claims in parallel with listing to pre-populate claim state
- After claiming: show amber "⏳ Claim pending" status + red "Cancel my claim" button
- After donor confirms: show green "✅ Claim confirmed" + "Mark as Collected" button
- Home screen listing cards: also cross-reference claims to show correct badge (pending/confirmed) instead of "Claim" button
- **Never rely on local state across navigations** — always re-fetch on mount

### Notifications
- Poll `GET /notifications?per_page=1` every 30 seconds when logged in
- Show toast only when `unread_count` increases AND user is not on notifications screen
- Reset badge when notifications screen is opened
- Stop polling on auth screens; clear on logout

### Photo upload
1. User selects photo → immediately upload to `POST /upload/photo` (multipart)
2. Show spinner during upload; disable submit while any upload is in progress
3. On success: collect `data.url` → add to photos array
4. Max 4 photos per listing
5. Include collected URLs in `POST /donor/listings` payload

### Location picker
- Full-screen map modal with search + reverse geocoding (Nominatim / OpenStreetMap)
- "My location" GPS button
- Tap/drag marker to pin location
- Reverse geocode to `Neighbourhood, City` display format
- Saves: `latitude`, `longitude`, `address` to form state
- Used identically in Create Listing and Create Request

### Map markers
- Custom markers (food emoji + green badge)
- Tap → popup with title, quantity, address + "View listing" link that navigates to detail screen
- Used in: Donor Map (request markers), Recipient Home map tab, Recipient Map screen

---

## API Quick Reference

| Action | Method | Path |
|---|---|---|
| Register | POST | `/auth/register` |
| Login | POST | `/auth/login` |
| Verify OTP | POST | `/auth/verify-otp` |
| Logout | GET | `/auth/logout` |
| Refresh token | POST | `/auth/refresh-token` |
| Donor listings | GET/POST | `/donor/listings` |
| Donor listing detail | GET/PUT/DELETE | `/donor/listings/{id}` |
| Donor stats | GET | `/donor/stats` |
| Confirm claim | POST | `/donor/listings/{lid}/claims/{cid}/confirm` |
| Reject claim | POST | `/donor/listings/{lid}/claims/{cid}/reject` |
| Reopen listing | POST | `/donor/listings/{id}/reopen` |
| Browse requests (donor) | GET | `/donor/requests` |
| Accept request | POST | `/donor/requests/{id}/accept` |
| Nearby listings | GET | `/listings/nearby?lat=&lng=&radius=` |
| Nearby requests | GET | `/requests/nearby?lat=&lng=&radius=` |
| Recipient listings | GET | `/recipient/listings` |
| Claim listing | POST | `/recipient/listings/{id}/claim` |
| Cancel claim | DELETE | `/recipient/listings/{id}/claim` |
| Mark collected | POST | `/recipient/listings/{id}/complete` |
| My claims | GET | `/recipient/claims` |
| My requests | GET/POST | `/recipient/requests` |
| Confirm acceptance | POST | `/recipient/requests/{rid}/acceptances/{aid}/confirm` |
| Upload photo | POST | `/upload/photo` (multipart) |
| Get profile | GET | `/user/profile` |
| Update profile | PUT | `/user/profile` |
| Update location | PUT | `/user/location` |
| Device token | POST | `/user/device-token` |
| Notifications | GET | `/notifications?page=N&per_page=15` |
| Mark read | PUT | `/notifications/{id}/read` |
| Mark all read | PUT | `/notifications/read-all` |

---

## Tags Enum
`for_humans` | `for_animals` | `for_both` | `cooked` | `raw_ingredients` | `packaged`

## Listing Status Enum
`active` → `claimed` → `completed` | `expired` | `cancelled`

## Claim Status Enum
`pending` → `confirmed` | `rejected`
