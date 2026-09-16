import { useCallback, useEffect, useState } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { money, num } from '@/lib/format';
import { useI18n } from '@/i18n';
import { Button, Card, EmptyState } from '@/components/ui';

type Product = {
  id: number;
  sku: string;
  name: string;
  categories: string[];
  unit: string | null;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock_alert: number;
};

type Cat = { id: number; name: string; product_count: number };

export default function ProductsScreen() {
  const Brand = useBrand();
  const { t } = useI18n();
  const [q, setQ] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [catFilter, setCatFilter] = useState('');
  const [cats, setCats] = useState<Cat[]>([]);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadCats = useCallback(() => {
    API.listCategories().then((r) => r.ok && setCats(r.data));
  }, []);

  useEffect(() => {
    loadCats();
  }, [loadCats]);

  const load = useCallback(() => {
    API.listProducts(q, catFilter || undefined, lowOnly).then((r) => {
      if (r.ok) {
        setItems(r.data.items);
        setTotal(r.data.total);
      }
      setRefreshing(false);
    });
  }, [q, catFilter, lowOnly]);

  useEffect(() => {
    load();
  }, [load]);

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
    searchRow: { flexDirection: 'row' as const, padding: 16, paddingBottom: 8, gap: 8 },
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
    chip: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Brand.border,
      backgroundColor: Brand.card,
      paddingHorizontal: 12,
      justifyContent: 'center' as const,
    },
    chipText: { fontSize: 13, color: Brand.mutedForeground },
    catRow: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 4,
      alignItems: 'center' as const,
    },
    catChip: {
      borderRadius: 14,
      borderWidth: 1.5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignSelf: 'flex-start' as const,
    },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Brand.background }}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('tab_products')}</Text>
        <Text style={styles.count}>
          {total} {t('products').toLowerCase()}
        </Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={Brand.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, paddingVertical: 10, fontSize: 15, color: Brand.foreground }}
            placeholder={t('search_products')}
            placeholderTextColor={Brand.mutedForeground}
            value={q}
            onChangeText={setQ}
          />
        </View>
        <Pressable
          onPress={() => setLowOnly((v) => !v)}
          style={[
            styles.chip,
            lowOnly && { backgroundColor: Brand.warning + '22', borderColor: Brand.warning },
          ]}>
          <Text
            style={[
              styles.chipText,
              lowOnly && { color: Brand.warning, fontWeight: 700 },
            ]}>
            {t('low_stock')}
          </Text>
        </Pressable>
      </View>

      {/* Category filter chips */}
      {cats.length > 0 ? (
        <View style={styles.catRow}>
          <Pressable
            onPress={() => setCatFilter('')}
            style={[
              styles.catChip,
              {
                backgroundColor: !catFilter ? Brand.accent + '1A' : Brand.card,
                borderColor: !catFilter ? Brand.accent : Brand.border,
              },
            ]}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: !catFilter ? 700 : 500,
                color: !catFilter ? Brand.accent : Brand.foreground,
              }}>
              {t('all_categories')}
            </Text>
          </Pressable>
          {cats.map((c) => {
            const on = catFilter === c.name;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCatFilter(on ? '' : c.name)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: on ? Brand.accent + '1A' : Brand.card,
                    borderColor: on ? Brand.accent : Brand.border,
                  },
                ]}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: on ? 700 : 500,
                    color: on ? Brand.accent : Brand.foreground,
                  }}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          icon="products"
          text={t('no_products')}
          actionLabel={t('add_product')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => String(p.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          ListHeaderComponent={
            <Link href="/product-new" asChild>
              <Button label={`+ ${t('add_product')}`} variant="accent" style={{ marginBottom: 12 }} />
            </Link>
          }
          renderItem={({ item }) => {
            const low = item.stock_quantity <= item.min_stock_alert;
            return (
              <Link href={`/product/${item.id}` as any} asChild>
                <Card style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text
                        style={{
                          fontSize: 15.5,
                          fontWeight: 700,
                          color: Brand.foreground,
                        }}>
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 12.5, color: Brand.mutedForeground, marginTop: 2 }}>
                        {item.sku}
                        {item.categories && item.categories.length
                          ? ` \u00B7 ${item.categories.length > 2
                              ? item.categories.slice(0, 2).join(', ') + ` +${item.categories.length - 2}`
                              : item.categories.join(', ')}`
                          : ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: low ? Brand.destructive : Brand.accent,
                        }}>
                        {num(item.stock_quantity)} {item.unit || ''}
                      </Text>
                      <Text style={{ fontSize: 12.5, color: Brand.mutedForeground, marginTop: 2 }}>
                        {money(item.selling_price)}
                      </Text>
                    </View>
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


