# FeedLink — Critical UX Decisions

## Claim button state (recipient)
After claiming a listing, show "⏳ Claim pending" amber bar + "Cancel my claim" red button.
"Claim" button only shows when no active claim exists.
**Always fetch existing claims on mount** — never rely on local state across navigations.
Home screen cards: cross-reference claims to show pending/confirmed badge vs Claim button.

## Notification polling
Poll GET /notifications?per_page=1 every 30 seconds when logged in.
Show toast only when unread_count increases AND user is not on notifications screen.
Reset badge when notifications screen opened. Stop on auth screens, clear on logout.

## Photo upload
Upload each photo immediately on selection to POST /upload/photo (multipart).
Show spinner; disable submit while upload in progress. Max 4 photos per listing.
Collect returned URLs → include in POST /donor/listings payload.

## Location picker
Full-screen map modal: search (Nominatim/OSM) + reverse geocode + "My location" GPS.
Resolves to "Neighbourhood, City" format. Saves latitude, longitude, address.
Used identically in Create Listing AND Create Request.

## Timezone (CRITICAL)
Server is Asia/Kathmandu (UTC+5:45). NEVER use .toISOString() for expires_at, pickup_before, needed_by.
Always send local ISO with offset: "2026-04-25T20:02:00+05:45"

## OTP on login
If login fails with email-not-verified error: auto-call resendOtp, show toast, navigate to verify-otp with context:'login'.

## Map markers
Custom emoji markers (🍱) with green badge. Tap → popup with title/quantity/address + navigate to detail.
