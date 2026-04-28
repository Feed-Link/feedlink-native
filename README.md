# FeedLink

A food-sharing mobile app connecting donors with surplus food to recipients in need. Built with React Native + Expo.

---

## Try the App

**Preview:** https://expo.io/@samhubby/feedlink-app

Open this link in the **Expo Go** app on any device (iOS/Android). Updates deploy automatically on every push to `main`.

---

## Setup

```bash
npm install
npx expo start
```

Open in Android emulator, iOS simulator, or Expo Go.

## Tech Stack

- **Framework:** Expo (managed workflow)
- **Routing:** Expo Router (file-based)
- **State:** React Context + AsyncStorage
- **Maps:** WebView + Leaflet (swap-ready for react-native-maps)
- **Fonts:** Inter (Google Fonts)
- **Icons:** @expo/vector-icons

## Project Structure

```
app/              — Route files (Expo Router)
  (auth)/         — Auth screens
  (app)/donor/    — Donor screens
  (app)/recipient/# Recipient screens (to build)
src/
  api/            — API client & endpoint modules
  components/     — Shared UI components
  context/        — AppContext (auth, polling, toast)
  screens/        — Screen components
  theme.ts        — Colors, spacing, typography
```

## API

- **Base URL:** `https://api.feedlink.tech/api`
- **Auth:** Laravel Passport (Bearer token)
- **Roles:** `donor` | `recipient`

See `docs/CLAUDE.md` for full API reference, screen inventory, and UX decisions.

## CI/CD

Every push to `main` automatically triggers:
- **GitHub Actions CI** — TypeScript type check
- **EAS Update** — New preview link published to Expo

To manually publish an update:

```bash
npm install -g eas-cli
eas update --branch preview
```

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Auto-deploys preview via EAS Update |
| `preview` | Stable preview build |