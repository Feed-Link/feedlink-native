# FeedLink — Codebase Conventions

Rules discovered through building the project. Read this before making structural changes.

---

## Expo Router (CRITICAL)

### Groups vs Regular Folders

- **Groups** `(folder)` — names in parentheses are **excluded from URLs**.
  - `app/(auth)/login.tsx` → accessible at `/login` (NOT `/auth/login`)
  - Use groups to organize routes without affecting the URL.

- **Regular folders** — names are **included in URLs**.
  - `app/donor/home.tsx` → accessible at `/donor/home`
  - `app/recipient/home.tsx` → accessible at `/recipient/home`

### Navigation Paths

Always match the URL to the folder structure, NOT the group name:

```tsx
// (auth) group: routes are at /login, /register, etc. (no /auth/ prefix)
router.push('/login' as any);     // ✅ correct
router.push('/auth/login' as any); // ❌ wrong — "unmatched route"

// Regular folders: routes include folder name
router.replace('/donor/home' as any);     // ✅ correct
router.replace('/home' as any);          // ❌ wrong
```

### Auto-Discovery with `<Slot />`

- Root layout (`app/_layout.tsx`) should use `<Slot />` (not `<Stack />`) when using multiple route groups/folders alongside auto-discovery.
- Group layouts (`app/(auth)/_layout.tsx`) use `<Stack screenOptions={{ headerShown: false }} />` with explicit `<Stack.Screen>` components.

---

## Path Aliases

`tsconfig.json` defines `@/*` → project root:

```json
"paths": { "@/*": ["./*"] }
```

Usage:
```tsx
import { C } from '@/src/theme';                       // ✅ alias
import ScreenHeader from '../../../src/components/ScreenHeader';  // ❌ avoid
```

**Always use `@/` aliases** for imports from `src/`. Never use relative paths beyond one level.

---

## Folder Structure Rules

```
app/
  (auth)/          ← GROUP: routes at /login, /register, /splash, etc.
    _layout.tsx     ← Stack with all auth screens listed
    login.tsx       ← route file, just re-exports from src/screens/auth/
  donor/           ← REGULAR: routes at /donor/home, /donor/listings, etc.
    _layout.tsx     ← Stack layout for donor screens
    home.tsx
  recipient/       ← REGULAR: routes at /recipient/home, etc.
    _layout.tsx
    home.tsx
  _layout.tsx         ← Root layout: AppProvider + Slot

src/
  api/               ← API client, endpoint modules
  components/        ← Shared UI components (Btn, Input, etc.)
  screens/           ← Screen components, organized by section
    auth/             ← Auth screens (Splash, Onboarding, etc.)
    donor/            ← Donor screens
    recipient/         ← Recipient screens
  context/           ← React contexts (AppContext)
  hooks/             ← Custom hooks (useToast, etc.)
  theme.ts            ← Colors, typography
```

### Route Files are Thin Re-exports

Each `app/` route file is a thin wrapper that re-exports the real screen from `src/screens/`:

```tsx
// app/(auth)/login.tsx
import LoginScreen from '../../src/screens/auth/LoginScreen';
export default LoginScreen;
```

The real component lives in `src/screens/` — never put screen logic directly in `app/`.

---

## Component Conventions

### Styling
- Use inline styles (not StyleSheet.create) unless reusing styles across many components
- Use `C.*` constants from `@/src/theme` for all colors
- Font family: Inter via `@expo-google-fonts/inter`, weights: 400/500/600/700/800
- Never use `StyleSheet.create` for one-off styles

### Safe Areas
- All screens must use `useSafeAreaInsets()` from `react-native-safe-area-context`
- ScreenHeader already handles top inset — use it on every screen
- Don't use React Native's `SafeAreaView` (deprecated, use the expo-safe-area-context package)

### Forms
- Use `Input` component from `@/src/components/Input` for text inputs
- Use `Btn` component from `@/src/components/Btn` for all buttons
- Validation errors → `showToast(msg, 'error')` from AppContext
- Password fields → `secureTextEntry` prop

---

## API Conventions

### Client (`src/api/client.ts`)
- Base URL: `https://api.feedlink.tech/api`
- All responses: `{ status_code, message, data }` — always read `response.data`
- Auth header: `Authorization: Bearer {access_token}`
- Token storage: AsyncStorage keys `fl_access_token`, `fl_refresh_token`, `fl_role`, `fl_user`

### Auth Flow
- `POST /auth/register` → returns `email` in data (NOT token)
- `POST /auth/verify-otp` → returns tokens on success
- `POST /auth/login` → returns `202 Accepted` + tokens
- If login fails with "not verified" → auto-call resend-otp → navigate to verify-otp with `context: 'login'`

---

## Expo Server

### After Structural Changes
After creating new folders in `app/` or renaming routes, **always restart the Expo server**:
```
Ctrl+C  (stop server)
npx expo start --clear  (restart with cleared cache)
```

The Metro bundler does NOT auto-detect new route folders on Windows without a restart.

---

## Git Conventions

- Commit messages: `feat:`, `fix:`, `docs:`, `refactor:` prefixes
- Co-author: `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`
- Check off items in `docs/PROGRESS.md` as they're completed
- Use `git commit -a` for quick commits, `git add -A` when new files are added

---

## Things That Break Navigation

1. **Using group name in URL** — `(auth)/login.tsx` is at `/login`, NOT `/auth/login`
2. **Not restarting Expo server** after adding new route folders
3. **Using relative imports** instead of `@/` aliases (breaks on refactors)
4. **Putting screen logic in `app/` files** — always re-export from `src/screens/`
5. **Forgetting `as any`** cast on `router.push()` / `router.replace()` with Expo Router
