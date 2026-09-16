import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { API } from '@/api/client';
import { useBrand } from '@/theme';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Button, Card, Field } from '@/components/ui';
import { CategorySelectModal } from '@/components/category-picker';

type PriceRow = { label: string; amount: string };

export function ProductForm({
  productId,
  onDone,
}: {
  productId?: number;
  onDone: (savedId: number, again: boolean) => void;
}) {
  const Brand = useBrand();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [skuAlias, setSkuAlias] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [unit, setUnit] = useState('');
  const [subUnit, setSubUnit] = useState('');
  const [subRatio, setSubRatio] = useState('1');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [minStock, setMinStock] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [prices, setPrices] = useState<PriceRow[]>([{ label: 'Giá cơ bản', amount: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [catModal, setCatModal] = useState(false);

  useEffect(() => {
    if (productId) {
      API.getProduct(productId).then((r) => {
        if (!r.ok) return;
        const p = r.data;
        setName(p.name);
        setSku(p.sku);
        setSkuAlias(p.sku_alias || '');
        setCategories(Array.isArray(p.categories) ? p.categories : p.category ? [p.category] : []);
        setUnit(p.unit || '');
        setSubUnit(p.sub_unit || '');
        setSubRatio(String(p.sub_unit_ratio || 1));
        setCostPrice(String(p.cost_price || ''));
        setSellingPrice(String(p.selling_price || ''));
        setMinStock(String(p.min_stock_alert || ''));
        setStockQty(String(p.stock_quantity || ''));
        if (p.prices?.length) {
          setPrices(p.prices.map((x: any) => ({ label: x.label, amount: String(x.amount) })));
        }
      });
    }
  }, [productId]);

  function setPrice(i: number, patch: Partial<PriceRow>) {
    setPrices((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  async function save(again: boolean) {
    if (!name.trim()) {
      setError(t('product_name') + ' - ' + t('required'));
      return;
    }
    setSaving(true);
    setError('');
    const body = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      sku_alias: skuAlias.trim() || null,
      categories,
      unit: unit.trim() || null,
      sub_unit: subUnit.trim() || null,
      sub_unit_ratio: parseInt(subRatio, 10) || 1,
      cost_price: parseInt(costPrice, 10) || 0,
      selling_price: parseInt(sellingPrice, 10) || 0,
      min_stock_alert: parseInt(minStock, 10) || 0,
      stock_quantity: parseInt(stockQty, 10) || 0,
      prices: prices
        .filter((p) => p.label.trim() && p.amount.trim())
        .map((p) => ({ label: p.label.trim(), amount: parseInt(p.amount, 10) || 0 })),
    };
    const r = productId
      ? await API.updateProduct(productId, body)
      : await API.createProduct(body);
    setSaving(false);
    if (!r.ok) {
      setError(r.error === 'sku_exists' ? `${t('sku')} \u00D7` : r.error);
      return;
    }
    onDone(r.data.id, again);
  }

  const styles = {
    cardTitle: { fontSize: 16, fontWeight: '700' as const, color: Brand.foreground, marginBottom: 10 },
    error: { color: Brand.destructive, fontWeight: '600' as const, marginBottom: 10 },
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Card style={{ marginBottom: 12 }}>
        <Field label={t('product_name')} value={name} onChangeText={setName} required />
        <Field label={t('sku')} value={sku} onChangeText={setSku} placeholder="12365225428" />
        <Field label={t('sku_alias')} value={skuAlias} onChangeText={setSkuAlias} />
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Pressable
          onPress={() => setCatModal(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Brand.muted,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Brand.border,
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 12.5, color: Brand.mutedForeground, marginBottom: 2 }}>
              {t('category')}
            </Text>
            {categories.length > 0 ? (
              <Text style={{ fontSize: 15, fontWeight: 600, color: Brand.foreground }}>
                {categories.join(', ')}
              </Text>
            ) : (
              <Text style={{ fontSize: 15, color: Brand.mutedForeground }}>
                {t('select_categories')}
              </Text>
            )}
          </View>
          <Icon name="forward" size={18} color={Brand.mutedForeground} />
        </Pressable>
      </Card>

      <CategorySelectModal
        visible={catModal}
        initial={categories}
        onClose={() => setCatModal(false)}
        onConfirm={(names) => setCategories(names)}
      />

      <Card style={{ marginBottom: 12 }}>
        <Field label={t('unit')} value={unit} onChangeText={setUnit} placeholder="Chai, Hộp, Kg..." />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field label={t('sub_unit')} value={subUnit} onChangeText={setSubUnit} placeholder="Cái" />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label={t('sub_unit_ratio')}
              value={subRatio}
              onChangeText={setSubRatio}
              keyboardType="numeric"
            />
          </View>
        </View>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Field
          label={t('cost_price')}
          value={costPrice}
          onChangeText={setCostPrice}
          keyboardType="numeric"
          suffix={'\u20AB'}
        />
        <Field
          label={t('selling_price')}
          value={sellingPrice}
          onChangeText={setSellingPrice}
          keyboardType="numeric"
          suffix={'\u20AB'}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field
              label={t('min_stock')}
              value={minStock}
              onChangeText={setMinStock}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label={t('stock')}
              value={stockQty}
              onChangeText={setStockQty}
              keyboardType="numeric"
            />
          </View>
        </View>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Text style={styles.cardTitle}>{t('selling_prices')}</Text>
        {prices.map((p, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
            <View style={{ flex: 2 }}>
              <Field label={t('price_label')} value={p.label} onChangeText={(v) => setPrice(i, { label: v })} />
            </View>
            <View style={{ flex: 2 }}>
              <Field
                label={t('price_amount')}
                value={p.amount}
                onChangeText={(v) => setPrice(i, { amount: v })}
                keyboardType="numeric"
              />
            </View>
            {prices.length > 1 ? (
              <Pressable
                onPress={() => setPrices((rows) => rows.filter((_, j) => j !== i))}
                hitSlop={8}
                style={{ marginBottom: 12, paddingHorizontal: 6 }}>
                <Icon name="close" size={20} color={Brand.destructive} />
              </Pressable>
            ) : null}
          </View>
        ))}
        <Pressable
          onPress={() => setPrices((rows) => [...rows, { label: '', amount: '' }])}
          style={{
            borderRadius: 10,
            borderWidth: 1.5,
            borderColor: Brand.border,
            paddingVertical: 10,
            alignItems: 'center',
          }}>
          <Text style={{ color: Brand.mutedForeground, fontWeight: 600 }}>+ {t('add_price_row')}</Text>
        </Pressable>
      </Card>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Button label={t('save')} onPress={() => save(false)} disabled={saving} />
        </View>
        {!productId ? (
          <View style={{ flex: 1 }}>
            <Button label={t('save_and_new')} variant="outline" onPress={() => save(true)} disabled={saving} />
          </View>
        ) : null}
      </View>
      {productId ? (
        <Pressable
          onPress={() => {
            Alert.alert(t('confirm_delete'), t('delete'), [
              { text: t('cancel'), style: 'cancel' },
              {
                text: t('delete'),
                style: 'destructive',
                onPress: async () => {
                  const r = await API.deleteProduct(productId);
                  if (r.ok) onDone(productId, false);
                },
              },
            ]);
          }}
          style={{ alignItems: 'center', marginTop: 16, padding: 8 }}>
          <Text style={{ color: Brand.destructive, fontWeight: 600 }}>{t('delete')}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

