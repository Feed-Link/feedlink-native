# FeedLink — Tech Stack

## Target: React Native iOS + Android (NOT PWA/web)
- Framework: Expo (managed workflow)
- Navigation: React Navigation (stack + bottom tabs)
- Maps: react-native-maps (Google Maps on Android, Apple Maps on iOS)
- Location: expo-location
- Storage: AsyncStorage (tokens, user role)
- HTTP: fetch API
- Icons: @expo/vector-icons or lucide-react-native
- Font: Inter via @expo-google-fonts/inter
- Safe areas: react-native-safe-area-context (SafeAreaView / useSafeAreaInsets)
- Image picker: expo-image-picker

## Commands (once scaffolded)
```
npx expo start            # dev server (Expo Go)
npx expo run:android      # Android native build
npx expo run:ios          # iOS native build
eas build --platform ios  # EAS cloud build iOS
eas build --platform android  # EAS cloud build Android
```

## Key Dependencies to install
- @react-navigation/native
- @react-navigation/stack
- @react-navigation/bottom-tabs
- react-native-screens
- react-native-safe-area-context
- @react-native-async-storage/async-storage
- react-native-maps
- expo-location
- expo-image-picker
- @expo-google-fonts/inter
