import { Tabs } from 'expo-router';

import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';

export default function TabsLayout() {
  const Brand = useBrand();
  const { t } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.accent,
        tabBarInactiveTintColor: Brand.mutedForeground,
        tabBarStyle: { backgroundColor: Brand.card, borderTopColor: Brand.border, height: 52 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 15 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tab_home'),
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name="home" size={size || 22} color={String(color || (focused ? Brand.accent : Brand.mutedForeground))} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t('tab_products'),
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name="products" size={size || 22} color={String(color || (focused ? Brand.accent : Brand.mutedForeground))} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tab_history'),
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name="history" size={size || 22} color={String(color || (focused ? Brand.accent : Brand.mutedForeground))} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t('tab_more'),
          tabBarIcon: ({ focused, color, size }) => (
            <Icon name="more" size={size || 22} color={String(color || (focused ? Brand.accent : Brand.mutedForeground))} />
          ),
        }}
      />
    </Tabs>
  );
}
