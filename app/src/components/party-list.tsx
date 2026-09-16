import { useCallback, useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { money } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Button, Card, EmptyState } from '@/components/ui';
import { Screen } from '@/components/screen';

type Party = { id: number; name: string; phone: string | null; current_debt: number };

export function PartyList({ kind }: { kind: 'customers' | 'suppliers' }) {
  const Brand = useBrand();
  const { t } = useI18n();
  const router = useRouter();
  const isCustomer = kind === 'customers';
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Party[]>([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    const fn = isCustomer ? API.listCustomers : API.listSuppliers;
    fn(q).then((r) => {
      if (r.ok) {
        setItems(r.data.items);
        setTotal(r.data.total);
      }
      setRefreshing(false);
    });
  }, [q, isCustomer]);

  useEffect(() => {
    load();
  }, [load]);

  const title = isCustomer ? t('customers') : t('suppliers');
  const addLabel = isCustomer ? t('add_customer') : t('add_supplier');

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
    searchRow: { flexDirection: 'row' as const, padding: 16, paddingBottom: 8 },
    searchBox: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: Brand.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Brand.border,
      paddingHorizontal: 12,
    },
  };

  return (
    <Screen title={title} background right={<Text style={styles.count}>{total}</Text>}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={Brand.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, paddingVertical: 10, fontSize: 15, color: Brand.foreground }}
            placeholder={t('search_by_name')}
            placeholderTextColor={Brand.mutedForeground}
            value={q}
            onChangeText={setQ}
          />
        </View>
      </View>

      {items.length === 0 ? (
        <EmptyState
          icon={isCustomer ? 'customer' : 'supplier'}
          text={t('no_data')}
          actionLabel={addLabel}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => String(p.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          ListHeaderComponent={
            <Button
              label={`+ ${addLabel}`}
              variant="accent"
              style={{ marginBottom: 12 }}
              onPress={() => router.push(isCustomer ? '/customer-new' : '/supplier-new')}
            />
          }
          renderItem={({ item }) => (
            <Card
              style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => router.push((isCustomer ? `/customer/${item.id}` : `/supplier/${item.id}`) as any)}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: (isCustomer ? Brand.accent : Brand.secondary) + '14',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                <Text style={{ fontSize: 18, color: isCustomer ? Brand.accent : Brand.secondary }}>
                  {item.name.slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15.5, fontWeight: 700, color: Brand.foreground }}>
                  {item.name}
                </Text>
                {item.phone ? (
                  <Text style={{ fontSize: 12.5, color: Brand.mutedForeground, marginTop: 2 }}>
                    {item.phone}
                  </Text>
                ) : null}
              </View>
              {item.current_debt > 0 ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 14.5, fontWeight: 800, color: Brand.destructive }}>
                    {money(item.current_debt)}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: Brand.destructive, opacity: 0.7 }}>
                    {isCustomer ? t('receivables') : t('payables')}
                  </Text>
                </View>
              ) : null}
            </Card>
          )}
        />
      )}
    </Screen>
  );
}


