import { Pressable, Text, View } from 'react-native';

import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { useGoBack } from '@/lib/useGoBack';

/**
 * Standard header for pushed (non-tab) screens: back button + title (+ optional right slot).
 * Tab screens do NOT use this (they have the bottom tab bar instead).
 */
export function ScreenHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  const Brand = useBrand();
  const goBack = useGoBack();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingBottom: 6 }}>
      <Pressable
        onPress={goBack}
        hitSlop={12}
        aria-label="back"
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: Brand.muted,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
        <Icon name="back" size={22} color={Brand.foreground} />
      </Pressable>
      <Text
        numberOfLines={1}
        style={{ flex: 1, fontSize: 21, fontWeight: 800, color: Brand.foreground }}>
        {title}
      </Text>
      {right ? <View>{right}</View> : null}
    </View>
  );
}
