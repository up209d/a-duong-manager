import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBrand } from '@/theme';
import { ScreenHeader } from '@/components/screen-header';
import { ScreenBackground } from '@/components/ui';

// Standard pushed (non-tab) screen shell: safe-area background + header (back + title).
// Consolidates the SafeAreaView + ScreenHeader boilerplate that every detail/form screen
// used to repeat. Pass `background` for the decorative aurora layer.
export function Screen({
  title,
  right,
  background = false,
  children,
}: {
  title: string;
  right?: ReactNode;
  background?: boolean;
  children: ReactNode;
}) {
  const Brand = useBrand();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.background }}>
      {background ? <ScreenBackground /> : null}
      <ScreenHeader title={title} right={right} />
      {children}
    </SafeAreaView>
  );
}
