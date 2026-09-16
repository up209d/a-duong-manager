import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { money } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Card, ScreenBackground } from '@/components/ui';

type Summary = {
  orders: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  net_profit: number;
};

export default function HomeScreen() {
  const Brand = useBrand();
  const { t } = useI18n();
  const [s, setS] = useState<Summary | null>(null);

  useEffect(() => {
    API.summary().then((r) => r.ok && setS(r.data));
  }, []);

  const tiles = [
    { key: 'stock_in', icon: 'stock_in', href: '/import-new', tint: Brand.success },
    { key: 'stock_out', icon: 'stock_out', href: '/export-new', tint: Brand.destructive },
    { key: 'add_product', icon: 'products', href: '/product-new', tint: Brand.primary },
    { key: 'customers', icon: 'customer', href: '/customers', tint: Brand.accent },
    { key: 'suppliers', icon: 'supplier', href: '/suppliers', tint: Brand.secondary },
    { key: 'purchase_orders', icon: 'orders', href: '/history?type=IMPORT', tint: Brand.primary },
    { key: 'sale_orders', icon: 'sale', href: '/history?type=EXPORT', tint: Brand.secondary },
    { key: 'debt_mgmt', icon: 'debt', href: '/debts', tint: Brand.warning },
    { key: 'reports', icon: 'report', href: '/reports', tint: Brand.primary },
  ] as const;

  const styles = {
    content: { padding: 16, paddingBottom: 32 },
    header: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 14 },
    brand: { fontSize: 24, fontWeight: '800' as const, color: Brand.foreground },
    sectionTitle: { fontSize: 17, fontWeight: '700' as const, color: Brand.foreground, marginBottom: 10 },
    statLabel: { color: '#FFFFFFAA', fontSize: 12.5, marginBottom: 3 },
    statValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' as const },
    statValueSmall: { color: '#FFFFFFDD', fontSize: 15, fontWeight: '700' as const },
    grid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.background }}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../../../assets/images/logo-mark.png')} style={{ width: 34, height: 34, borderRadius: 9, marginRight: 10 }} />
            <Text style={styles.brand}>{t('app_name')}</Text>
          </View>
          <Link href="/settings" asChild>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: Brand.card,
                borderWidth: 1,
                borderColor: Brand.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name="settings" size={20} color={Brand.foreground} />
            </View>
          </Link>
        </View>

        {/* Today summary - gradient hero */}
        <LinearGradient
          colors={[Brand.gradient[0], Brand.gradient[1]] as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 14 }}>
          <View pointerEvents="none" style={{ position: 'absolute', top: -40, right: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#FFFFFF', opacity: 0.08 }} />
          <View pointerEvents="none" style={{ position: 'absolute', bottom: -50, left: -20, width: 130, height: 130, borderRadius: 65, backgroundColor: '#FFFFFF', opacity: 0.06 }} />
          <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Icon name="report" size={16} color="#FFFFFFCC" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFFFFFCC', fontSize: 14, fontWeight: 600 }}>
                {t('today_summary')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.statLabel}>{t('revenue')}</Text>
                <Text style={styles.statValue}>{s ? money(s.revenue) : '...'}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#FFFFFF33', marginVertical: 4 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.statLabel}>{t('profit')}</Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: s && s.gross_profit < 0 ? '#FCA5A5' : '#A7F3D0' },
                  ]}>
                  {s ? money(s.gross_profit) : '...'}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.statLabel}>{t('cogs')}</Text>
                <Text style={styles.statValueSmall}>{s ? money(s.cogs) : '...'}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#FFFFFF33', marginVertical: 2 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.statLabel}>{t('orders')}</Text>
                <Text style={styles.statValueSmall}>{s ? String(s.orders) : '...'}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick access */}
        <Card>
          <Text style={styles.sectionTitle}>{t('quick_access')}</Text>
          <View style={styles.grid}>
            {tiles.map((tile) => (
              <Link
                key={tile.key}
                href={tile.href}
                style={{ alignItems: 'center', paddingVertical: 10, flex: 1, minWidth: 96 }}
                asChild>
                <View style={{ alignItems: 'center', width: '100%' }}>
                  <View
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 16,
                      backgroundColor: tile.tint + '14',
                      borderWidth: 1,
                      borderColor: tile.tint + '22',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 6,
                    }}>
                    <Icon name={tile.icon} size={26} color={tile.tint} />
                  </View>
                  <Text style={{ fontSize: 12.5, color: Brand.foreground, textAlign: 'center' }}>
                    {t(tile.key)}
                  </Text>
                </View>
              </Link>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
