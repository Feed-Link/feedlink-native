import { Slot } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AppProvider } from '@/src/context/AppContext';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';

async function checkForUpdates() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
    }
  } catch (e) {
    // Silent fail — don't block the app
  }
}

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, error]);

  useEffect(() => {
    checkForUpdates();
  }, []);

  if (!fontsLoaded && !error) return null;

  return (
    <AppProvider>
      <StatusBar style="auto" />
      <Slot />
    </AppProvider>
  );
}
