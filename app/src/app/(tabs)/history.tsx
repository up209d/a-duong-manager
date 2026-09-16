import { useCallback, useEffect, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { money } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Card, EmptyState } from '@/components/ui';

type Tx = {
  id: number;
  code: string;
  type: 'IMPORT' | 'EXPORT';
  entity_name: string | null;
  total_amount: number;
  paid_amount: number;
  created_at: string;
};

export default function HistoryScreen() {
  const Brand = useBrand();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ type?: string }>();
  const [type, setType] = useState<string>(params.type || 'ALL');
  const [items, setItems] = useState<Tx[]>([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (params.type) setType(params.type);
  }, [params.type]);

  const load = useCallback(() => {
    API.listTransactions({ type: type === 'ALL' ? '' : type }).then((r) => {
      if (r.ok) {
        setItems(r.data.items);
        setTotal(r.data.total);
      }
      setRefreshing(false);
    });
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  const filters = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'EXPORT', label: t('stock_out') },
    { key: 'IMPORT', label: t('stock_in') },
  ];

  const styles = {
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    title: { fontSize: 24, fontWeight: '800' as const, color: Brand.foreground },
    count: { fontSize: 13, color: Brand.mutedForeground },
    chip: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Brand.border,
      backgroundColor: Brand.card,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    chipText: { fontSize: 13, color: Brand.mutedForeground },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.background }}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tab_history')}</Text>
        <Text style={styles.count}>{total}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 8 }}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setType(f.key)}
            style={[
              styles.chip,
              type === f.key && { backgroundColor: Brand.primary, borderColor: Brand.primary },
            ]}>
            <Text
              style={[
                styles.chipText,
                type === f.key && { color: '#FFFFFF', fontWeight: 700 },
              ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {items.length === 0 ? (
        <EmptyState icon="orders" text={t('no_data')} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(x) => String(x.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          renderItem={({ item }) => {
            const isExport = item.type === 'EXPORT';
            const paid = item.paid_amount >= item.total_amount;
            return (
              <Link href={`/transaction/${item.id}` as any} asChild>
                <Card style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      backgroundColor: (isExport ? Brand.destructive : Brand.accent) + '14',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}>
                    <Icon name={isExport ? 'stock_out' : 'stock_in'} size={22} color={isExport ? Brand.destructive : Brand.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: 800, color: Brand.foreground }}>
                      {item.code}
                    </Text>
                    <Text style={{ fontSize: 12.5, color: Brand.mutedForeground, marginTop: 2 }}>
                      {item.entity_name || t('walk_in')} {'\u00B7'} {item.created_at.slice(0, 10)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: isExport ? Brand.destructive : Brand.accent,
                      }}>
                      {money(item.total_amount)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: paid ? Brand.accent : Brand.warning,
                        marginTop: 2,
                      }}>
                      {paid ? t('status_paid') : t('status_partial')}
                    </Text>
                  </View>
                </Card>
              </Link>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}


