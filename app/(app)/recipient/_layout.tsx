import React from 'react';
import { Stack } from 'expo-router';

export default function RecipientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="listing-detail" />
      <Stack.Screen name="my-claims" />
      <Stack.Screen name="map" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="request-detail" />
      <Stack.Screen name="create-request" />
    </Stack>
  );
}
