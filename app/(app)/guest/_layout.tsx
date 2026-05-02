import { Stack } from 'expo-router/stack';

export default function GuestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
  );
}