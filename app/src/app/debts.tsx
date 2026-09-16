import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { money } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Card, EmptyState } from '@/components/ui';
import { Screen } from '@/components/screen';

type Party = { id: number; name: string; current_debt: number };

export default function DebtsScreen() {
  const Brand = useBrand();
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<'receivable' | 'payable'>('receivable');
  const [customers, setCustomers] = useState<Party[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    API.listCustomers().then((r) => r.ok && setCustomers(r.data.items.filter((c: Party) => c.current_debt > 0)));
    API.listSuppliers().then((r) => r.ok && setSuppliers(r.data.items.filter((s: Party) => s.current_debt > 0)));
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const items = tab === 'receivable' ? customers : suppliers;
  const total = items.reduce((s, p) => s + p.current_debt, 0);

  const styles = {
    title: { fontSize: 24, fontWeight: '800' as const, color: Brand.foreground, padding: 16, paddingBottom: 8 },
    chip: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Brand.border,
      backgroundColor: Brand.card,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    chipText: { fontSize: 13.5, color: Brand.mutedForeground },
  };

  return (
    <Screen title={t('debt_mgmt')}>
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 10 }}>
        <Pressable
          onPress={() => setTab('receivable')}
          style={[styles.chip, tab === 'receivable' && { backgroundColor: Brand.accent, borderColor: Brand.accent }]}>
          <Text style={[styles.chipText, tab === 'receivable' && { color: '#fff', fontWeight: 700 }]}>
            {t('receivables')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('payable')}
          style={[styles.chip, tab === 'payable' && { backgroundColor: Brand.destructive, borderColor: Brand.destructive }]}>
          <Text style={[styles.chipText, tab === 'payable' && { color: '#fff', fontWeight: 700 }]}>
            {t('payables')}
          </Text>
        </Pressable>
      </View>

      <Card style={{ marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14, color: Brand.mutedForeground }}>{t('total_debt')}</Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: tab === 'receivable' ? Brand.accent : Brand.destructive,
          }}>
          {money(total)}
        </Text>
      </Card>

      {items.length === 0 ? (
        <EmptyState icon="debt" text={t('no_data')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => String(p.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          renderItem={({ item }) => (
            <Card
              style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}
              onPress={() =>
                router.push(
                  (tab === 'receivable' ? `/customer/${item.id}` : `/supplier/${item.id}`) as any
                )
              }>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15.5, fontWeight: 700, color: Brand.foreground }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: 12.5, color: Brand.mutedForeground, marginTop: 2 }}>
                  {tab === 'receivable' ? t('collect_debt') : t('pay_debt')}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: tab === 'receivable' ? Brand.accent : Brand.destructive,
                }}>
                {money(item.current_debt)}
              </Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}


