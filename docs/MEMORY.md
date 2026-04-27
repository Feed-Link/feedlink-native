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

## Where Things Live

| Path | What it is |
|---|---|
| `CLAUDE.md` | Full context — colors, screen list, API reference, UX decisions |
| `AGENTS.md` | Agent-facing implementation guide — conventions, rules, API table |
| `Progress.md` | Build checklist + folder structure + resume guide |
| `memory.md` | This file — quick reference |
| `design-reference/index.html` | Full compiled HTML prototype (source of truth for UI) |
| `design-reference/js/shared.jsx` | Shared components (colors, cards, inputs, nav) |
| `design-reference/js/auth.jsx` | Auth screens source |
| `design-reference/js/donor.jsx` | Donor screens source |
| `design-reference/js/recipient.jsx` | Recipient screens source |
| `design-reference/js/api.js` | API client (all endpoints, token refresh logic) |
| `design-reference/uploads/API_DOC.md` | Full API documentation |

---

## Color Palette (quick ref)

| Name | Value | Use |
|---|---|---|
| green | `#16a34a` | Brand, primary buttons |
| amber | `#f59e0b` | Pending / warning |
| red | `#dc2626` | Destructive / error |
| bg | `#fafaf9` | Screen background |
| surface | `#ffffff` | Cards |
| surface2 | `#f5f4f3` | Input fills |
| textDark | `#1c1917` | Primary text |
| textMid | `#78716c` | Secondary text |

Font: **Inter** (400–800)

---

## Critical Implementation Rules

### Timezone
Never use `.toISOString()` for `expires_at`, `pickup_before`, `needed_by`.
Send local ISO with offset: `2026-04-25T20:02:00+05:45`

```ts
function toLocalISO(dateStr: string): string {
  const d = new Date(dateStr);
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0');
  const mm = String(Math.abs(off) % 60).padStart(2, '0');
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${hh}:${mm}`;
}
```

### Claim state (recipient)
Always fetch user's claims on mount — never rely on local state across navigations.
After claiming: show "⏳ Claim pending" + Cancel button. Claim button only when no active claim.

### Photo upload
Upload each photo immediately on selection → `POST /upload/photo` (multipart) → collect URL → include in listing payload. Max 4 photos.

### Notifications
Poll `GET /notifications?per_page=1` every 30s. Toast only when unread_count increases and not on notifications screen. Reset badge when screen opens.

### Login → unverified email
If login fails with "not verified" error → auto call resendOtp → navigate to verify-otp with `context: 'login'`.

### API response shape
All responses: `{ status_code, message, data }`. Always read `response.data`.

---

## Tags Enum
```
for_humans | for_animals | for_both       (Audience group)
cooked | raw_ingredients | packaged       (Food State group)
```
Same tags used in both Create Listing AND Create Request — must be visually consistent.

---

## Listing Status Flow
```
active → claimed (donor confirms) → completed (recipient marks collected)
       → expired (auto by scheduler)
       → cancelled (donor cancels)
```

---

## Screens Quick Count
- Auth: 7 screens
- Donor: 8 screens
- Recipient: 10 screens
- **Total: 25 screens**

See `Progress.md` for full checklist and build order.

---

## Session Resume Steps
1. Read this file for quick orientation
2. Open `Progress.md` — find first unchecked item
3. Open `design-reference/index.html` or the relevant `.jsx` file for the screen you're building
4. Open `design-reference/uploads/API_DOC.md` if you need endpoint details
5. Build, check off, repeat
