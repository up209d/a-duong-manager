import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBrand } from '@/theme';
import { useI18n } from '@/i18n';
import { Card, SectionRow } from '@/components/ui';

export default function MoreScreen() {
  const Brand = useBrand();
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const styles = {
    title: { fontSize: 24, fontWeight: '800' as const, color: Brand.foreground, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700' as const, color: Brand.foreground, marginBottom: 10 },
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={styles.title}>{t('tab_more')}</Text>

        <SectionRow
          icon="customer"
          title={t('customers')}
          subtitle={t('receivables')}
          onPress={() => router.push('/customers')}
        />
        <SectionRow
          icon="supplier"
          title={t('suppliers')}
          subtitle={t('payables')}
          tint={Brand.secondary}
          onPress={() => router.push('/suppliers')}
        />
        <SectionRow
          icon="debt"
          title={t('debt_mgmt')}
          subtitle={t('payment_records')}
          tint={Brand.warning}
          onPress={() => router.push('/debts')}
        />
        <SectionRow
          icon="report"
          title={t('reports')}
          subtitle={t('period_report')}
          onPress={() => router.push('/reports')}
        />
        <SectionRow
          icon="settings"
          title={t('settings')}
          subtitle={t('theme_and_icons')}
          tint={Brand.mutedForeground}
          onPress={() => router.push('/settings')}
        />

        <Card style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>{t('language')}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['vi', 'en'] as const).map((l) => (
              <Card
                key={l}
                onPress={() => setLang(l)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderColor: lang === l ? Brand.accent : Brand.border,
                  borderWidth: lang === l ? 2 : 1,
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: lang === l ? Brand.accent : Brand.foreground,
                  }}>
                  {l === 'vi' ? 'Ti\u1EBFng Vi\u1EC7t' : 'English'}
                </Text>
              </Card>
            ))}
          </View>
        </Card>

        <Text style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: Brand.mutedForeground }}>
          {t('app_name')} {'\u00B7'} {t('version')} 0.1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}


