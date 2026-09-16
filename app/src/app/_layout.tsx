import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { I18nProvider } from '@/i18n';
import { ThemeProvider } from '@/theme';
import { IconProvider } from '@/icons';

SplashScreen.preventAutoHideAsync();

// Web: set title + favicon (Expo does not inject these from app.json in dev)
function useWebChrome() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const doc = document;
    doc.title = 'A+Manager';
    let link = doc.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = doc.createElement('link');
      link.rel = 'icon';
      doc.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = '/favicon.png';
  }, []);
}

export default function RootLayout() {
  useWebChrome();
  return (
    <I18nProvider>
      <ThemeProvider>
        <IconProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
        </IconProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
